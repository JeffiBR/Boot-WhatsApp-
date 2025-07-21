import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Tv,
  Shield,
  Bot,
  FileText,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const Sidebar = ({ collapsed, onToggle, currentProduct, onProductChange }) => {
  const location = useLocation()

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      description: 'Visão geral do sistema'
    },
    {
      title: 'Clientes',
      icon: Users,
      path: '/clients',
      description: 'Gerenciar clientes'
    },
    {
      title: 'WhatsApp',
      icon: MessageSquare,
      path: '/whatsapp',
      description: 'Configurar WhatsApp'
    },
    {
      title: 'Mensagens',
      icon: FileText,
      path: '/messages',
      description: 'Logs de mensagens'
    },
    {
      title: 'IA Config',
      icon: Bot,
      path: '/ai-config',
      description: 'Configurar IA'
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/settings',
      description: 'Configurações gerais'
    }
  ]

  const products = [
    {
      id: 'IPTV',
      name: 'IPTV',
      icon: Tv,
      color: 'bg-blue-500',
      description: 'Televisão por IP'
    },
    {
      id: 'VPN',
      name: 'VPN',
      icon: Shield,
      color: 'bg-green-500',
      description: 'Rede Privada Virtual'
    }
  ]

  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '4rem' }
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  }

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              variants={contentVariants}
              animate={collapsed ? 'collapsed' : 'expanded'}
              transition={{ duration: 0.2, delay: collapsed ? 0 : 0.1 }}
            >
              <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
                <Zap className="h-6 w-6 text-blue-500" />
                Sistema Aviso
              </h1>
              <p className="text-sm text-sidebar-foreground/60">
                Gerenciamento de Vencimentos
              </p>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Product Selector */}
      <div className="p-4">
        {!collapsed && (
          <motion.div
            variants={contentVariants}
            animate={collapsed ? 'collapsed' : 'expanded'}
            transition={{ duration: 0.2, delay: collapsed ? 0 : 0.1 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Produto Ativo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {products.map((product) => (
                <Button
                  key={product.id}
                  variant={currentProduct === product.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onProductChange(product.id)}
                  className={cn(
                    "h-auto p-2 flex flex-col items-center gap-1 text-xs",
                    currentProduct === product.id && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                >
                  <product.icon className="h-4 w-4" />
                  {product.name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
        
        {collapsed && (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <Button
                key={product.id}
                variant={currentProduct === product.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onProductChange(product.id)}
                className={cn(
                  "h-8 w-8 p-0",
                  currentProduct === product.id && "bg-sidebar-primary text-sidebar-primary-foreground"
                )}
                title={product.name}
              >
                <product.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </div>

      <Separator className="mx-4" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  collapsed && "justify-center px-0",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    variants={contentVariants}
                    animate={collapsed ? 'collapsed' : 'expanded'}
                    transition={{ duration: 0.2, delay: collapsed ? 0 : 0.1 }}
                    className="font-medium"
                  >
                    {item.title}
                  </motion.span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          variants={contentVariants}
          animate={collapsed ? 'collapsed' : 'expanded'}
          transition={{ duration: 0.2, delay: collapsed ? 0 : 0.1 }}
          className="p-4 border-t border-sidebar-border"
        >
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <Badge variant="secondary" className="text-xs">
              v2.0
            </Badge>
            <span>Sistema Aviso</span>
          </div>
          <p className="text-xs text-sidebar-foreground/40 mt-1">
            Desenvolvido com ❤️
          </p>
        </motion.div>
      )}
    </motion.aside>
  )
}

export default Sidebar

