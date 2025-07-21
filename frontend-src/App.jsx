import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { useToast } from '@/hooks/use-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ClientList from './components/ClientList'
import ClientForm from './components/ClientForm'
import WhatsAppConfig from './components/WhatsAppConfig'
import MessageLogs from './components/MessageLogs'
import AIConfig from './components/AIConfig'
import Settings from './components/Settings'
import './App.css'

// API Base URL - ajustar conforme necessário
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000'

function App() {
  const [currentProduct, setCurrentProduct] = useState('IPTV')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const { toast } = useToast()

  // Aplicar tema dark por padrão
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Função para fazer requisições à API
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      toast({
        title: "Erro na API",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            currentProduct={currentProduct}
            onProductChange={setCurrentProduct}
          />
          
          <main className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <motion.div
                      key="dashboard"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Dashboard 
                        currentProduct={currentProduct}
                        apiRequest={apiRequest}
                      />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/clients" 
                  element={
                    <motion.div
                      key="clients"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ClientList 
                        currentProduct={currentProduct}
                        apiRequest={apiRequest}
                      />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/clients/new" 
                  element={
                    <motion.div
                      key="client-form"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ClientForm 
                        currentProduct={currentProduct}
                        apiRequest={apiRequest}
                      />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/clients/edit/:id" 
                  element={
                    <motion.div
                      key="client-edit"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <ClientForm 
                        currentProduct={currentProduct}
                        apiRequest={apiRequest}
                        isEdit={true}
                      />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/whatsapp" 
                  element={
                    <motion.div
                      key="whatsapp"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <WhatsAppConfig apiRequest={apiRequest} />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/messages" 
                  element={
                    <motion.div
                      key="messages"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <MessageLogs 
                        currentProduct={currentProduct}
                        apiRequest={apiRequest}
                      />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/ai-config" 
                  element={
                    <motion.div
                      key="ai-config"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <AIConfig apiRequest={apiRequest} />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/settings" 
                  element={
                    <motion.div
                      key="settings"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Settings 
                        apiRequest={apiRequest}
                        darkMode={darkMode}
                        onDarkModeChange={setDarkMode}
                      />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
        
        <Toaster />
      </Router>
    </div>
  )
}

export default App

