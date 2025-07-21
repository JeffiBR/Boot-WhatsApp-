const API_BASE_URL = 'http://localhost:5000';

// Função para fazer requisições HTTP
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// API para clientes
export const clientsAPI = {
  // Buscar todos os clientes
  getAll: () => apiRequest('/api/clients'),
  
  // Buscar clientes por produto
  getByProduct: (product) => apiRequest(`/api/clients?product=${product}`),
  
  // Buscar cliente por ID
  getById: (id) => apiRequest(`/api/clients/${id}`),
  
  // Criar novo cliente
  create: (clientData) => apiRequest('/api/clients', {
    method: 'POST',
    body: clientData,
  }),
  
  // Atualizar cliente
  update: (id, clientData) => apiRequest(`/api/clients/${id}`, {
    method: 'PUT',
    body: clientData,
  }),
  
  // Deletar cliente
  delete: (id) => apiRequest(`/api/clients/${id}`, {
    method: 'DELETE',
  }),
  
  // Renovar cliente
  renew: (id, days) => apiRequest(`/api/clients/${id}/renew`, {
    method: 'POST',
    body: { days },
  }),
  
  // Enviar mensagem para cliente
  sendMessage: (id) => apiRequest(`/api/clients/${id}/send-message`, {
    method: 'POST',
  }),
};

// API para WhatsApp
export const whatsappAPI = {
  // Buscar configurações do WhatsApp
  getConfig: () => apiRequest('/api/whatsapp/config'),
  
  // Atualizar configurações do WhatsApp
  updateConfig: (config) => apiRequest('/api/whatsapp/config', {
    method: 'POST',
    body: config,
  }),
  
  // Buscar status da conexão
  getStatus: () => apiRequest('/api/whatsapp/status'),
  
  // Gerar QR Code
  generateQR: () => apiRequest('/api/whatsapp/qr'),
  
  // Desconectar WhatsApp
  disconnect: () => apiRequest('/api/whatsapp/disconnect', {
    method: 'POST',
  }),
};

// API para IA
export const aiAPI = {
  // Buscar configurações da IA
  getConfig: () => apiRequest('/api/ai/config'),
  
  // Atualizar configurações da IA
  updateConfig: (config) => apiRequest('/api/ai/config', {
    method: 'POST',
    body: config,
  }),
  
  // Gerar mensagem com IA
  generateMessage: (clientData, context) => apiRequest('/api/ai/generate-message', {
    method: 'POST',
    body: { clientData, context },
  }),
};

// API para logs de mensagens
export const logsAPI = {
  // Buscar todos os logs
  getAll: () => apiRequest('/api/logs'),
  
  // Buscar logs com filtros
  getFiltered: (filters) => {
    const queryParams = new URLSearchParams(filters);
    return apiRequest(`/api/logs?${queryParams}`);
  },
  
  // Buscar estatísticas
  getStats: () => apiRequest('/api/logs/stats'),
};

// API para backup
export const backupAPI = {
  // Fazer backup manual
  manual: () => apiRequest('/api/backup/manual', {
    method: 'POST',
  }),
  
  // Buscar status do backup
  getStatus: () => apiRequest('/api/backup/status'),
  
  // Buscar configurações do backup
  getConfig: () => apiRequest('/api/backup/config'),
  
  // Atualizar configurações do backup
  updateConfig: (config) => apiRequest('/api/backup/config', {
    method: 'POST',
    body: config,
  }),
};

// Função utilitária para formatar datas
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Função utilitária para calcular dias até vencimento
export const calculateDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Função utilitária para formatar valores monetários
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função utilitária para validar número de telefone
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
};

// Função utilitária para formatar número de telefone
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export default {
  clientsAPI,
  whatsappAPI,
  aiAPI,
  logsAPI,
  backupAPI,
  formatDate,
  calculateDaysUntilExpiry,
  formatCurrency,
  validatePhoneNumber,
  formatPhoneNumber,
};

