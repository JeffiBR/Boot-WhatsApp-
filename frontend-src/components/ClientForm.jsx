import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Save, 
  ArrowLeft, 
  User, 
  Phone, 
  DollarSign, 
  Calendar,
  MessageSquare,
  Clock,
  Package
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  plan: z.string().min(1, 'Selecione um plano'),
  value: z.number().min(0.01, 'Valor deve ser maior que zero'),
  expiry_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  notification_time: z.string().min(1, 'Horário de notificação é obrigatório'),
  custom_message: z.string().optional(),
})

const ClientForm = ({ currentProduct, apiRequest, isEdit = false }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingClient, setLoadingClient] = useState(isEdit)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      plan: '',
      value: 0,
      expiry_date: '',
      notification_time: '09:00',
      custom_message: '',
    }
  })

  // Planos disponíveis por produto
  const plans = {
    IPTV: [
      'Básico IPTV',
      'Premium IPTV',
      'Ultra IPTV',
      'Família IPTV',
      'Empresarial IPTV'
    ],
    VPN: [
      'Básico VPN',
      'Premium VPN',
      'Ultra VPN',
      'Empresarial VPN',
      'Global VPN'
    ]
  }

  // Templates de mensagem por produto
  const messageTemplates = {
    IPTV: [
      'Olá {nome}! Seu plano IPTV {plano} vence em {dias} dias. Renove já para não perder acesso!',
      'Atenção {nome}! Seu IPTV {plano} expira em {dias} dias. Entre em contato para renovar.',
      'Lembrete: Seu plano {plano} vence em {dias} dias. Valor: R$ {valor}. Renove agora!'
    ],
    VPN: [
      'Olá {nome}! Sua VPN {plano} vence em {dias} dias. Mantenha sua segurança online renovando!',
      'Atenção {nome}! Sua VPN {plano} expira em {dias} dias. Proteja sua privacidade renovando.',
      'Lembrete: Seu plano VPN {plano} vence em {dias} dias. Valor: R$ {valor}. Renove já!'
    ]
  }

  useEffect(() => {
    if (isEdit && id) {
      fetchClient()
    }
  }, [isEdit, id])

  const fetchClient = async () => {
    try {
      setLoadingClient(true)
      const response = await apiRequest(`/api/clients/${id}`)
      if (response.success) {
        const client = response.client
        form.reset({
          name: client.name,
          phone: client.phone,
          plan: client.plan,
          value: client.value,
          expiry_date: client.expiry_date.split('T')[0], // Format for date input
          notification_time: client.notification_time,
          custom_message: client.custom_message || '',
        })
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente",
        variant: "destructive",
      })
    } finally {
      setLoadingClient(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      const clientData = {
        ...data,
        product_type: currentProduct,
        status: 'active'
      }

      const endpoint = isEdit ? `/api/clients/${id}` : '/api/clients'
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(clientData)
      })

      if (response.success) {
        toast({
          title: isEdit ? "Cliente atualizado" : "Cliente criado",
          description: response.message,
        })
        navigate('/clients')
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const setMessageTemplate = (template) => {
    form.setValue('custom_message', template)
  }

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

  if (loadingClient) {
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
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'} {currentProduct}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}
          </p>
        </div>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                  <CardDescription>
                    Dados pessoais do cliente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome do cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone/WhatsApp</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="(11) 99999-9999" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Número para envio das notificações
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Informações do Plano */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Plano e Valores
                  </CardTitle>
                  <CardDescription>
                    Detalhes do plano contratado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plans[currentProduct]?.map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Mensal</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Configurações de Vencimento */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Vencimento e Notificação
                  </CardTitle>
                  <CardDescription>
                    Quando e como notificar o cliente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="expiry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notification_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário da Notificação</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="time" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Horário para envio das notificações
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Mensagem Personalizada */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Mensagem Personalizada
                  </CardTitle>
                  <CardDescription>
                    Customize a mensagem de notificação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="custom_message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite uma mensagem personalizada..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use {'{nome}'}, {'{plano}'}, {'{valor}'}, {'{dias}'} como variáveis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Templates Sugeridos</Label>
                    <div className="space-y-2">
                      {messageTemplates[currentProduct]?.map((template, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start h-auto p-3"
                          onClick={() => setMessageTemplate(template)}
                        >
                          <div className="text-xs text-muted-foreground truncate">
                            {template}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/clients')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}

export default ClientForm

