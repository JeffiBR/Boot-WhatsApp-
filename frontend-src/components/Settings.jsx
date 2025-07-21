import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  Database,
  Github,
  Shield,
  Bell,
  Palette,
  Globe,
  Clock,
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

const Settings = ({ apiRequest, darkMode, onDarkModeChange }) => {
  const [settings, setSettings] = useState({
    backup_enabled: true,
    backup_interval: 6,
    notification_enabled: true,
    notification_sound: true,
    auto_cleanup: false,
    cleanup_days: 30,
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    theme: 'dark'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [backupDialog, setBackupDialog] = useState(false)
  const [resetDialog, setResetDialog] = useState(false)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/settings')
      if (response.success) {
        setSettings(response.settings)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      })
      
      if (response.success) {
        toast({
          title: "Configurações salvas",
          description: "As alterações foram aplicadas com sucesso",
        })
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    } finally {
      setSaving(false)
    }
  }

  const performBackup = async () => {
    try {
      const response = await apiRequest('/api/backup/manual', {
        method: 'POST'
      })
      
      if (response.success) {
        toast({
          title: "Backup realizado",
          description: "Dados salvos no GitHub com sucesso",
        })
        setBackupDialog(false)
      }
    } catch (error) {
      console.error('Erro ao fazer backup:', error)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/export/data')
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sistema_aviso_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Dados exportados",
        description: "Arquivo de backup baixado com sucesso",
      })
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    }
  }

  const resetSystem = async () => {
    try {
      const response = await apiRequest('/api/system/reset', {
        method: 'POST'
      })
      
      if (response.success) {
        toast({
          title: "Sistema resetado",
          description: "Todos os dados foram removidos",
        })
        setResetDialog(false)
        // Recarregar a página após reset
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (error) {
      console.error('Erro ao resetar sistema:', error)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    fetchSettings()
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
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações gerais do sistema
          </p>
        </div>
        
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup e Sincronização */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup e Sincronização
              </CardTitle>
              <CardDescription>
                Configurações de backup automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Salvar dados no GitHub automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.backup_enabled}
                  onCheckedChange={(checked) => updateSetting('backup_enabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Intervalo de Backup (horas)</Label>
                <Select 
                  value={settings.backup_interval.toString()} 
                  onValueChange={(value) => updateSetting('backup_interval', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="3">3 horas</SelectItem>
                    <SelectItem value="6">6 horas</SelectItem>
                    <SelectItem value="12">12 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={backupDialog} onOpenChange={setBackupDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Github className="h-4 w-4 mr-2" />
                      Backup Manual
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Backup Manual</DialogTitle>
                      <DialogDescription>
                        Fazer backup imediato dos dados no GitHub?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBackupDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={performBackup}>
                        Fazer Backup
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={exportData} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notificações */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configurações de alertas e notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Ativadas</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas do sistema
                  </p>
                </div>
                <Switch
                  checked={settings.notification_enabled}
                  onCheckedChange={(checked) => updateSetting('notification_enabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Som de Notificação</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir som nos alertas
                  </p>
                </div>
                <Switch
                  checked={settings.notification_sound}
                  onCheckedChange={(checked) => updateSetting('notification_sound', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Aparência */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalização da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => {
                    updateSetting('theme', value)
                    onDarkModeChange(value === 'dark')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => updateSetting('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sistema */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Sistema
              </CardTitle>
              <CardDescription>
                Configurações avançadas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => updateSetting('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Limpeza Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Remover logs antigos automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.auto_cleanup}
                  onCheckedChange={(checked) => updateSetting('auto_cleanup', checked)}
                />
              </div>
              
              {settings.auto_cleanup && (
                <div className="space-y-2">
                  <Label>Manter logs por (dias)</Label>
                  <Input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.cleanup_days}
                    onChange={(e) => updateSetting('cleanup_days', parseInt(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status do Sistema */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Informações sobre o estado atual do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Sistema</p>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Banco de Dados</p>
                  <p className="text-sm text-muted-foreground">Conectado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-muted-foreground">Sincronizado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Conectado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Zona de Perigo */}
      <motion.div variants={itemVariants}>
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam todo o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={resetDialog} onOpenChange={setResetDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Resetar Sistema
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resetar Sistema</DialogTitle>
                  <DialogDescription>
                    Esta ação irá remover TODOS os dados do sistema, incluindo clientes, mensagens e configurações. Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetDialog(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={resetSystem}>
                    Confirmar Reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default Settings

