import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings,
  Send,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

const WhatsAppConfig = ({ apiRequest }) => {
  const [config, setConfig] = useState({
    is_connected: false,
    qr_code: null,
    phone_number: '',
    auto_send: true,
    send_time: '09:00',
    retry_attempts: 3,
    retry_interval: 30
  })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const { toast } = useToast()

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/whatsapp/config')
      if (response.success) {
        setConfig(response.config)
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    try {
      setConnecting(true)
      const response = await apiRequest('/api/whatsapp/generate-qr', {
        method: 'POST'
      })
      if (response.success) {
        setConfig(prev => ({ ...prev, qr_code: response.qr_code }))
        toast({
          title: "QR Code gerado",
          description: "Escaneie o código com seu WhatsApp",
        })
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWhatsApp = async () => {
    try {
      const response = await apiRequest('/api/whatsapp/disconnect', {
        method: 'POST'
      })
      if (response.success) {
        setConfig(prev => ({ 
          ...prev, 
          is_connected: false, 
          qr_code: null,
          phone_number: ''
        }))
        toast({
          title: "WhatsApp desconectado",
          description: "Sessão encerrada com sucesso",
        })
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error)
    }
  }

  const updateConfig = async (newConfig) => {
    try {
      const response = await apiRequest('/api/whatsapp/config', {
        method: 'PUT',
        body: JSON.stringify(newConfig)
      })
      if (response.success) {
        setConfig(prev => ({ ...prev, ...newConfig }))
        toast({
          title: "Configuração salva",
          description: "As alterações foram aplicadas",
        })
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
    }
  }

  const sendTestMessage = async () => {
    if (!testMessage || !testPhone) {
      toast({
        title: "Erro",
        description: "Preencha a mensagem e o telefone",
        variant: "destructive",
      })
      return
    }

    try {
      setSendingTest(true)
      const response = await apiRequest('/api/whatsapp/send-test', {
        method: 'POST',
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage
        })
      })
      
      if (response.success) {
        toast({
          title: "Mensagem enviada",
          description: "Teste realizado com sucesso",
        })
        setTestMessage('')
        setTestPhone('')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem teste:', error)
    } finally {
      setSendingTest(false)
    }
  }

  useEffect(() => {
    fetchConfig()
    
    // Auto-refresh status a cada 10 segundos
    const interval = setInterval(fetchConfig, 10000)
    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração WhatsApp</h1>
          <p className="text-muted-foreground">
            Configure a integração com WhatsApp para envio automático de mensagens
          </p>
        </div>
        
        <Button onClick={fetchConfig} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Status
        </Button>
      </motion.div>

      {/* Connection Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {config.is_connected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {config.is_connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                
                {config.is_connected && config.phone_number && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    {config.phone_number}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {config.is_connected ? (
                  <Button variant="destructive" onClick={disconnectWhatsApp}>
                    Desconectar
                  </Button>
                ) : (
                  <Button onClick={generateQRCode} disabled={connecting}>
                    {connecting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <QrCode className="h-4 w-4 mr-2" />
                    )}
                    Conectar WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Code */}
      {config.qr_code && !config.is_connected && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Escaneie o QR Code
              </CardTitle>
              <CardDescription>
                Abra o WhatsApp no seu celular e escaneie o código abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <img 
                    src={`data:image/png;base64,${config.qr_code}`} 
                    alt="QR Code WhatsApp"
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    1. Abra o WhatsApp no seu celular
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. Toque em Menu (⋮) → Dispositivos conectados
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Toque em "Conectar um dispositivo"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    4. Aponte a câmera para este código
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Envio */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Envio
              </CardTitle>
              <CardDescription>
                Configure como e quando as mensagens são enviadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Envio Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar mensagens automaticamente
                  </p>
                </div>
                <Switch
                  checked={config.auto_send}
                  onCheckedChange={(checked) => 
                    updateConfig({ auto_send: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Horário Padrão de Envio</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={config.send_time}
                    onChange={(e) => 
                      updateConfig({ send_time: e.target.value })
                    }
                    className="w-32"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tentativas de Reenvio</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={config.retry_attempts}
                  onChange={(e) => 
                    updateConfig({ retry_attempts: parseInt(e.target.value) })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Número de tentativas em caso de falha
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Intervalo entre Tentativas (minutos)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={config.retry_interval}
                  onChange={(e) => 
                    updateConfig({ retry_interval: parseInt(e.target.value) })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teste de Mensagem */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Teste de Mensagem
              </CardTitle>
              <CardDescription>
                Envie uma mensagem de teste para verificar a conexão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Teste</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Mensagem de Teste</Label>
                <Textarea
                  placeholder="Digite uma mensagem de teste..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={sendTestMessage}
                disabled={!config.is_connected || sendingTest}
                className="w-full"
              >
                {sendingTest ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Teste
              </Button>
              
              {!config.is_connected && (
                <p className="text-sm text-muted-foreground text-center">
                  Conecte o WhatsApp primeiro para enviar mensagens
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Mensagens Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Enviadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Falharam</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WhatsAppConfig

