#!/bin/bash

# ========================================
# GENESIS LUMINAL - SECRET MANAGER SETUP
# Script para configurar Secret Manager em diferentes clouds
# ========================================

set -e

echo "🔐 GENESIS LUMINAL - SECRET MANAGER SETUP"
echo "=========================================="

# Funções de utilidade
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ ERROR: $1 is not installed"
    return 1
  fi
  echo "✅ $1 is available"
  return 0
}

setup_azure() {
  echo "🔵 Setting up Azure Key Vault..."
  
  # Verificar Azure CLI
  if ! check_command az; then
    echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
  fi

  read -p "Enter Azure Key Vault name: " VAULT_NAME
  read -p "Enter Azure Resource Group: " RESOURCE_GROUP
  read -p "Enter Azure Location (default: eastus): " LOCATION
  LOCATION=${LOCATION:-eastus}

  echo "Creating Azure Key Vault..."
  az keyvault create \
    --name "$VAULT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --enable-rbac-authorization

  echo "Setting environment variables..."
  echo "AZURE_KEY_VAULT_NAME=$VAULT_NAME" >> .env.production
  echo "SECRET_MANAGER_PROVIDER=azure" >> .env.production

  echo "✅ Azure Key Vault setup completed!"
  echo "🔑 Please set up Azure credentials for your application"
}

setup_aws() {
  echo "🟠 Setting up AWS Secrets Manager..."
  
  # Verificar AWS CLI
  if ! check_command aws; then
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
  fi

  read -p "Enter AWS Region (default: us-east-1): " AWS_REGION
  AWS_REGION=${AWS_REGION:-us-east-1}

  echo "Testing AWS credentials..."
  aws sts get-caller-identity

  echo "Setting environment variables..."
  echo "AWS_REGION=$AWS_REGION" >> .env.production
  echo "SECRET_MANAGER_PROVIDER=aws" >> .env.production

  echo "✅ AWS Secrets Manager setup completed!"
  echo "🔑 Make sure your AWS credentials are properly configured"
}

setup_gcp() {
  echo "🔴 Setting up Google Cloud Secret Manager..."
  
  # Verificar gcloud CLI
  if ! check_command gcloud; then
    echo "Please install Google Cloud CLI: https://cloud.google.com/sdk/docs/install"
    exit 1
  fi

  read -p "Enter GCP Project ID: " PROJECT_ID

  echo "Enabling Secret Manager API..."
  gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"

  echo "Setting environment variables..."
  echo "GCP_PROJECT_ID=$PROJECT_ID" >> .env.production
  echo "SECRET_MANAGER_PROVIDER=gcp" >> .env.production

  echo "✅ Google Cloud Secret Manager setup completed!"
  echo "🔑 Make sure your GCP credentials are properly configured"
}

migrate_secrets() {
  echo "📦 Migrating secrets from .env to Secret Manager..."
  
  if [ ! -f .env ]; then
    echo "❌ .env file not found"
    return 1
  fi

  echo "Found .env file. Migrating secrets..."
  
  # Ler secrets do .env
  while IFS='=' read -r key value; do
    # Pular comentários e linhas vazias
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Verificar se é um secret (contém KEY, SECRET, TOKEN, PASSWORD)
    if [[ $key =~ (KEY|SECRET|TOKEN|PASSWORD) ]]; then
      echo "Migrating secret: $key"
      
      # Usar o script Node.js para migrar
      node -e "
        const { getSecretManager } = require('./backend/dist/config/secretManager.js');
        (async () => {
          const sm = getSecretManager();
          await sm.setSecret('$key', '$value');
          console.log('✅ Migrated: $key');
        })();
      "
    fi
  done < .env

  echo "🔄 Creating backup of .env as .env.backup"
  cp .env .env.backup

  echo "⚠️  Please review and remove secrets from .env file manually"
  echo "💡 Keep only non-sensitive configuration in .env"
}

install_dependencies() {
  echo "📦 Installing Secret Manager dependencies..."
  
  cd backend
  
  case $1 in
    azure)
      npm install @azure/keyvault-secrets @azure/identity
      ;;
    aws)
      npm install @aws-sdk/client-secrets-manager
      ;;
    gcp)
      npm install @google-cloud/secret-manager
      ;;
    *)
      echo "Installing all Secret Manager providers..."
      npm install @azure/keyvault-secrets @azure/identity @aws-sdk/client-secrets-manager @google-cloud/secret-manager
      ;;
  esac
  
  cd ..
  echo "✅ Dependencies installed!"
}

setup_git_hooks() {
  echo "🪝 Setting up Git hooks for secret detection..."
  
  # Instalar husky se não estiver instalado
  if [ ! -d .husky ]; then
    npx husky-init
  fi

  # Criar pre-commit hook
  cat > .husky/pre-commit << 'HOOK_EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running secret detection..."

# Verificar se há arquivos .env sendo commitados
staged_files=$(git diff --cached --name-only)
if echo "$staged_files" | grep -E "\.env$|\.env\.local$|\.env\.production$"; then
  echo "🚨 ERROR: .env files should not be committed!"
  echo "Please remove .env files from staging area:"
  echo "$staged_files" | grep -E "\.env$|\.env\.local$|\.env\.production$"
  exit 1
fi

# Executar validação de secrets personalizada
cd backend && npm run validate:secrets
if [ $? -ne 0 ]; then
  echo "🚨 ERROR: Secrets detected in staged files!"
  exit 1
fi

echo "✅ Secret validation passed"
HOOK_EOF

  chmod +x .husky/pre-commit
  echo "✅ Git hooks configured!"
}

main() {
  echo "Select Secret Manager provider:"
  echo "1) Azure Key Vault"
  echo "2) AWS Secrets Manager" 
  echo "3) Google Cloud Secret Manager"
  echo "4) Local development only"
  
  read -p "Choose option (1-4): " choice

  case $choice in
    1)
      install_dependencies azure
      setup_azure
      ;;
    2)
      install_dependencies aws
      setup_aws
      ;;
    3)
      install_dependencies gcp
      setup_gcp
      ;;
    4)
      echo "🏠 Setting up for local development..."
      echo "SECRET_MANAGER_PROVIDER=local" >> .env
      ;;
    *)
      echo "❌ Invalid option"
      exit 1
      ;;
  esac

  setup_git_hooks
  
  read -p "Do you want to migrate existing secrets from .env? (y/n): " migrate
  if [[ $migrate =~ ^[Yy]$ ]]; then
    migrate_secrets
  fi

  echo ""
  echo "🎉 Secret Manager setup completed!"
  echo ""
  echo "📋 Next steps:"
  echo "1. Review .env.production file"
  echo "2. Configure cloud provider credentials"
  echo "3. Test secret retrieval: npm run test:secrets"
  echo "4. Remove sensitive data from .env files"
  echo "5. Commit and push your changes"
  echo ""
  echo "⚠️  Important: Never commit .env files with real secrets!"
}

main "$@"
