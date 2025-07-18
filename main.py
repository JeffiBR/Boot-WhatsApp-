import os
import sys
import threading
import subprocess
import time
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta, time as dt_time
import json
import enum
import requests
import schedule
import base64
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar aplicação Flask
app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Habilitar CORS
CORS(app, origins="*")

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sistema_aviso.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar banco
db = SQLAlchemy(app)

# ==================== MODELOS ====================

class ProductType(enum.Enum):
    IPTV = "IPTV"
    VPN = "VPN"

class ClientStatus(enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    RENEWED = "renewed"
    SUSPENDED = "suspended"

class MessageStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    SCHEDULED = "scheduled"

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    product_type = db.Column(db.Enum(ProductType), nullable=False)
    plan = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Float, nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    notification_time = db.Column(db.Time, default=dt_time(9, 0))
    custom_message = db.Column(db.Text)
    status = db.Column(db.Enum(ClientStatus), default=ClientStatus.ACTIVE)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_notification_sent = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'product_type': self.product_type.value,
            'plan': self.plan,
            'value': self.value,
            'expiry_date': self.expiry_date.isoformat(),
            'notification_time': self.notification_time.strftime('%H:%M'),
            'custom_message': self.custom_message,
            'status': self.status.value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_notification_sent': self.last_notification_sent.isoformat() if self.last_notification_sent else None,
            'days_until_expiry': (self.expiry_date - datetime.now().date()).days,
            'is_expired': self.expiry_date < datetime.now().date()
        }

class MessageLog(db.Model):
    __tablename__ = 'message_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    phone = db.Column(db.String(20), nullable=False)
    message_content = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(MessageStatus), default=MessageStatus.PENDING)
    sent_at = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    whatsapp_message_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'phone': self.phone,
            'message_content': self.message_content,
            'status': self.status.value,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'error_message': self.error_message,
            'whatsapp_message_id': self.whatsapp_message_id,
            'created_at': self.created_at.isoformat()
        }

