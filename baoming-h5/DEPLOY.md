# 🚀 报名工具 H5 — 云服务器部署指南

本指南教你如何将项目部署到云服务器，让其他人通过公网访问。

---

## 📋 前提条件

- ✅ 已购买云服务器（阿里云/腾讯云/华为云均可）
- ✅ 服务器操作系统为 **Linux**（CentOS 7+ / Ubuntu 18+）
- ✅ 已获得服务器的 **公网 IP**、**root 密码**（或 SSH 密钥）

---

## 🗺️ 部署流程总览

```
本地电脑                          云服务器
─────────                        ─────────
npm run build  →  dist/   ──→   /var/www/baoming/
                                    │
                               Nginx 监听 80 端口
                                    │
                               http://你的IP  ← 用户访问
```

---

## 第一步：打包项目

在本地项目目录执行：

```bash
cd d:\claudeCode\baoming\baoming-h5
npm run build
```

成功后会在项目根目录生成 `dist/` 文件夹，里面有三个文件：

```
dist/
├── index.html
├── assets/
│   ├── index-XXXXXXXX.css
│   └── index-XXXXXXXX.js
```

> 💡 `dist/` 就是你要上传到服务器的全部内容，不依赖 Node.js，纯静态文件。

---

## 第二步：上传文件到服务器

### 2.1 安装 WinSCP（推荐新手）

[WinSCP 下载地址](https://winscp.net/eng/download.php) — 像"资源管理器"一样拖拽上传文件。

1. 安装后打开 WinSCP
2. 主机名填：你的服务器公网 IP
3. 用户名填：`root`
4. 密码填：服务器密码
5. 点击"登录"

### 2.2 在服务器上创建目录

登录后在 WinSCP 右侧（服务器端）导航到 `/var/www/`，如果不存在就创建：

```
右键 → 新建 → 目录 → 输入 www
```

在 `/var/www/` 下再创建 `baoming` 目录。

### 2.3 上传 dist 文件夹内容

将本地 `dist/` 文件夹内的 **所有文件** 拖拽到服务器的 `/var/www/baoming/` 目录。

最终服务器目录结构应为：

```
/var/www/baoming/
├── index.html
└── assets/
    ├── index-XXXXXXXX.css
    └── index-XXXXXXXX.js
```

---

## 第三步：安装和配置 Nginx

### 3.1 连接服务器终端

在 WinSCP 中按 `Ctrl+T` 打开终端，或者用其他 SSH 工具（如 Xshell、Putty）。

### 3.2 安装 Nginx

**CentOS 系统：**
```bash
yum install -y nginx
```

**Ubuntu 系统：**
```bash
apt update
apt install -y nginx
```

安装完成后启动：
```bash
systemctl start nginx
systemctl enable nginx   # 开机自启
```

### 3.3 配置 Nginx

创建站点配置文件：

```bash
vi /etc/nginx/conf.d/baoming.conf
```

按 `i` 进入编辑模式，粘贴以下内容：

```nginx
server {
    listen       80;
    server_name  _;                      # 替换为你的域名，没有域名就保持 _
    root         /var/www/baoming;
    index        index.html;

    # H5 单页应用必须配置：所有路由都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存（CSS/JS 文件名带 hash，可以长期缓存）
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # gzip 压缩（减少传输体积）
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 256;
}
```

按 `Esc` 退出编辑模式，输入 `:wq` 保存退出。

### 3.4 检查并重载 Nginx

```bash
# 检查配置语法
nginx -t

# 如果显示 "syntax is ok" 和 "test is successful"，执行：
systemctl reload nginx
```

### 3.5 检查防火墙

```bash
# 开放 80 端口（HTTP）
firewall-cmd --add-port=80/tcp --permanent
firewall-cmd --reload

# 如果是阿里云/腾讯云，还需要在"安全组"中放行 80 端口
# 登录云控制台 → 安全组 → 添加规则 → 入方向 80 端口
```

---

## 第四步：验证部署

在浏览器输入 `http://你的服务器公网IP`，应该能看到登录页面。

> 如果显示"无法访问"，在服务器上执行 `curl http://localhost` 先确认 Nginx 是否正常。

---

## 🔒 第五步（可选）：绑定域名

如果你有域名，在 DNS 解析中添加一条 **A 记录**：

| 主机记录 | 记录类型 | 记录值 |
|----------|----------|--------|
| `@` | A | 你的服务器IP |
| `www` | A | 你的服务器IP |

然后修改 Nginx 配置中的 `server_name`：

```nginx
server_name  baoming.yourdomain.com;
```

重载 Nginx：
```bash
systemctl reload nginx
```

---

## 🔐 第六步（可选）：配置 HTTPS

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 certbot
yum install -y certbot python3-certbot-nginx   # CentOS
# 或
apt install -y certbot python3-certbot-nginx   # Ubuntu

# 自动配置 SSL（替换为你的域名）
certbot --nginx -d baoming.yourdomain.com

# 按提示操作，选择自动重定向 HTTP → HTTPS
```

证书 90 天有效，certbot 会自动续期。手动续期命令：
```bash
certbot renew
```

---

## 🔄 更新部署

以后修改了代码需要更新线上时：

```bash
# 1. 本地重新打包
npm run build

# 2. 用 WinSCP 将 dist/ 文件夹内容覆盖到 /var/www/baoming/

# 3. （可选）如果是 Nginx，无需重启
```

---

## 🛠️ 常见问题排查

### 问题：访问 IP 显示 Nginx 默认页面

**原因**：Nginx 默认配置文件覆盖了你的配置。

**解决**：
```bash
# 删除默认配置
rm -f /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx
```

### 问题：刷新页面出现 404

**原因**：`try_files` 没有正确配置。

**解决**：确认配置中有这行：
```nginx
try_files $uri $uri/ /index.html;
```

### 问题：CSS/JS 加载 404

**原因**：文件路径不对，或者文件没上传完整。

**排查**：
```bash
ls -la /var/www/baoming/
ls -la /var/www/baoming/assets/
```

确认 `index.html` 和各资源文件都在。同时检查 `index.html` 中引用的 CSS/JS 路径是否正确。

### 问题：页面空白，控制台报 MIME type 错误

**解决**：确认 Nginx 配置中包含 `gzip_types` 或其他 MIME 相关配置。或者检查 `/etc/nginx/mime.types` 文件是否存在：
```bash
ls -la /etc/nginx/mime.types
```

### 问题：安全组/防火墙未开放端口

阿里云/腾讯云用户最容易遇到：服务器防火墙开了但云安全组没开。

**解决**：登录云控制台 → 找到"安全组" → 入站规则添加 80（HTTP）和 443（HTTPS）。

### 问题：64k 共享内存不足

如果 Nginx 报错 `could not allocate shared memory`：
```bash
# 在 nginx.conf 的 http 块中添加
server_names_hash_bucket_size 64;
```

---

## 📊 部署架构图

```
用户手机/PC
    │
    ▼
http://your-ip:80  (或 https://your-domain:443)
    │
    ▼
┌─────────────┐
│   Nginx     │ ← 静态文件服务 + 反向代理
│  (端口 80)  │
└─────┬───────┘
      │
      ▼
/var/www/baoming/
  ├── index.html        ← SPA 入口
  └── assets/
      ├── index-xxx.css
      └── index-xxx.js
```

纯前端项目部署到 Nginx 就完成了，不需要 Node.js、不需要数据库。所有数据存在用户浏览器的 localStorage 中。
