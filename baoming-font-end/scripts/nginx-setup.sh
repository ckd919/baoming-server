#!/bin/bash
# ================================================================
# baoming-font-end Nginx 配置脚本
# 用法: 将此脚本上传到服务器后以 root 运行
#   scp scripts/nginx-setup.sh baoming@8.134.252.128:/tmp/
#   ssh baoming@8.134.252.128 "sudo bash /tmp/nginx-setup.sh"
# ================================================================

set -e

APP_NAME="baoming-font-end"
WEB_ROOT="/var/www/baoming"
NGINX_CONF="/etc/nginx/conf.d/baoming.conf"
SERVER_IP="8.134.252.128"
DOMAIN="ledbell.cn"

echo "=== 配置 ${APP_NAME} Nginx 静态站点 ==="

# 1. 确保 web 根目录存在
echo ">>> 创建 web 根目录: ${WEB_ROOT}"
mkdir -p "${WEB_ROOT}"

# 2. 设置权限
echo ">>> 设置目录权限"
chown -R baoming:baoming "${WEB_ROOT}"
chmod 755 "${WEB_ROOT}"

# 3. 检查是否已配置 HTTPS (SSL 证书)
SSL_CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
SSL_KEY_PATH="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
HAS_SSL=false
if [ -f "${SSL_CERT_PATH}" ] && [ -f "${SSL_KEY_PATH}" ]; then
    HAS_SSL=true
    echo ">>> 检测到 SSL 证书，将启用 HTTPS"
else
    echo ">>> 未检测到 SSL 证书 (${SSL_CERT_PATH})"
    echo ">>> 将仅配置 HTTP，HTTPS 可通过 certbot 后续添加"
    echo ">>> 安装 SSL 证书命令:"
    echo "    sudo apt install -y certbot python3-certbot-nginx"
    echo "    sudo certbot --nginx -d ${DOMAIN}"
fi

# 4. 写入 Nginx 配置
echo ">>> 写入 Nginx 配置: ${NGINX_CONF}"

if [ "${HAS_SSL}" = true ]; then
    cat > "${NGINX_CONF}" << 'NGINX_EOF'
# ============================================
# baoming 站点配置 — ledbell.cn
# 前端静态文件 + 后端 API 反向代理
# ============================================

# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name ledbell.cn www.ledbell.cn 8.134.252.128;

    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/baoming;
    }

    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name ledbell.cn www.ledbell.cn;

    # SSL 证书 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/ledbell.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ledbell.cn/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 前端静态文件
    root /var/www/baoming;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # SPA 路由支持：所有非文件请求回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;

        # 静态资源缓存（带 hash 的文件名可长期缓存）
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;
        proxy_read_timeout 60s;
        client_max_body_size 10m;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
NGINX_EOF
else
    cat > "${NGINX_CONF}" << 'NGINX_EOF'
# ============================================
# baoming 站点配置 — ledbell.cn
# 前端静态文件 + 后端 API 反向代理
# (HTTPS 通过 certbot 后续添加)
# ============================================

server {
    listen 80;
    server_name ledbell.cn www.ledbell.cn 8.134.252.128;

    # 前端静态文件
    root /var/www/baoming;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # SPA 路由支持：所有非文件请求回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;

        # 静态资源缓存（带 hash 的文件名可长期缓存）
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Let's Encrypt 验证目录
    location /.well-known/acme-challenge/ {
        root /var/www/baoming;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;
        proxy_read_timeout 60s;
        client_max_body_size 10m;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
NGINX_EOF
fi

# 5. 测试并重载 Nginx
echo ">>> 测试 Nginx 配置"
nginx -t

echo ">>> 重载 Nginx"
systemctl reload nginx

# 6. 验证
echo ">>> 验证部署"
echo "  - Web 根目录: $(ls -la ${WEB_ROOT})"
echo "  - Nginx 80 端口: $(ss -tlnp | grep ':80 ' || echo '  未监听')"
echo "  - Nginx 443 端口: $(ss -tlnp | grep ':443 ' || echo '  未监听 (需要配置 SSL 证书)')"

echo ""
echo "=== ${APP_NAME} Nginx 配置完成 ==="
echo ""
if [ "${HAS_SSL}" = false ]; then
    echo "┌─── HTTPS 配置步骤 ───────────────────────────────────┐"
    echo "│                                                       │"
    echo "│  安装 certbot 并获取 SSL 证书:                          │"
    echo "│    sudo apt install -y certbot python3-certbot-nginx  │"
    echo "│    sudo certbot --nginx -d ledbell.cn                 │"
    echo "│                                                       │"
    echo "│  证书自动续期（已自动配置）:                              │"
    echo "│    sudo certbot renew --dry-run                       │"
    echo "│                                                       │"
    echo "│  获取证书后，重新运行此脚本自动启用 HTTPS                   │"
    echo "│                                                       │"
    echo "└───────────────────────────────────────────────────────┘"
fi
