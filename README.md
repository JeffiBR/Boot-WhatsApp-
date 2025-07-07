# Sistema de Aviso de Vencimento - Backup

## Informações do Backup
- **Data/Hora**: 2025-07-07T09:42:17.054961
- **Total de Clientes**: 5
- **Clientes IPTV**: 2
- **Clientes VPN**: 3
- **Templates de Mensagem**: 6
- **Logs de Mensagens**: 0

## Estrutura dos Dados

### Clientes
- `data/clients/all_clients.json` - Todos os clientes
- `data/clients/iptv_clients.json` - Clientes IPTV
- `data/clients/vpn_clients.json` - Clientes VPN

### Templates de Mensagem
- `data/templates/all_templates.json` - Todos os templates
- `data/templates/iptv_templates.json` - Templates IPTV
- `data/templates/vpn_templates.json` - Templates VPN

### Configurações
- `data/config/whatsapp_config.json` - Configuração WhatsApp
- `data/config/ai_config.json` - Configuração IA

### Logs
- `data/logs/recent_message_logs.json` - Logs de mensagens recentes

### Sistema
- `data/system/system_info.json` - Informações do sistema

## Backup Automático
Este backup é gerado automaticamente a cada 6 horas e diariamente às 2:00 AM.
