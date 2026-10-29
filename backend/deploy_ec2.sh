#!/bin/bash
set -e

echo "1. Moving systemd service..."
sudo mv /home/ec2-user/kirana-backend.service /etc/systemd/system/kirana-backend.service

echo "2. Setting up Nginx config..."
sudo mv /home/ec2-user/kirana-nginx.conf /etc/nginx/conf.d/kirana.conf

echo "3. Updating permissions..."
sudo chmod -R 755 /var/www/kirana-os

echo "4. Removing default server block from nginx.conf..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.orig
sudo python3 - << 'PYEOF'
with open('/etc/nginx/nginx.conf', 'r') as f:
    lines = f.readlines()

new_lines = []
in_server = False
brace_count = 0
for line in lines:
    if 'server {' in line and 'Settings for a TLS' not in line:
        in_server = True
    if in_server:
        new_lines.append('# ' + line)
        brace_count += line.count('{') - line.count('}')
        if brace_count == 0:
            in_server = False
    else:
        new_lines.append(line)

with open('/etc/nginx/nginx.conf', 'w') as f:
    f.writelines(new_lines)
print("nginx.conf default server disabled")
PYEOF

echo "5. Reloading and restarting services..."
sudo systemctl daemon-reload
sudo systemctl restart kirana-backend
sudo systemctl enable kirana-backend

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=== KIRANA BACKEND STATUS ==="
sudo systemctl is-active kirana-backend
echo "=== NGINX STATUS ==="
sudo systemctl is-active nginx
echo "DEPLOYMENT COMPLETE!"
