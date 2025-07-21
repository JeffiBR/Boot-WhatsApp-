import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Settings, 
  Save,
  RefreshCw,
  Lightbulb,
  Zap,
  Target,
  Users,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { useToast } from '@/hooks/use-toast'

const AIConfig = ({ apiRequest }) => {
  const [config, setConfig] = useState({
    enabled: false,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 150,
    system_prompt: '',
    context_iptv: '',
    context_vpn: '',
    personalization_level: 'medium',
    auto_improve: true,
    learning_enabled: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testPrompt, setTestPrompt] = useState('')
  const [testResult, setTestResult] = useState('')
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/ai/config')
      if (response.success) {
        setConfig(response.config)
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setSaving(true)
      const response = await apiRequest('/api/ai/config', {
        method: 'PUT',
        body: JSON.stringify(config)
      })
      
      if (response.success) {
        toast({
          title: "Configuração salva",
          description: "As configurações de IA foram atualizadas",
        })
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
    } finally {
      setSaving(false)
    }
  }

  const testAI = async () => {
    if (!testPrompt.trim()) {
      toast({
        title: "Erro",
        description: "Digite um prompt para testar",
        variant: "destructive",
      })
      return
    }

    try {
      setTesting(true)
      const response = await apiRequest('/api/ai/test', {
        method: 'POST',
        body: JSON.stringify({ prompt: testPrompt })
      })
      
      if (response.success) {
        setTestResult(response.result)
        toast({
          title: "Teste realizado",
          description: "A IA processou seu prompt com sucesso",
        })
      }
    } catch (error) {
      console.error('Erro ao testar IA:', error)
    } finally {
      setTesting(false)
    }
  }

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    fetchConfig()
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
          <h1 className="text-3xl font-bold tracking-tight">Configuração de IA</h1>
          <p className="text-muted-foreground">
            Configure a inteligência artificial para mensagens mais personalizadas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchConfig}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </motion.div>

      {/* Status Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Status da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {config.enabled ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  )}
                  <span className="font-medium">
                    {config.enabled ? 'IA Ativada' : 'IA Desativada'}
                  </span>
                </div>
                
                {config.enabled && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    {config.model}
                  </Badge>
                )}
              </div>
              
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => updateConfig('enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Básicas */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Básicas
              </CardTitle>
              <CardDescription>
                Parâmetros fundamentais da IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <Select 
                  value={config.model} 
                  onValueChange={(value) => updateConfig('model', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Criatividade (Temperature): {config.temperature}</Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservador</span>
                  <span>Criativo</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tamanho Máximo da Resposta</Label>
                <Input
                  type="number"
                  min="50"
                  max="500"
                  value={config.max_tokens}
                  onChange={(e) => updateConfig('max_tokens', parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Número máximo de tokens (palavras) na resposta
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Nível de Personalização</Label>
                <Select 
                  value={config.personalization_level} 
                  onValueChange={(value) => updateConfig('personalization_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Configurações Avançadas */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Opções avançadas de comportamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Melhoria Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    A IA aprende com feedbacks
                  </p>
                </div>
                <Switch
                  checked={config.auto_improve}
                  onCheckedChange={(checked) => updateConfig('auto_improve', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprendizado Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Coleta dados para melhorar
                  </p>
                </div>
                <Switch
                  checked={config.learning_enabled}
                  onCheckedChange={(checked) => updateConfig('learning_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prompt do Sistema */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Prompt do Sistema
              </CardTitle>
              <CardDescription>
                Instruções gerais para a IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Instruções Gerais</Label>
                <Textarea
                  placeholder="Digite as instruções gerais para a IA..."
                  value={config.system_prompt}
                  onChange={(e) => updateConfig('system_prompt', e.target.value)}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Defina como a IA deve se comportar em geral
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contexto Específico */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Contexto Específico
              </CardTitle>
              <CardDescription>
                Informações específicas por produto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contexto IPTV</Label>
                <Textarea
                  placeholder="Informações específicas sobre IPTV..."
                  value={config.context_iptv}
                  onChange={(e) => updateConfig('context_iptv', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Contexto VPN</Label>
                <Textarea
                  placeholder="Informações específicas sobre VPN..."
                  value={config.context_vpn}
                  onChange={(e) => updateConfig('context_vpn', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Teste da IA */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Teste da IA
            </CardTitle>
            <CardDescription>
              Teste como a IA responde a diferentes prompts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prompt de Teste</Label>
                <Textarea
                  placeholder="Digite um prompt para testar a IA..."
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={testAI} 
                  disabled={!config.enabled || testing}
                  className="w-full"
                >
                  {testing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Testar IA
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Resposta da IA</Label>
                <div className="min-h-[120px] p-3 border rounded-md bg-muted/50">
                  {testResult ? (
                    <p className="text-sm">{testResult}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      A resposta da IA aparecerá aqui...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Métricas da IA */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Mensagens Geradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Clientes Atendidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AIConfig

