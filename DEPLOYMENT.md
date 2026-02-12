# Medaltea Backend - VPS Deployment Guide

Complete guide for deploying the Medaltea FastAPI backend on a VPS.

## Prerequisites

- VPS with Debian 11/12 or Ubuntu 22.04 LTS
- Root or sudo access
- Domain name pointing to your VPS IP (optional but recommended for SSL)
- API keys: Groq API, OpenAI API

## Quick Start

### 1. Prepare Your VPS

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/TomMbn/Medaltea/dev/deploy-vps.sh -o deploy-vps.sh
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

The script will:
- Install Docker and Docker Compose
- Install Nginx
- Install Certbot for SSL
- Clone your repository
- Configure environment variables
- Setup Nginx reverse proxy
- Configure SSL (optional)
- Start all services

### 2. Manual Deployment (Alternative)

If you prefer manual control:

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

#### Step 2: Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/medaltea
cd /opt/medaltea

# Clone repository
sudo git clone https://github.com/TomMbn/Medaltea.git .
```

#### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

Fill in:
- `GROQ_API_KEY` - From https://console.groq.com/keys
- `OPENAI_API_KEY` - From https://platform.openai.com/api-keys
- `POSTGRES_PASSWORD` - Choose a secure password

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/medaltea`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/medaltea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: Setup SSL (Recommended)

```bash
sudo certbot --nginx -d api.yourdomain.com
```

#### Step 6: Deploy Services

```bash
# Use production docker-compose
sudo docker compose -f docker-compose.prod.yml up -d --build
```

## Verification

### Check Services Status

```bash
# View running containers
docker compose ps

# Check logs
docker compose logs -f

# Check specific service
docker compose logs -f rag_api
```

### Test Endpoints

```bash
# Test RAG API health
curl https://api.yourdomain.com/api/health

# Test chat endpoint
curl -X POST https://api.yourdomain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour", "history": []}'
```

## Maintenance

### Update Application

```bash
cd /opt/medaltea
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f rag_api
docker compose logs -f vector_db_api
docker compose logs -f db
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart rag_api
```

### Stop Services

```bash
docker compose down
```

### Backup Database

```bash
# Backup
docker compose exec db pg_dump -U medaltea medaltea_db > backup.sql

# Restore
docker compose exec -T db psql -U medaltea medaltea_db < backup.sql
```

## Monitoring

### Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop
```

### Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose logs

# Check environment variables
docker compose config
```

### Database Connection Issues

```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker compose exec db psql -U medaltea -d medaltea_db
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Security Recommendations

1. **Firewall**: Configure UFW
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **SSH**: Disable password authentication, use SSH keys only

3. **Environment Variables**: Never commit `.env` to git
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

4. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Cost Estimate

### VPS Providers (4 vCPU, 8 GB RAM)

- **Hetzner CPX31**: ~8€/mois
- **OVH VPS Comfort**: ~12€/mois
- **DigitalOcean**: ~45€/mois
- **Scaleway DEV1-M**: ~12€/mois

### API Costs (Estimated)

- **Groq API**: Free tier available, then pay-per-use
- **OpenAI Embeddings**: ~$0.13 per 1M tokens

## Support

For issues, check:
1. Docker logs: `docker compose logs -f`
2. Nginx logs: `/var/log/nginx/error.log`
3. System logs: `journalctl -xe`
