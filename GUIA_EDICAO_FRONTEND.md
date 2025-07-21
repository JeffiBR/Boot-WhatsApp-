# 🎨 Guia Completo para Edição do Frontend React

## 📋 Visão Geral

Este guia fornece instruções detalhadas sobre como editar e personalizar o painel de controle do Sistema de Aviso de Vencimento diretamente no Replit. O frontend foi desenvolvido em React com uma arquitetura moderna e componentes reutilizáveis.

## 📁 Estrutura de Arquivos

Após importar o projeto no Replit, você encontrará a seguinte estrutura na pasta `frontend-src/`:

```
frontend-src/
├── App.jsx                 # Componente principal da aplicação
├── App.css                 # Estilos globais da aplicação
├── main.jsx               # Ponto de entrada do React
├── index.html             # Template HTML principal
├── package.json           # Dependências e scripts do projeto
├── vite.config.js         # Configuração do Vite (bundler)
├── components.json        # Configuração dos componentes UI
├── components/            # Componentes React principais
│   ├── Sidebar.jsx        # Barra lateral de navegação
│   ├── Dashboard.jsx      # Dashboard principal com métricas
│   ├── ClientList.jsx     # Lista de clientes
│   ├── ClientForm.jsx     # Formulário de cadastro/edição
│   ├── WhatsAppConfig.jsx # Configurações do WhatsApp
│   ├── MessageLogs.jsx    # Logs de mensagens
│   ├── AIConfig.jsx       # Configurações da IA
│   ├── Settings.jsx       # Configurações gerais
│   └── ui/               # Componentes de interface (shadcn/ui)
├── hooks/                # Custom hooks React
│   ├── use-toast.js      # Hook para notificações
│   └── use-mobile.js     # Hook para detecção mobile
├── lib/                  # Utilitários e configurações
│   └── utils.js          # Funções utilitárias
└── utils/                # APIs e funções específicas
    └── api.js            # Comunicação com backend
```

## 🚀 Como Editar o Frontend no Replit

### Passo 1: Acessar os Arquivos

1. **Abra seu projeto no Replit**
2. **Navegue até a pasta `frontend-src/`** no painel de arquivos à esquerda
3. **Clique em qualquer arquivo `.jsx` ou `.css`** para abrir o editor

### Passo 2: Fazer Modificações

#### Editando Componentes React (.jsx)

Os componentes React estão na pasta `frontend-src/components/`. Cada arquivo representa uma seção do painel:

**Exemplo: Modificar o Dashboard**
```jsx
// Arquivo: frontend-src/components/Dashboard.jsx
// Localize a seção que você quer modificar e edite diretamente
```

#### Editando Estilos (.css)

Os estilos principais estão em `frontend-src/App.css`. Você pode:
- Alterar cores do tema
- Modificar layouts
- Ajustar responsividade
- Personalizar animações

### Passo 3: Rebuildar o Frontend

Após fazer suas modificações, você precisa rebuildar o frontend:

1. **Abra o terminal no Replit** (ícone de terminal na barra superior)
2. **Navegue para a pasta do frontend**:
   ```bash
   cd frontend-src
   ```
3. **Instale as dependências** (apenas na primeira vez):
   ```bash
   npm install
   ```
4. **Execute o build**:
   ```bash
   npm run build
   ```
5. **Copie os arquivos buildados para a pasta static**:
   ```bash
   cp -r dist/* ../static/
   ```

### Passo 4: Reiniciar o Servidor

1. **Pare o servidor atual** (Ctrl+C no terminal principal)
2. **Reinicie o projeto** clicando no botão "Run" ▶️
3. **Acesse a URL do seu Replit** para ver as mudanças

## 🎨 Personalizações Comuns

### Alterando Cores do Tema

Edite o arquivo `frontend-src/App.css` e modifique as variáveis CSS:

```css
:root {
  --background: 222.2 84% 4.9%;           /* Cor de fundo principal */
  --foreground: 210 40% 98%;              /* Cor do texto principal */
  --primary: 210 40% 98%;                 /* Cor primária */
  --primary-foreground: 222.2 84% 4.9%;  /* Texto sobre cor primária */
  --accent: 217.2 32.6% 17.5%;           /* Cor de destaque */
  --accent-foreground: 210 40% 98%;      /* Texto sobre cor de destaque */
}
```

### Modificando Layout do Dashboard

Edite `frontend-src/components/Dashboard.jsx` para alterar:
- Disposição dos cards de métricas
- Gráficos e estatísticas
- Layout responsivo

### Personalizando a Sidebar

Edite `frontend-src/components/Sidebar.jsx` para:
- Adicionar novos itens de menu
- Alterar ícones
- Modificar comportamento de navegação

### Customizando Formulários

Edite `frontend-src/components/ClientForm.jsx` para:
- Adicionar novos campos
- Modificar validações
- Alterar layout do formulário

## 🔧 Componentes Principais Explicados

### App.jsx
Componente raiz que gerencia:
- Roteamento entre páginas
- Estado global da aplicação
- Tema e configurações gerais

### Sidebar.jsx
Barra lateral de navegação com:
- Menu de navegação
- Seletor de produto (IPTV/VPN)
- Indicadores de status

### Dashboard.jsx
Painel principal contendo:
- Métricas e estatísticas
- Gráficos interativos
- Cards informativos
- Ações rápidas

### ClientList.jsx
Lista de clientes com:
- Tabela responsiva
- Filtros e busca
- Ações em lote
- Paginação

### ClientForm.jsx
Formulário de cadastro/edição com:
- Validação de campos
- Templates de mensagem
- Seleção de datas
- Configurações específicas por produto

## 📱 Responsividade

O sistema é totalmente responsivo. Para testar em diferentes tamanhos:

1. **No navegador**: Use as ferramentas de desenvolvedor (F12)
2. **No Replit**: A visualização se adapta automaticamente
3. **Breakpoints principais**:
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: > 1024px

## 🎯 Dicas Importantes

### ⚠️ Cuidados ao Editar

1. **Sempre faça backup** antes de grandes modificações
2. **Teste em diferentes tamanhos de tela**
3. **Verifique a funcionalidade** após mudanças
4. **Mantenha a estrutura de componentes**

### 🔄 Fluxo de Desenvolvimento

1. **Editar** arquivos `.jsx` e `.css`
2. **Buildar** com `npm run build`
3. **Copiar** arquivos para `static/`
4. **Reiniciar** servidor
5. **Testar** funcionalidades

### 📦 Dependências Importantes

O projeto usa as seguintes tecnologias:
- **React 18**: Framework principal
- **Vite**: Bundler moderno
- **Tailwind CSS**: Framework de estilos
- **shadcn/ui**: Componentes de interface
- **Lucide Icons**: Ícones modernos
- **Recharts**: Gráficos e visualizações

## 🛠️ Solução de Problemas

### Erro de Build
Se o build falhar:
```bash
cd frontend-src
rm -rf node_modules
npm install
npm run build
```

### Mudanças Não Aparecem
1. Verifique se executou o build
2. Copie os arquivos para `static/`
3. Reinicie o servidor
4. Limpe o cache do navegador

### Problemas de Dependências
```bash
cd frontend-src
npm audit fix
npm install
```

## 📚 Recursos Adicionais

### Documentação Oficial
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)

### Exemplos de Código
Todos os componentes incluem comentários explicativos e seguem as melhores práticas do React.

---

**Desenvolvido por Manus AI** 🤖
*Sistema de Aviso de Vencimento - Versão Completa*

