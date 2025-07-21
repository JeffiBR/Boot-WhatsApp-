#!/bin/bash

# 🚀 Script Automatizado para Build do Frontend
# Sistema de Aviso de Vencimento

echo "🎨 Iniciando build do frontend React..."

# Verificar se estamos no diretório correto
if [ ! -d "frontend-src" ]; then
    echo "❌ Erro: Pasta frontend-src não encontrada!"
    echo "📁 Execute este script na raiz do projeto (onde está o main.py)"
    exit 1
fi

# Navegar para a pasta do frontend
cd frontend-src

echo "📦 Instalando dependências..."
npm install

echo "🔨 Executando build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    echo "📂 Copiando arquivos para pasta static..."
    
    # Criar pasta static se não existir
    mkdir -p ../static
    
    # Copiar arquivos buildados
    cp -r dist/* ../static/
    
    echo "🎉 Frontend atualizado com sucesso!"
    echo "🔄 Reinicie o servidor para ver as mudanças"
    echo ""
    echo "💡 Para reiniciar:"
    echo "   1. Pare o servidor atual (Ctrl+C)"
    echo "   2. Clique em 'Run' novamente"
    
else
    echo "❌ Erro durante o build!"
    echo "🔍 Verifique os erros acima e corrija antes de continuar"
    exit 1
fi

echo ""
echo "📋 Resumo:"
echo "   ✅ Dependências instaladas"
echo "   ✅ Build executado"
echo "   ✅ Arquivos copiados para static/"
echo "   🔄 Pronto para reiniciar servidor"