class WhatsAppConfig(db.Model):
    __tablename__ = 'whatsapp_config'
    
    id = db.Column(db.Integer, primary_key=True)
    connection_status = db.Column(db.String(20), default='disconnected')
    qr_code = db.Column(db.Text)
    session_data = db.Column(db.Text)
    auto_send_enabled = db.Column(db.Boolean, default=True)
    working_hours_start = db.Column(db.Time, default=dt_time(8, 0))
    working_hours_end = db.Column(db.Time, default=dt_time(22, 0))
    message_interval_seconds = db.Column(db.Integer, default=5)
    last_connected = db.Column(db.DateTime)
    last_disconnected = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @classmethod
    def get_or_create_config(cls):
        config = cls.query.first()
        if not config:
            config = cls()
            db.session.add(config)
            db.session.commit()
        return config
    
    def to_dict(self):
        return {
            'id': self.id,
            'connection_status': self.connection_status,
            'qr_code': self.qr_code,
            'auto_send_enabled': self.auto_send_enabled,
            'working_hours_start': self.working_hours_start.strftime('%H:%M'),
            'working_hours_end': self.working_hours_end.strftime('%H:%M'),
            'message_interval_seconds': self.message_interval_seconds,
            'last_connected': self.last_connected.isoformat() if self.last_connected else None,
            'last_disconnected': self.last_disconnected.isoformat() if self.last_disconnected else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# ==================== BACKUP GITHUB ====================

class GitHubBackupService:
    def __init__(self, cl_token, repo_name, branch='main'):
        self.cl_token = cl_token
        self.repo_name = repo_name
        self.branch = branch
        self.base_url = 'https://api.github.com'
        self.headers = {
            'Authorization': f'token {cl_token}',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    
    def backup_all_data(self):
        """Faz backup de todos os dados do sistema"""
        try:
            logger.info("Iniciando backup completo para GitHub...")
            
            # Preparar dados para backup
            backup_data = self._prepare_backup_data()
            
            # Fazer backup de cada tipo de dado
            self._backup_clients(backup_data['clients'])
            self._backup_whatsapp_config(backup_data['whatsapp_config'])
            self._backup_message_logs(backup_data['message_logs'])
            self._backup_system_info(backup_data['system_info'])
            
            logger.info("Backup completo finalizado com sucesso!")
            return True
            
        except Exception as e:
            logger.error(f"Erro durante backup: {e}")
            return False
    
    def _prepare_backup_data(self):
        """Prepara todos os dados para backup"""
        # Clientes
        clients = Client.query.all()
        clients_data = [client.to_dict() for client in clients]
        
        # Configuração WhatsApp
        whatsapp_config = WhatsAppConfig.get_or_create_config()
        whatsapp_data = whatsapp_config.to_dict()
        
        # Logs de mensagens (últimos 1000)
        message_logs = MessageLog.query.order_by(MessageLog.created_at.desc()).limit(1000).all()
        logs_data = [log.to_dict() for log in message_logs]
        
        # Informações do sistema
        system_info = {
            'backup_timestamp': datetime.utcnow().isoformat(),
            'total_clients': len(clients_data),
            'total_logs': len(logs_data),
            'clients_by_product': {
                'IPTV': len([c for c in clients_data if c['product_type'] == 'IPTV']),
                'VPN': len([c for c in clients_data if c['product_type'] == 'VPN'])
            }
        }
        
        return {
            'clients': clients_data,
            'whatsapp_config': whatsapp_data,
            'message_logs': logs_data,
            'system_info': system_info
        }
    
    def _backup_clients(self, clients_data):
        """Faz backup dos dados de clientes"""
        # Separar clientes por produto
        iptv_clients = [c for c in clients_data if c['product_type'] == 'IPTV']
        vpn_clients = [c for c in clients_data if c['product_type'] == 'VPN']
        
        # Backup clientes IPTV
        self._upload_file(
            'data/clients/iptv_clients.json',
            json.dumps(iptv_clients, indent=2, ensure_ascii=False),
            f"Backup automático - Clientes IPTV ({len(iptv_clients)} clientes)"
        )
        
        # Backup clientes VPN
        self._upload_file(
            'data/clients/vpn_clients.json',
            json.dumps(vpn_clients, indent=2, ensure_ascii=False),
            f"Backup automático - Clientes VPN ({len(vpn_clients)} clientes)"
        )
        
        # Backup completo de clientes
        self._upload_file(
            'data/clients/all_clients.json',
            json.dumps(clients_data, indent=2, ensure_ascii=False),
            f"Backup automático - Todos os clientes ({len(clients_data)} total)"
        )
        
        logger.info(f"Backup de clientes concluído: {len(iptv_clients)} IPTV, {len(vpn_clients)} VPN")
    
    def _backup_whatsapp_config(self, whatsapp_data):
        """Faz backup da configuração do WhatsApp"""
        # Remover dados sensíveis
        safe_data = whatsapp_data.copy()
        safe_data.pop('session_data', None)
        safe_data.pop('qr_code', None)
        
        self._upload_file(
            'data/config/whatsapp_config.json',
            json.dumps(safe_data, indent=2, ensure_ascii=False),
            "Backup automático - Configuração WhatsApp"
        )
        
        logger.info("Backup de configuração WhatsApp concluído")
    
    def _backup_message_logs(self, logs_data):
        """Faz backup dos logs de mensagens"""
        self._upload_file(
            'data/logs/recent_message_logs.json',
            json.dumps(logs_data, indent=2, ensure_ascii=False),
            f"Backup automático - Logs de mensagens ({len(logs_data)} logs)"
        )
        
        logger.info(f"Backup de logs concluído: {len(logs_data)} logs")
    
    def _backup_system_info(self, system_info):
        """Faz backup das informações do sistema"""
        self._upload_file(
            'data/system/system_info.json',
            json.dumps(system_info, indent=2, ensure_ascii=False),
            f"Backup automático - Informações do sistema"
        )
        
        # Criar README com informações do backup
        readme_content = f"""# Sistema de Aviso de Vencimento - Backup Replit

## Informações do Backup
- **Data/Hora**: {system_info['backup_timestamp']}
- **Total de Clientes**: {system_info['total_clients']}
- **Clientes IPTV**: {system_info['clients_by_product']['IPTV']}
- **Clientes VPN**: {system_info['clients_by_product']['VPN']}
- **Logs de Mensagens**: {system_info['total_logs']}

## Deploy no Replit
Este sistema está configurado para rodar completamente no Replit com:
- Frontend React servido pelo Flask
- Backend Flask com API completa
- Serviço WhatsApp integrado
- Backup automático para GitHub

## Como usar no Replit:
1. Importe este repositório no Replit
2. Configure as variáveis de ambiente
3. Execute `python main.py`
4. Acesse a URL do Replit

## Estrutura dos Dados
- `data/clients/` - Dados dos clientes
- `data/config/` - Configurações do sistema
- `data/logs/` - Logs de mensagens
- `data/system/` - Informações do sistema
"""
        
        self._upload_file(
            'README.md',
            readme_content,
            f"Backup automático - README atualizado"
        )
        
        logger.info("Backup de informações do sistema concluído")
    
    def _upload_file(self, file_path, content, commit_message):
        """Faz upload de um arquivo para o GitHub"""
        try:
            # Verificar se o arquivo já existe
            url = f"{self.base_url}/repos/{self.repo_name}/contents/{file_path}"
            response = requests.get(url, headers=self.headers)
            
            # Preparar dados para upload
            content_encoded = base64.b64encode(content.encode('utf-8')).decode('utf-8')
            
            data = {
                'message': commit_message,
                'content': content_encoded,
                'branch': self.branch
            }
            
            # Se o arquivo existe, incluir SHA para atualização
            if response.status_code == 200:
                file_info = response.json()
                data['sha'] = file_info['sha']
            
            # Fazer upload/atualização
            response = requests.put(url, headers=self.headers, json=data)
            
            if response.status_code in [200, 201]:
                logger.debug(f"Arquivo {file_path} enviado com sucesso")
            else:
                logger.error(f"Erro ao enviar {file_path}: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Erro ao fazer upload do arquivo {file_path}: {e}")

# Instância global do serviço de backup
backup_service = None

def init_github_backup():
    """Inicializa o serviço de backup do GitHub"""
    global backup_service
    
    cl_token = os.getenv("CL_TOKEN")
    repo_name = os.getenv("GITHUB_REPO")
    
    if cl_token and repo_name:
        backup_service = GitHubBackupService(cl_token, repo_name)
        logger.info(f"Serviço de backup GitHub inicializado para {repo_name}")
        return backup_service
    else:
        logger.warning("Token do GitHub não fornecido - backup desabilitado")
        return None

# ==================== ROTAS DA API ====================

@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        product_type = request.args.get('product_type')
        status = request.args.get('status')
        search = request.args.get('search', '')
        
        query = Client.query
        
        if product_type:
            query = query.filter(Client.product_type == ProductType(product_type))
        
        if status:
            query = query.filter(Client.status == ClientStatus(status))
        
        if search:
            query = query.filter(
                db.or_(
                    Client.name.contains(search),
                    Client.phone.contains(search),
                    Client.plan.contains(search)
                )
            )
        
        query = query.order_by(Client.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'clients': [client.to_dict() for client in pagination.items],
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/clients', methods=['POST'])
def create_client():
    try:
        data = request.get_json()
        
        client = Client(
            name=data['name'],
            phone=data['phone'],
            product_type=ProductType(data['product_type']),
            plan=data['plan'],
            value=float(data['value']),
            expiry_date=datetime.strptime(data['expiry_date'], '%Y-%m-%d').date(),
            notification_time=datetime.strptime(data.get('notification_time', '09:00'), '%H:%M').time(),
            custom_message=data.get('custom_message', ''),
            status=ClientStatus(data.get('status', 'active'))
        )
        
        db.session.add(client)
        db.session.commit()
        
        # Fazer backup após criar cliente
        if backup_service:
            backup_service.backup_all_data()
        
        return jsonify({
            'success': True,
            'message': 'Cliente criado com sucesso',
            'client': client.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/clients/<int:client_id>/renew', methods=['POST'])
def renew_client(client_id):
    try:
        data = request.get_json()
        days = int(data['days'])
        
        client = Client.query.get_or_404(client_id)
        
        # Calcular nova data de vencimento
        if client.expiry_date < datetime.now().date():
            # Se já venceu, renovar a partir de hoje
            new_expiry = datetime.now().date() + timedelta(days=days)
        else:
            # Se ainda não venceu, renovar a partir da data atual de vencimento
            new_expiry = client.expiry_date + timedelta(days=days)
        
        client.expiry_date = new_expiry
        client.status = ClientStatus.RENEWED
        client.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Fazer backup após renovação
        if backup_service:
            backup_service.backup_all_data()
        
        return jsonify({
            'success': True,
            'message': f'Cliente renovado por {days} dias',
            'client': client.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/clients/stats', methods=['GET'])
def get_client_stats():
    try:
        product_type = request.args.get('product_type')
        
        query = Client.query
        if product_type:
            query = query.filter(Client.product_type == ProductType(product_type))
        
        total_clients = query.count()
        active_clients = query.filter(Client.status == ClientStatus.ACTIVE).count()
        expired_clients = query.filter(Client.status == ClientStatus.EXPIRED).count()
        
        # Clientes vencendo em breve (próximos 7 dias)
        expiring_soon = query.filter(
            Client.expiry_date <= datetime.now().date() + timedelta(days=7),
            Client.expiry_date >= datetime.now().date(),
            Client.status == ClientStatus.ACTIVE
        ).count()
        
        # Receita mensal estimada
        monthly_revenue = query.filter(Client.status == ClientStatus.ACTIVE).with_entities(
            db.func.sum(Client.value)
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total_clients': total_clients,
                'active_clients': active_clients,
                'expired_clients': expired_clients,
                'expiring_soon': expiring_soon,
                'monthly_revenue': float(monthly_revenue),
                'renewed_clients': query.filter(Client.status == ClientStatus.RENEWED).count()
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/whatsapp/config', methods=['GET'])
def get_whatsapp_config():
    try:
        config = WhatsAppConfig.get_or_create_config()
        return jsonify({
            'success': True,
            'config': config.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/whatsapp/config', methods=['PUT'])
def update_whatsapp_config():
    try:
        data = request.get_json()
        config = WhatsAppConfig.get_or_create_config()
        
        if 'connection_status' in data:
            config.connection_status = data['connection_status']
        if 'qr_code' in data:
            config.qr_code = data['qr_code']
        if 'auto_send_enabled' in data:
            config.auto_send_enabled = data['auto_send_enabled']
        if 'working_hours_start' in data:
            config.working_hours_start = datetime.strptime(data['working_hours_start'], '%H:%M').time()
        if 'working_hours_end' in data:
            config.working_hours_end = datetime.strptime(data['working_hours_end'], '%H:%M').time()
        if 'message_interval_seconds' in data:
            config.message_interval_seconds = int(data['message_interval_seconds'])
        if 'last_connected' in data:
            config.last_connected = datetime.utcnow()
        if 'last_disconnected' in data:
            config.last_disconnected = datetime.utcnow()
        
        config.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Configuração atualizada com sucesso',
            'config': config.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/backup/manual', methods=['POST'])
def manual_backup():
    try:
        if backup_service:
            success = backup_service.backup_all_data()
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Backup realizado com sucesso'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Falha ao realizar backup'
                }), 500
        else:
            return jsonify({
                'success': False,
                'error': 'Serviço de backup não configurado'
            }), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== SERVIR FRONTEND ====================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve o frontend React"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "Frontend não encontrado. Execute o build do React primeiro.", 404

# ==================== INICIALIZAÇÃO ====================

def create_sample_data():
    """Cria dados de exemplo se não existirem"""
    if Client.query.count() == 0:
        # Clientes IPTV
        clients_iptv = [
            Client(
                name='João Silva',
                phone='+55 11 99999-9999',
                product_type=ProductType.IPTV,
                plan='Premium IPTV',
                value=89.90,
                expiry_date=datetime.now().date() + timedelta(days=3),
                custom_message='Olá João! Seu plano IPTV Premium vence em {dias} dias. Renove agora!',
                status=ClientStatus.ACTIVE
            ),
            Client(
                name='Maria Santos',
                phone='+55 11 88888-8888',
                product_type=ProductType.IPTV,
                plan='Básico IPTV',
                value=49.90,
                expiry_date=datetime.now().date() - timedelta(days=2),
                custom_message='Oi Maria! Seu IPTV Básico venceu. Renove hoje!',
                status=ClientStatus.EXPIRED
            )
        ]
        
        # Clientes VPN
        clients_vpn = [
            Client(
                name='Ana Costa',
                phone='+55 11 66666-6666',
                product_type=ProductType.VPN,
                plan='VPN Mensal',
                value=29.90,
                expiry_date=datetime.now().date() + timedelta(days=5),
                custom_message='Olá Ana! Sua VPN Mensal vence em {dias} dias. Mantenha sua privacidade!',
                status=ClientStatus.ACTIVE
            ),
            Client(
                name='Pedro Lima',
                phone='+55 11 55555-5555',
                product_type=ProductType.VPN,
                plan='VPN Anual',
                value=199.90,
                expiry_date=datetime.now().date() - timedelta(days=10),
                custom_message='Oi Pedro! Sua VPN Anual venceu. Renove e continue navegando seguro!',
                status=ClientStatus.EXPIRED
            ),
            Client(
                name='Lucia Ferreira',
                phone='+55 11 44444-4444',
                product_type=ProductType.VPN,
                plan='VPN Trimestral',
                value=79.90,
                expiry_date=datetime.now().date() + timedelta(days=15),
                custom_message='Olá Lucia! Sua VPN Trimestral vence em {dias} dias. Renove para manter a segurança!',
                status=ClientStatus.ACTIVE
            )
        ]
        
        for client in clients_iptv + clients_vpn:
            db.session.add(client)
        
        db.session.commit()
        logger.info("Dados de exemplo criados com sucesso!")

def run_scheduler():
    """Executa o scheduler de backup em thread separada"""
    schedule.every(6).hours.do(lambda: backup_service.backup_all_data() if backup_service else None)
    schedule.every().day.at("02:00").do(lambda: backup_service.backup_all_data() if backup_service else None)
    
    while True:
        schedule.run_pending()
        time.sleep(300)  # Verificar a cada 5 minutos

if __name__ == '__main__':
    # Criar tabelas do banco
    with app.app_context():
        db.create_all()
        create_sample_data()
        
        # Inicializar backup GitHub
        init_github_backup()
        
        # Iniciar scheduler em thread separada
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        
        logger.info("✅ Sistema de Aviso de Vencimento iniciado!")
        logger.info("✅ Backup GitHub configurado!")
        logger.info("✅ Dados de exemplo criados!")
        logger.info("✅ Scheduler de backup iniciado!")
    
