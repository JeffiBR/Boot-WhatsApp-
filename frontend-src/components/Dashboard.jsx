import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

const Dashboard = ({ currentProduct, apiRequest }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const { toast } = useToast()

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(`/api/clients/stats?product_type=${currentProduct}`)
      if (response.success) {
        setStats(response.stats)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [currentProduct])

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [currentProduct])

  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats?.total_clients || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Clientes cadastrados'
    },
    {
      title: 'Clientes Ativos',
      value: stats?.active_clients || 0,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Com planos válidos'
    },
    {
      title: 'Clientes Vencidos',
      value: stats?.expired_clients || 0,
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      description: 'Planos expirados'
    },
    {
      title: 'Vencendo em Breve',
      value: stats?.expiring_soon || 0,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Próximos 7 dias'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${(stats?.monthly_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'Clientes ativos'
    },
    {
      title: 'Renovações',
      value: stats?.renewed_clients || 0,
      icon: RefreshCw,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Este mês'
    }
  ]

  // Dados para gráficos
  const pieData = [
    { name: 'Ativos', value: stats?.active_clients || 0, color: '#10b981' },
    { name: 'Vencidos', value: stats?.expired_clients || 0, color: '#ef4444' },
    { name: 'Vencendo', value: stats?.expiring_soon || 0, color: '#f59e0b' }
  ]

  const barData = [
    { name: 'Ativos', value: stats?.active_clients || 0 },
    { name: 'Vencidos', value: stats?.expired_clients || 0 },
    { name: 'Vencendo', value: stats?.expiring_soon || 0 },
    { name: 'Renovados', value: stats?.renewed_clients || 0 }
  ]

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

  if (loading && !stats) {
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard {currentProduct}</h1>
          <p className="text-muted-foreground">
            Visão geral dos clientes e métricas do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button 
            onClick={fetchStats} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Status</CardTitle>
              <CardDescription>
                Proporção de clientes por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Comparison */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Status</CardTitle>
              <CardDescription>
                Quantidade de clientes por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Novo Cliente</span>
              </Button>
              
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <RefreshCw className="h-6 w-6" />
                <span>Renovar Clientes</span>
              </Button>
              
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <AlertTriangle className="h-6 w-6" />
                <span>Clientes Vencendo</span>
              </Button>
              
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <CheckCircle className="h-6 w-6" />
                <span>Backup Manual</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Monitoramento da saúde do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Conectado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Backup GitHub</p>
                  <p className="text-sm text-muted-foreground">Ativo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Banco de Dados</p>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard

