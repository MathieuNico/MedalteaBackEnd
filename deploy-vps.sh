#!/bin/bash
set -e

# Medaltea Backend Deployment Script for VPS
# This script automates the deployment of the Medaltea backend on a Debian/Ubuntu VPS

echo "🚀 Medaltea Backend Deployment Script"
echo "======================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "✅ Docker already installed"
fi

# Install Nginx
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
else
    echo "✅ Nginx already installed"
fi

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot already installed"
fi

# Create application directory
APP_DIR="/opt/medaltea"
echo "📁 Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository (if not already present)
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    read -p "Enter your GitHub repository URL: " REPO_URL
    git clone $REPO_URL .
else
    echo "✅ Repository already cloned"
    echo "🔄 Pulling latest changes..."
    git pull
fi

# Create .env file if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚙️  Creating .env file..."
    echo "Please provide the following environment variables:"
    
    read -p "GROQ_API_KEY: " GROQ_KEY
    read -p "OPENAI_API_KEY: " OPENAI_KEY
    read -p "PostgreSQL User (default: medaltea): " PG_USER
    PG_USER=${PG_USER:-medaltea}
    read -sp "PostgreSQL Password: " PG_PASS
    echo
    read -p "PostgreSQL Database (default: medaltea_db): " PG_DB
    PG_DB=${PG_DB:-medaltea_db}
    
    cat > .env << EOF
# API Keys
GROQ_API_KEY=$GROQ_KEY
OPENAI_API_KEY=$OPENAI_KEY

# Database
POSTGRES_USER=$PG_USER
POSTGRES_PASSWORD=$PG_PASS
POSTGRES_DB=$PG_DB
CONNECTION_STRING_PGVECTOR=postgresql+psycopg://$PG_USER:$PG_PASS@db:5432/$PG_DB

# Models
CHAT_MODEL=openai/gpt-oss-120b
EMBEDDING_MODEL=text-embedding-3-large
COLLECTION_NAME=my_docs

# Services
VECTOR_DB_API_URL=http://vector_db_api:8001
EOF
    
    chmod 600 .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Configure Nginx
echo "🌐 Configuring Nginx..."
read -p "Enter your domain name (e.g., api.medaltea.com): " DOMAIN

cat > /etc/nginx/sites-available/medaltea << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # RAG API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Vector DB API (optionnel, peut être privé)
    location /vector/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/medaltea /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx configured"

# Setup SSL with Let's Encrypt
read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " SETUP_SSL
if [ "$SETUP_SSL" = "y" ]; then
    read -p "Enter your email for SSL certificate: " EMAIL
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
    echo "✅ SSL configured"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker compose up -d --build

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check service status: docker compose ps"
echo "2. View logs: docker compose logs -f"
echo "3. Test API: curl https://$DOMAIN/api/health"
echo ""
echo "🔧 Useful commands:"
echo "- Update: cd $APP_DIR && git pull && docker compose up -d --build"
echo "- Stop: docker compose down"
echo "- Restart: docker compose restart"
echo "- Logs: docker compose logs -f [service_name]"
