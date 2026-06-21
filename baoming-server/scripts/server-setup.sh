#!/bin/bash
# ============================================================
# baoming-server (Spring Boot) 服务器一键初始化脚本
#
# 用法（二选一）：
#   方式A: scp 上传后执行
#     scp scripts/server-setup.sh root@8.134.252.128:/tmp/
#     ssh root@8.134.252.128 "sudo bash /tmp/server-setup.sh"
#
#   方式B: 直接粘贴到服务器终端
#     ssh root@8.134.252.128
#     然后把下面所有内容粘贴进去
# ============================================================
set -e

# ---- 配置变量 ----
APP_DIR="/opt/baoming-server"
APP_USER="baoming"
APP_PORT="8080"
NGINX_CONF="/etc/nginx/conf.d/baoming.conf"

# ---- 颜色输出 ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   baoming-server Spring Boot 服务器初始化            ║"
echo "║   目标: 8.134.252.128                                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ============================================================
# 1. 检查操作系统
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [1/6] 检查操作系统"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    info "操作系统: $NAME $VERSION"
else
    warn "无法识别操作系统，继续..."
fi

# ============================================================
# 2. 检查/安装 Java 17
# ============================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [2/6] 检查/安装 Java 17"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

JAVA_OK=false
if command -v java &>/dev/null; then
    JAVA_VER=$(java -version 2>&1 | head -1)
    info "当前 Java 版本: $JAVA_VER"
    if java -version 2>&1 | grep -qE '"17|"18|"19|"20|"21'; then
        info "✅ Java 版本满足要求 (>=17)"
        JAVA_OK=true
    fi
fi

if [ "$JAVA_OK" = false ]; then
    info "正在安装 OpenJDK 17..."
    if command -v apt &>/dev/null; then
        apt update -qq && apt install -y openjdk-17-jdk-headless
    elif command -v yum &>/dev/null; then
        yum install -y java-17-openjdk-headless
    else
        error "无法识别的包管理器，请手动安装 Java 17"
        exit 1
    fi
    info "✅ OpenJDK 17 安装完成"
    info "Java 路径: $(readlink -f $(which java))"
fi

# ============================================================
# 3. 创建应用用户
# ============================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [3/6] 创建应用用户"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if id "$APP_USER" &>/dev/null; then
    info "✅ 用户 '$APP_USER' 已存在"
    info "   UID: $(id -u $APP_USER)"
    info "   家目录: $(eval echo ~$APP_USER)"
    info "   Shell: $(getent passwd $APP_USER | cut -d: -f7)"
else
    info "创建用户 '$APP_USER'..."
    useradd -r -s /bin/false -m -d "$APP_DIR" "$APP_USER"
    info "✅ 用户 '$APP_USER' 创建成功"
    info "   UID: $(id -u $APP_USER)"
    info "   家目录: $(eval echo ~$APP_USER)"
    info "   说明: -r 系统账号, -s /bin/false 禁止登录, -m 创建家目录"
fi

# ============================================================
# 4. 创建应用目录和环境变量
# ============================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [4/6] 创建应用目录和环境变量"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

info "创建目录: $APP_DIR"
mkdir -p "$APP_DIR"

info "写入环境变量文件: $APP_DIR/.env"
cat > "$APP_DIR/.env" << 'ENV_EOF'
# ==========================================
# baoming-server 环境变量
# 此文件由 server-setup.sh 初始化，
# 后续由 GitHub Actions 自动更新
# ==========================================
# --- 数据库 (PostgreSQL) ---
SPRING_DATASOURCE_URL=jdbc:postgresql://127.0.0.1:5432/mydb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=Aled2239
# --- JWT ---
APP_JWT_SECRET=baoming_jwt_secret_2024_key
# --- CORS ---
APP_CORS_ALLOWED_ORIGINS=https://ledbell.cn,http://ledbell.cn,http://8.134.252.128,http://localhost:3000,http://127.0.0.1:3000
# --- 日志级别 ---
LOG_LEVEL=DEBUG
ENV_EOF

chmod 600 "$APP_DIR/.env"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
info "✅ 目录权限已设置"
echo ""
info "当前 .env 内容:"
cat "$APP_DIR/.env" | grep -v PASSWORD | while read line; do info "  $line"; done
info "  SPRING_DATASOURCE_PASSWORD=******"

# ============================================================
# 5. 安装 systemd 服务
# ============================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [5/6] 安装 systemd 服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

info "写入服务文件: /etc/systemd/system/baoming-server.service"
cat > /etc/systemd/system/baoming-server.service << 'SERVICE_EOF'
[Unit]
Description=baoming-server - 小棕熊预约报名 Spring Boot 后端
Documentation=https://github.com/ckd919/baoming-server
After=network.target postgresql.service
Wants=network.target

