---
name: cmms-aws-production-ops
description: >-
  Guides AWS production deployment, server administration, Nginx reverse proxy, PM2 cluster management, SSL certificates, RDS PostgreSQL connectivity, and backup/restore workflows using QQQPS.pem for NASH CMMS. Use when deploying, upgrading, or maintaining the production server.
---

# AWS Production Deployment & Server Operations

This skill covers complete server lifecycle management for NASH CMMS running on AWS EC2 (Ubuntu 24.04 LTS) with AWS RDS PostgreSQL.

---

## 1. Key Credentials & Access Architecture

- **Private Key File**: `QQQPS.pem` (located in workspace root).
- **Target OS**: Ubuntu 24.04 LTS on AWS EC2.
- **App Location on EC2**: `/var/www/nash-cmms`
- **Database Engine**: AWS RDS PostgreSQL 16+ with SSL (`sslmode=require`).
- **Process Manager**: PM2 in cluster mode (`ecosystem.config.cjs`).
- **Web Server**: Nginx Reverse Proxy with SPA routing.

---

## 2. Connecting to EC2 via SSH

### Windows PowerShell:
```powershell
# 1. Reset permissions if Windows blocks the PEM key
icacls.exe QQQPS.pem /reset
icacls.exe QQQPS.pem /grant:r "$($env:USERNAME):(R)"
icacls.exe QQQPS.pem /inheritance:r

# 2. Connect
ssh -i QQQPS.pem ubuntu@<EC2_PUBLIC_IP>
```

### Linux / Mac / WSL:
```bash
chmod 400 QQQPS.pem
ssh -i QQQPS.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## 3. Server Deployment Workflow

### Step 1: Uploading Files to EC2
From local machine:
```powershell
# Exclude node_modules, .git, and dist
tar --exclude='node_modules' --exclude='.git' --exclude='dist' -czvf deploy_update.tar.gz .
scp -i QQQPS.pem deploy_update.tar.gz ubuntu@<EC2_PUBLIC_IP>:/var/www/nash-cmms/
```

### Step 2: Unpacking & Rebuilding on Server
Inside EC2:
```bash
cd /var/www/nash-cmms
tar -xzvf deploy_update.tar.gz
npm install --production=false
npx prisma generate
npx prisma db push
npm run build:all
```

### Step 3: PM2 Process Reloading (Zero Downtime)
```bash
pm2 reload ecosystem.config.cjs --env production
pm2 save
```

---

## 4. Nginx Reverse Proxy Configuration

Nginx must route `/api` to Express (`:3000`) and all other requests to React SPA (`/var/www/nash-cmms/dist`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/nash-cmms/dist;
    index index.html;

    # Static uploads
    location /uploads/ {
        alias /var/www/nash-cmms/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 5. SSL & HTTPS Setup (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

---

## 6. Automated Database Backup & Disaster Recovery

### Manual Snapshot via API:
```bash
curl -o backup_snapshot.json http://localhost:3000/api/admin/backup
```

### Direct PostgreSQL Dump:
```bash
pg_dump "$DATABASE_URL" -F c -b -v -f "/var/backups/nash_cmms_$(date +%Y%m%d_%H%M%S).dump"
```

### Fast Health Audit on Server:
```bash
pm2 status
curl -I http://localhost:3000/api/health
sudo nginx -t
```
