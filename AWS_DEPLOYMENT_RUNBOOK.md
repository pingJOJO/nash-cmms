# 🚀 NASH CMMS - AWS EC2 & RDS Production Deployment Runbook
### دليل النشر الشامل والإنتاج لسيرفر AWS EC2 و RDS PostgreSQL باستخدام مفتاح `QQQPS.pem`

---

## 🏗️ Architecture Overview

```
                          [ Internet Users ]
                                  │
                                  ▼ (Port 80 / 443)
              ┌───────────────────────────────────────┐
              │      AWS EC2 (Ubuntu 24.04 LTS)       │
              │  Security Group: sg-ec2-nash          │
              │                                       │
              │  ┌─────────────────────────────────┐  │
              │  │       Nginx Reverse Proxy       │  │
              │  └────────────────┬────────────────┘  │
              │                   │                   │
              │       ┌───────────┴───────────┐       │
              │       ▼                       ▼       │
              │  Static Bundle           REST API     │
              │  (/dist: React+Vite)     (:3000 Node) │
              │                               │       │
              │                         PM2 Cluster   │
              │                        (Express API)  │
              └───────────────────────────────┼───────┘
                                              │
                                              ▼ (Port 5432 with SSL)
              ┌───────────────────────────────────────┐
              │      AWS RDS PostgreSQL 16+           │
              │  Security Group: sg-rds-nash          │
              │  Allowed Inbound: sg-ec2-nash ONLY    │
              └───────────────────────────────────────┘
```

---

## 1. إعداد مجموعات الأمان (AWS Security Groups Configuration)

قبل الاتصال بالسيرفر، تأكد من إعداد مجموعات الأمان في لوحة تحكم AWS:

### أ. مجموعة أمان EC2 (`sg-ec2-nash`):
| Type | Protocol | Port Range | Source | الغرض |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | `My IP` (أو `0.0.0.0/0`) | الاتصال بالسيرفر عبر Terminal |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | تصفح التطبيق وشهادة SSL |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | التصفح الآمن المشفر |

### ب. مجموعة أمان RDS PostgreSQL (`sg-rds-nash`):
| Type | Protocol | Port Range | Source | الغرض |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | TCP | `5432` | **`sg-ec2-nash`** (معرف مجموعة EC2) | حماية قاعدة البيانات وقصر الوصول على EC2 فقط |

> [!CAUTION]
> **تحذير أمني**: لا تفتح المنفذ `5432` على `0.0.0.0/0` أبداً. اجعل المصدر (Source) هو معرف Security Group الخاص بـ EC2 (مثال: `sg-0a1b2c3d4e5f6g7h8`).

---

## 2. الاتصال بالسيرفر باستخدام المفتاح `QQQPS.pem`

المفتاح موجود في المجلد الحالي للمشروع باسم `QQQPS.pem`.

### إذا كنت تستخدم Windows PowerShell:
يقوم ويندوز أحياناً بحظر المفتاح بسبب الأذونات الواسعة (Permissions too open). أصلح الأذونات بالأمر التالي ثم اتصل:

```powershell
# 1. إصلاح أذونات المفتاح في ويندوز
icacls.exe QQQPS.pem /reset
icacls.exe QQQPS.pem /grant:r "$($env:USERNAME):(R)"
icacls.exe QQQPS.pem /inheritance:r

# 2. الاتصال بسيرفر Ubuntu
# استبدل <EC2_PUBLIC_IP> بعنوان IP العام لسيرفرك
ssh -i QQQPS.pem ubuntu@<EC2_PUBLIC_IP>
```

### إذا كنت تستخدم Linux / macOS / WSL / Git Bash:
```bash
chmod 400 QQQPS.pem
ssh -i QQQPS.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## 3. تهيئة السيرفر النظيف (Clean Ubuntu 24.04 LTS Setup)

نفّذ الأوامر التالية داخل سيرفر EC2 لتثبيت كل البرمجيات اللازمة:

```bash
# 1. تحديث حزم النظام
sudo apt update && sudo apt upgrade -y

# 2. تثبيت الأدوات الأساسية ومكتبات البناء
sudo apt install -y curl wget git unzip htop build-essential postgresql-client nginx

# 3. تثبيت Node.js v20 LTS عبر NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. التحقق من إصدارات Node و NPM
node -v   # يجب أن يظهر v20.x.x
npm -v    # يجب أن يظهر v10.x.x