[Service]
Type=simple
User=baoming
Group=baoming
WorkingDirectory=/opt/baoming-server

# 从 .env 文件加载环境变量
EnvironmentFile=/opt/baoming-server/.env

# 启动命令（限制内存，适合 1-2GB 小服务器）
ExecStart=/usr/bin/java \
    -Xmx256m -Xms128m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -jar /opt/baoming-server/app.jar

# 优雅关闭：先 SIGTERM，15 秒后仍存活则 SIGKILL
ExecStop=/bin/kill -15 $MAINPID
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=15

# 崩溃自动重启
Restart=on-failure
RestartSec=10

# 日志输出到 journald
StandardOutput=journal
StandardError=journal
SyslogIdentifier=baoming-server

# 安全加固
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/baoming-server /tmp
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
info "✅ systemd 服务已安装"
info ""
info "服务摘要:"
info "  可执行文件: /opt/baoming-server/app.jar (GitHub Actions 自动部署)"
info "  JVM 内存: -Xmx256m -Xms128m"
info "  崩溃重启: 延迟 10 秒"
info "  优雅关闭: 15 秒超时"

# ============================================================
# 6. 配置 Nginx 反向代理
# ============================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  [6/6] 配置 Nginx 反向代理"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$NGINX_CONF" ]; then
    info "已找到 Nginx 配置: $NGINX_CONF"

    if grep -q "proxy_pass.*3001" "$NGINX_CONF"; then
        info "检测到当前代理目标为 Node.js :3001，自动切换为 Spring Boot :8080..."
        sed -i 's|proxy_pass.*http://127.0.0.1:3001.*|proxy_pass http://127.0.0.1:8080;|' "$NGINX_CONF"
        info "✅ Nginx 代理已切换: 3001 (Node.js) → 8080 (Spring Boot)"
    else
        info "✅ Nginx 代理目标已不是 :3001，无需修改"
    fi

    # 测试配置
    if nginx -t 2>&1; then
        systemctl reload nginx
        info "✅ Nginx 配置检查通过，已重载"
    else
        error "Nginx 配置有误，请手动检查: nginx -t"
    fi
else
    warn "未找到 $NGINX_CONF"
    warn "请手动添加 Nginx 反向代理配置，将 /api/ 指向 http://127.0.0.1:8080"
    echo ""
    echo "示例配置:"
    echo "  location /api/ {"
    echo "      proxy_pass http://127.0.0.1:8080;"
    echo "      proxy_set_header Host \$host;"
    echo "      proxy_set_header X-Real-IP \$remote_addr;"
    echo "  }"
fi

# ============================================================
# 验证汇总
# ============================================================
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ 服务器初始化完成！                              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "┌─── 环境验证 ──────────────────────────────────────┐"
echo "│ Java:      $(java -version 2>&1 | head -1 | sed 's/^/  /')"
echo "│ 应用用户:  $(id $APP_USER 2>/dev/null && echo '✅ baoming 已创建' || echo '❌ 不存在')"
echo "│ 应用目录:  $(ls -la $APP_DIR/.env 2>/dev/null >/dev/null && echo '✅ /opt/baoming-server/ 已配置' || echo '❌ 未配置')"
echo "│ systemd:   $(systemctl list-unit-files baoming-server.service 2>/dev/null | grep -q baoming && echo '✅ 已安装' || echo '❌ 未安装')"
echo "│ Nginx:     $(nginx -v 2>&1 | head -1 | sed 's/^/  /')"
echo "└────────────────────────────────────────────────────┘"
echo ""
echo "┌─── 后续步骤 ──────────────────────────────────────┐"
echo "│                                                    │"
echo "│  1️⃣  添加 GitHub Actions 公钥（见第2步）              │"
echo "│     mkdir -p /home/baoming/.ssh                     │"
echo "│     echo '公钥内容' >> /home/baoming/.ssh/authorized_keys │"
echo "│     chown -R baoming:baoming /home/baoming/.ssh     │"
echo "│     chmod 700 /home/baoming/.ssh                    │"
echo "│     chmod 600 /home/baoming/.ssh/authorized_keys    │"
echo "│                                                    │"
echo "│  2️⃣  推送代码触发 GitHub Actions 自动部署             │"
echo "│     git push                                        │"
echo "│                                                    │"
echo "│  3️⃣  手动启动（可先不操作，等 GitHub Actions 部署） │"
echo "│     sudo systemctl start baoming-server             │"
echo "│     sudo systemctl enable baoming-server            │"
echo "│     sudo systemctl status baoming-server            │"
echo "│                                                    │"
echo "│  4️⃣  查看日志                                       │"
echo "│     sudo journalctl -u baoming-server -f            │"
echo "│                                                    │"
echo "└────────────────────────────────────────────────────┘"
echo ""
