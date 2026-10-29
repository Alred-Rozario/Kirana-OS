#!/bin/bash
# ==============================================================================
# Kirana-OS AWS EC2 Automated Deployment & Setup Script
# Target OS: Ubuntu 22.04 / 24.04 LTS on AWS EC2 (t2.micro / t3.micro Free Tier)
# Services Configured:
#   1. AWS EC2 (Compute runtime with Python 3, Gunicorn, systemd)
#   2. Nginx (Reverse proxy & SSL termination)
#   3. AWS S3 & CloudFront environment linking
# ==============================================================================

set -e

echo "🚀 [1/6] Updating Ubuntu packages..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv nginx git curl ufw

echo "📂 [2/6] Setting up project directory..."
PROJECT_DIR="/var/www/kirana-os"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

echo "🐍 [3/6] Setting up Python virtual environment..."
cd $PROJECT_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

echo "⚙️ [4/6] Creating Systemd Service for Flask Backend..."
sudo bash -c "cat <<EOF > /etc/systemd/system/kirana-backend.service
[Unit]
Description=Gunicorn instance to serve Kirana-OS Flask Backend on AWS EC2
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=$PROJECT_DIR/backend
Environment=\"PATH=$PROJECT_DIR/backend/venv/bin\"
ExecStart=$PROJECT_DIR/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl start kirana-backend
sudo systemctl enable kirana-backend

echo "🌐 [5/6] Configuring Nginx Reverse Proxy..."
sudo bash -c "cat <<EOF > /etc/nginx/sites-available/kirana-os
server {
    listen 80;
    server_name _;

    # Serve built React frontend
    location / {
        root $PROJECT_DIR/frontend/dist;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API calls to Flask Gunicorn backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Serve uploaded media fallback
    location /static/cloud_s3/ {
        alias $PROJECT_DIR/backend/static/cloud_s3/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
}
EOF"

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/kirana-os /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "🛡️ [6/6] Configuring Firewall (UFW)..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
echo "y" | sudo ufw enable

echo "=========================================================="
echo "✅ Kirana-OS is now successfully deployed on AWS EC2!"
echo "• Compute: AWS EC2 (t3.micro) + Systemd + Nginx"
echo "• S3 & CloudFront: Configured via backend/.env"
echo "• Access your application at: http://$(curl -s http://checkip.amazonaws.com)"
echo "=========================================================="

