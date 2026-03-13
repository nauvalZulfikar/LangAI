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

# Install Nginx
apt-get install -y nginx

# Install Git
apt-get install -y git

# Setup app directory
mkdir -p /var/www/langai/apps/web/prisma

# Clone repo
cd /var/www/langai
git clone https://github.com/nauvalZulfikar/LangAI.git .

# Install deps
cd apps/web
npm ci

# Setup Nginx
cp /var/www/langai/scripts/nginx.conf /etc/nginx/sites-available/langai
ln -sf /etc/nginx/sites-available/langai /etc/nginx/sites-enabled/langai
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup PM2 startup
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

echo "=== Setup complete! ==="
echo "Now add your .env.production file to /var/www/langai/apps/web/"
echo "Then run: cd /var/www/langai/apps/web && npm run build && pm2 start /var/www/langai/ecosystem.config.js && pm2 save"
