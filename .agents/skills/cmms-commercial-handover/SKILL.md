---
name: cmms-commercial-handover
description: >-
  Assists in white-labeling, commercial client onboarding, demo data seeding, license setup, admin credentials configuration, and delivery packaging for NASH CMMS to ensure a 100% commercial-grade client handover. Use when preparing to sell, demo, or transfer the project to a client.
---

# Commercial Handover & Client Delivery Protocol ($7,000 Grade)

This skill provides the complete handover and commercial packaging workflow for selling and delivering NASH CMMS to enterprise clients.

---

## 1. Commercial Value Pillars (Justifying the $7,000 Valuation)

Ensure the following enterprise features are active and demonstrable before client presentation:

1. **End-to-End Asset Lifecycle Tracking**:
   - Complete asset hierarchy, serial numbers, warranty dates, purchase costs, and live health status.
2. **Preventive Maintenance Automation**:
   - Recurring calendar schedules + meter-based maintenance with automated work order generation.
3. **Spare Parts & Inventory Management**:
   - Minimum stock alerts, stock deductions upon repair completion, vendor part catalogs, unit costing.
4. **Actionable Executive KPIs & Telemetry**:
   - Real-time MTTR, MTBF, PM compliance percentage, downtime costs, and live server health metrics.
5. **Mobile-Ready QR Code System**:
   - Generate and print QR code stickers for physical plant assets. Scan-to-report on mobile.
6. **Zero-Lock-in Data Export**:
   - One-click full database snapshot export in JSON / SQL format.

---

## 2. White-Labeling & Client Customization

Customize the deployment for the buyer's organization:

### A. Branding Configuration
Update `SystemSetting` table or `/api/settings` endpoint:
- **Company Name**: e.g., "Advanced Industrial Technologies Co."
- **System Title**: Custom header title.
- **Logo URL**: High-resolution SVG/PNG in `/uploads/logo.png`.
- **Primary Currency**: `SAR` (Saudi Riyal) or `USD` ($).
- **Default Locale**: `ar-SA` (Arabic RTL) or `en-US` (English LTR).

### B. Environment Isolation
Prepare a clean `.env` file for the client:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://<CLIENT_USER>:<CLIENT_PASS>@<HOST>:5432/<CLIENT_DB>?schema=public&sslmode=require"
```

---

## 3. Database State Options for Handover

Choose one of two delivery modes based on client preference:

### Option A: Fully Populated Demo / Showcase Mode
Ideal for client walk-throughs and demonstrations:
```bash
npx prisma db push
npx prisma db seed
```
- Populates 10 industrial assets (CNC machines, Chillers, Conveyors).
- Populates 10 Work Orders showing complete lifecycle (`OPEN`, `IN_PROGRESS`, `COMPLETED`).
- Populates spare parts, vendors, and technicians.

### Option B: Clean Production Handover (Zero Legacy Data)
For live plant go-live:
1. Preserve categories, standard PM templates, and role permissions.
2. Truncate demo work orders, meter readings, and audit logs.
3. Create a single super-administrator account:
   - **Role**: `ADMIN`
   - **Email**: `admin@clientdomain.com`
   - Enforce immediate password change on first login.

---

## 4. Final Delivery Checklist (100% Quality Gate)

Run through this checklist before handing over the repository, server, or keys:

- [ ] **Code Verification**: `npm run build:all` completes with 0 errors.
- [ ] **Health Endpoint**: `curl http://<IP>:3000/api/health` returns `healthy`.
- [ ] **Process Resilience**: PM2 cluster mode running with `pm2 save` and systemd startup enabled.
- [ ] **Reverse Proxy**: Nginx configured with SSL certificate via Certbot (Grade A SSL).
- [ ] **Backup Verified**: Fresh database snapshot exported and saved offsite.
- [ ] **Documentation Handed Over**:
  - `AWS_DEPLOYMENT_RUNBOOK.md`
  - System architecture diagram
  - Administrator credential sheet
  - Private key `QQQPS.pem` transferred securely