# 5. تثبيت مدير العمليات PM2 عالمياً
sudo npm install -g pm2
```

---

## 4. نقل أو استنساخ المشروع إلى السيرفر

سنقوم بوضع المشروع في المسار الموحد `/var/www/nash-cmms`:

```bash
# إنشاء مجلد المشروع وضبط ملكيته للمستخدم ubuntu
sudo mkdir -p /var/www/nash-cmms
sudo chown -R ubuntu:ubuntu /var/www/nash-cmms
```

### الخيار (أ): الرفع المباشر من جهازك المحلي عبر SCP (الأسرع بدون جيت):
من موجه أوامر جهازك المحلي (في نفس مجلد `g:/oooo سيرفر`):

```powershell
# استبدل <EC2_PUBLIC_IP> بعنوان السيرفر
scp -i QQQPS.pem -r ./* ubuntu@<EC2_PUBLIC_IP>:/var/www/nash-cmms/
```

### الخيار (ب): عبر مستودع Git:
داخل سيرفر EC2:
```bash
cd /var/www/nash-cmms
git clone <YOUR_GIT_REPO_URL> .
```

---

## 5. إعداد ملف البيئة `.env` المتصل بـ AWS RDS

داخل سيرفر EC2:
```bash
cd /var/www/nash-cmms
nano .env
```

ضع الإعدادات التالية (استبدل القيم ببيانات RDS الفعلية الخاصة بك):

```env
PORT=3000
NODE_ENV=production

# صيغة رابط الاتصال بقاعدة بيانات RDS PostgreSQL:
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<RDS_ENDPOINT>:5432/<DB_NAME>?schema=public&sslmode=require"

# مثال توضيحي:
# DATABASE_URL="postgresql://postgres:MySecurePass2026@nash-db.c5abcdefg.us-east-1.rds.amazonaws.com:5432/nash_cmms?schema=public&sslmode=require"
```

احفظ الملف بالضغط على `Ctrl + O` ثم `Enter`، واخرج بـ `Ctrl + X`.

---

## 6. تثبيت الحزم، ترحيل قاعدة البيانات، وتغذية البيانات (Database Seeding)

```bash
cd /var/www/nash-cmms

# 1. تثبيت الاعتمادات
npm install

# 2. توليد عميل Prisma Client
npx prisma generate

# 3. مزامنة الجداول مع AWS RDS PostgreSQL
npx prisma db push

# 4. تغذية قاعدة البيانات بكل البيانات التجريبية الصناعية (10 Work Orders, Assets, PMs, Parts, etc.)
npx prisma db seed
```

> [!TIP]
> عند نجاح أمر `npx prisma db seed`، ستشاهد رسالة تأكيد بطباعة كل الكيانات التي تمت جدولتها بنجاح.

---

## 7. بناء المشروع للإنتاج (Build Frontend & Server)

```bash
cd /var/www/nash-cmms

# إنشاء حزمة الواجهة الأمامية React + Vite ومترجم السيرفر
npm run build:all
```

سيتولد المجلد `dist/` الخاص بالواجهة الأمامية والمجلد `server/dist/` الخاص بسيرفر Express.

---

## 8. تشغيل التطبيق عبر PM2 في وضع Cluster

```bash
cd /var/www/nash-cmms

# إنشاء مجلد السجلات
mkdir -p logs

# تشغيل السيرفر بملف ecosystem
pm2 start ecosystem.config.cjs --env production

# حفظ قائمة العمليات لتعمل تلقائياً بعد إعادة تشغيل السيرفر
pm2 save

# توليد وتفعيل أمر الإقلاع التلقائي لنظام systemd
pm2 startup
# (انسخ الأمر الذي سيظهره PM2 ونفذه بصلاحية sudo إن طلب ذلك)
```

فحص صحة السيرفر محلياً:
```bash
# فحص الحالة
pm2 status

# فحص endpoint الصحة مع قاعدة البيانات
curl http://localhost:3000/api/health
```

---

## 9. إعداد Nginx Reverse Proxy و SPA Routing

انسخ ملف تكوين Nginx المرفق وفعّله:

```bash
# 1. نسخ الإعدادات
sudo cp /var/www/nash-cmms/deploy/nginx/nash-cmms.conf /etc/nginx/sites-available/nash-cmms

# 2. تفعيل الموقع عبر إنشاء Symlink
sudo ln -s /etc/nginx/sites-available/nash-cmms /etc/nginx/sites-enabled/

# 3. حذف الموقع الافتراضي لـ Nginx منعاً للتعارض
sudo rm -f /etc/nginx/sites-enabled/default

# 4. اختبار صحة ملف التكوين
sudo nginx -t

# 5. إعادة تشغيل Nginx
sudo systemctl restart nginx
```

الآن يمكنك فتح متصفحك وكتابة عنوان `http://<EC2_PUBLIC_IP>` وسيعمل الموقع بالكامل!

---

## 10. إعداد شهادة الأمان المجانية HTTPS (Certbot / Let's Encrypt)

بمجرد ربط دومين بسيرفرك (Domain Name -> EC2 Public IP):

```bash
# 1. تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. استخراج الشهادة وتطبيقها تلقائياً على Nginx
# استبدل yourdomain.com بالدومين الخاص بك
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. اختبار التجديد التلقائي للشهادة
sudo certbot renew --dry-run
```

---

## 11. أوامر الصيانة والمراقبة اليومية (Operations & Troubleshooting)

### مراقبة السجلات:
```bash
# سجلات التطبيق عبر PM2 في الوقت الفعلي
pm2 logs nash-cmms

# سجلات وصول وأخطاء Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### تحديث التطبيق مستقبلاً (Zero-Downtime Deployment):
أنشئ ملف سكريبت تحديث سريع `deploy.sh`:

```bash
cat << 'EOF' > /var/www/nash-cmms/update.sh
#!/bin/bash
set -e
echo "🔄 Updating NASH CMMS..."
cd /var/www/nash-cmms
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build:all
pm2 reload ecosystem.config.cjs --env production
echo "✅ Update deployed successfully!"
EOF

chmod +x /var/www/nash-cmms/update.sh
```
للتحديث لاحقاً يكفي تشغيل: `./update.sh`.
