#!/bin/bash
# ============================================================
# baoming-server (Spring Boot) 服务器初始化脚本
# 前提：服务器已有 PostgreSQL、Nginx、Java 17
# 用法: ssh root@你的服务器IP 'bash -s' < server-setup.sh
# ============================================================
set -e

APP_DIR="/opt/baoming-server"
APP_USER="baoming"

echo "========================================="
echo " baoming-server 服务器初始化"
echo "========================================="

# --------------------------------------------------
# 1. 检查 Java 17
# --------------------------------------------------
echo ""
echo "[1/5] 检查 Java 17..."
if command -v java &>/dev/null && java -version 2>&1 | grep -qE "17|21"; then
    echo "✅ Java 已安装: $(java -version 2>&1 | head -1)"
else
    echo "安装 OpenJDK 17..."
    apt update && apt install -y openjdk-17-jdk-headless
fi

# --------------------------------------------------
# 2. 创建应用用户（如不存在）
# --------------------------------------------------
echo ""
echo "[2/5] 创建应用用户: $APP_USER"
if id "$APP_USER" &>/dev/null; then
    echo "✅ 用户 $APP_USER 已存在"
else
    useradd -r -s /bin/false -m -d "$APP_DIR" "$APP_USER"
    echo "✅ 用户 $APP_USER 已创建"
fi

# --------------------------------------------------
# 3. 创建应用目录
# --------------------------------------------------
echo ""
echo "[3/5] 创建应用目录: $APP_DIR"
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# 创建初始 .env 文件（由 GitHub Actions 后续自动更新）
cat > "$APP_DIR/.env" << 'ENV_EOF'
SPRING_DATASOURCE_URL=jdbc:postgresql://127.0.0.1:5432/mydb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=Aled2239
APP_JWT_SECRET=baoming_jwt_secret_2024_key
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENV_EOF
chmod 600 "$APP_DIR/.env"
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
echo "✅ 环境变量已写入 $APP_DIR/.env"

# --------------------------------------------------
# 4. 安装 systemd 服务
# --------------------------------------------------
echo ""
echo "[4/5] 安装 systemd 服务..."
cat > /etc/systemd/system/baoming-server.service << 'SERVICE_EOF'
[Unit]
Description=baoming-server - Spring Boot 后端服务
After=network.target postgresql.service
Wants=network.target

[Service]
Type=simple
User=baoming
Group=baoming
WorkingDirectory=/opt/baoming-server
EnvironmentFile=/opt/baoming-server/.env
ExecStart=/usr/bin/java -Xmx256m -Xms128m -jar /opt/baoming-server/app.jar
ExecStop=/bin/kill -15 $MAINPID

Restart=on-failure
RestartSec=10

StandardOutput=journal
StandardError=journal
SyslogIdentifier=baoming-server

NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/baoming-server /tmp
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
echo "✅ systemd 服务已安装"

# --------------------------------------------------
# 5. 修改 Nginx 代理 → 指向 Spring Boot 8080 端口
# --------------------------------------------------
echo ""
echo "[5/5] 检查 Nginx 配置..."
NGINX_CONF="/etc/nginx/conf.d/baoming.conf"
if [ -f "$NGINX_CONF" ]; then
    if grep -q "proxy_pass.*3001" "$NGINX_CONF"; then
        echo "⚠ 当前 Nginx 代理指向 Node.js :3001，需要改为 Spring Boot :8080"
        read -p "是否自动修改？[Y/n] " answer
        if [ "$answer" != "n" ] && [ "$answer" != "N" ]; then
            sed -i 's|proxy_pass.*http://127.0.0.1:3001|proxy_pass http://127.0.0.1:8080|' "$NGINX_CONF"
            nginx -t && systemctl reload nginx
            echo "✅ Nginx 代理已切换至 :8080（Spring Boot）"
        else
            echo "请手动编辑: vi $NGINX_CONF"
            echo "将 3001 改为 8080，然后执行 nginx -t && systemctl reload nginx"
        fi
    else
        echo "✅ Nginx 配置无需修改"
    fi
else
    echo "⚠ 未找到 $NGINX_CONF，请手动配置 Nginx 代理到 127.0.0.1:8080"
fi

echo ""
echo "========================================="
echo " ✅ 服务器初始化完成！"
echo "========================================="
echo ""
echo "目录结构："
echo "  /opt/baoming-server/"
echo "  ├── app.jar          ← GitHub Actions 自动上传"
echo "  ├── app.jar.bak      ← 上一版本备份"
echo "  └── .env             ← 环境变量"
echo ""
echo "运维命令："
echo "  sudo systemctl start baoming-server     # 启动"
echo "  sudo systemctl stop baoming-server      # 停止"
echo "  sudo systemctl restart baoming-server   # 重启"
echo "  sudo systemctl status baoming-server    # 状态"
echo "  sudo journalctl -u baoming-server -f    # 日志"
echo ""
echo "下一步 → 去 GitHub 配置 Secrets（见下方说明）"
echo ""
