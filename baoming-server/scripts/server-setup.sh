#!/bin/bash
# ============================================================
# baoming-server 服务器初始化脚本
# 在服务器上以 root 身份执行一次即可
#
# 用法: sudo bash server-setup.sh
# ============================================================
set -e

APP_DIR="/opt/baoming-server"
APP_USER="baoming"

echo "========================================="
echo " baoming-server 服务器初始化"
echo "========================================="

# 1. 安装 Java 17（如未安装）
echo ""
echo "[1/6] 检查 Java 17..."
if ! java -version 2>&1 | grep -q "17"; then
    echo "安装 OpenJDK 17..."
    apt update && apt install -y openjdk-17-jdk-headless
else
    echo "✅ Java 17 已安装"
fi

# 2. 创建专用用户
echo ""
echo "[2/6] 创建应用用户: $APP_USER"
if id "$APP_USER" &>/dev/null; then
    echo "✅ 用户 $APP_USER 已存在"
else
    useradd -r -s /bin/false -m -d /opt/baoming-server baoming
    echo "✅ 用户 $APP_USER 已创建"
fi

# 3. 创建应用目录
echo ""
echo "[3/6] 创建应用目录: $APP_DIR"
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
echo "✅ 目录已创建"

# 4. 安装 systemd 服务
echo ""
echo "[4/6] 安装 systemd 服务..."
cat > /etc/systemd/system/baoming-server.service << 'SERVICE_EOF'
[Unit]
Description=baoming-server - 小棕熊预约报名后端服务
After=network.target
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

# 5. 创建初始环境变量文件（之后由 GitHub Actions 自动更新）
echo ""
echo "[5/6] 创建环境变量模板..."
cat > "$APP_DIR/.env" << 'ENV_EOF'
# 此文件由 GitHub Actions 自动更新，请勿手动修改
# 如需手动测试，替换以下占位符
SPRING_DATASOURCE_URL=jdbc:postgresql://127.0.0.1:5432/mydb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=请替换为实际密码
APP_JWT_SECRET=请替换为随机字符串至少32位
APP_CORS_ALLOWED_ORIGINS=https://你的域名.com
ENV_EOF
chmod 600 "$APP_DIR/.env"
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
echo "✅ 环境变量模板已创建（请编辑 $APP_DIR/.env 填入真实值）"

# 6. 设置防火墙（如启用 ufw）
echo ""
echo "[6/6] 防火墙检查..."
if command -v ufw &>/dev/null && ufw status | grep -q active; then
    echo "ufw 已启用，请确保 8080 端口开放："
    echo "  sudo ufw allow 8080/tcp"
else
    echo "⚠ 未检测到 ufw，如需开放端口请手动配置"
fi

echo ""
echo "========================================="
echo " ✅ 初始化完成！"
echo "========================================="
echo ""
echo "下一步操作："
echo "1. 编辑环境变量: vi $APP_DIR/.env"
echo "2. 在 GitHub 仓库设置 Secrets（见下方说明）"
echo "3. 推送代码触发自动部署，或手动启动服务："
echo "   sudo systemctl start baoming-server"
echo "   sudo systemctl enable baoming-server  # 开机自启"
echo "   sudo systemctl status baoming-server  # 查看状态"
echo "   sudo journalctl -u baoming-server -f  # 查看日志"
echo ""
