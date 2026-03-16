#!/bin/bash
set -e

echo "=== LangAI VPS Setup ==="

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx & Certbot
apt-get install -y nginx certbot python3-certbot-nginx git

# Setup app directory
mkdir -p /var/www/langai/apps/web/prisma

# Clone repo (skip if already exists)
if [ ! -d "/var/www/langai/.git" ]; then
  cd /var/www/langai
  git clone https://github.com/nauvalZulfikar/LangAI.git .
fi

# Install deps
cd /var/www/langai/apps/web
npm ci

# Setup Nginx dengan HTTP dulu (sebelum certbot)
cat > /etc/nginx/sites-available/langai << 'NGINXEOF'
server {
    listen 80;
    server_name linguaflow.aureonforge.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/langai /etc/nginx/sites-enabled/langai
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup SSL dengan Certbot
certbot --nginx -d linguaflow.aureonforge.com --non-interactive --agree-tos -m admin@aureonforge.com

# Setup PM2 startup
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

echo "=== Setup complete! ==="
echo "Next: GitHub Actions will handle deploys automatically on push to main"
echo "Make sure to set these GitHub Secrets:"
echo "  VPS_HOST=72.60.196.21"
echo "  VPS_SSH_KEY=<private key>"
echo "  DATABASE_URL=file:/var/www/langai/apps/web/prisma/prod.db"
echo "  NEXTAUTH_SECRET=<your secret>"
echo "  OPENAI_API_KEY=<your key>"
