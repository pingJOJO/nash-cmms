---
name: cmms-qa-and-audit
description: >-
  Runs comprehensive quality assurance, healthchecks, zero-bug audits, and end-to-end API and UI verifications for NASH CMMS. Use when verifying system readiness, testing database seed/schema integrity, checking API responses, or auditing code before client delivery.
---

# CMMS QA & Zero-Bug Audit Protocol

This skill enforces commercial-grade (100% reliability) verification for NASH CMMS before delivery, client demonstration, or production deployment.

---

## 1. Fast Diagnostics & Health Verification

Run these verification steps in sequence to confirm 100% system readiness:

### A. TypeScript Type Check
```bash
npx tsc --noEmit
npx tsc -p tsconfig.server.json --noEmit
```
**Pass Criteria**: Zero errors. Any type error must be resolved before proceeding.

### B. Database Connection & Schema Health
```bash
npx prisma generate
npx prisma db push --preview-feature
```
**Pass Criteria**: Schema in sync with database; Prisma Client freshly generated.

### C. Live Server Health Endpoint Test
Check the server's telemetry endpoint:
```bash
curl -s http://localhost:3000/api/health
```
**Expected Response**:
```json
{
  "status": "healthy",
  "app": "NEX CMMS",
  "version": "1.0.0",
  "database": {
    "status": "connected"
  }
}
```

---

## 2. Comprehensive 15-Module API Audit

Verify that all essential REST endpoints respond with correct status codes and data:

| # | Endpoint | Method | Expected Code | Purpose |
|---|---|---|---|---|
| 1 | `/api/health` | GET | `200` | DB connectivity and server telemetry |
| 2 | `/api/work-orders` | GET | `200` | List of work orders with related assets & tasks |
| 3 | `/api/work-orders` | POST | `201` | Create new work order |
| 4 | `/api/pms` | GET | `200` | Preventive maintenance schedules |
| 5 | `/api/assets` | GET | `200` | Asset hierarchy & status |
| 6 | `/api/parts` | GET | `200` | Spare parts & inventory stock levels |
| 7 | `/api/meters` | GET | `200` | Equipment meters & run hours |
| 8 | `/api/requests` | GET | `200` | Maintenance requests portal |
| 9 | `/api/locations` | GET | `200` | Plant/facility physical locations |
| 10 | `/api/categories` | GET | `200` | Work order & asset classification |
| 11 | `/api/vendors` | GET | `200` | Suppliers & contractors directory |
| 12 | `/api/users` | GET | `200` | Technicians, supervisors, & managers |
| 13 | `/api/reports/kpi` | GET | `200` | MTTR, MTBF, PM compliance, downtime |
| 14 | `/api/admin/backup` | GET | `200` | Full JSON database snapshot download |
| 15 | `/api/upload` | POST | `201` | Image / file attachment storage |

---

## 3. Database Seeding & Data Sanity Audit

Verify demo data population:
```bash
npx prisma db seed
```
**Verify Records**:
1. At least 10 Work Orders in various states (`OPEN`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`).
2. Assets with assigned Locations, Categories, and QR codes.
3. Preventive Maintenance rules with valid next due dates.
4. Spare parts with minimum stock alerts and cost fields.
5. Users across all roles: `ADMIN`, `MANAGER`, `TECHNICIAN`, `REQUESTER`.

---

## 4. UI & Frontend Build Verification

```bash
npm run build
```
Verify the generated `dist/` directory:
- `dist/index.html` is generated.
- Assets bundle size is optimal.
- No broken imports or missing Lucide icon references.
- Test responsive layout on mobile breakpoint (375px) and desktop (1440px).

---

## 5. Security & Safety Checklist

- [ ] `.env` does not contain hardcoded production secrets in Git.
- [ ] File uploads reject unauthorized extensions (only `.jpg`, `.png`, `.pdf`, `.webp`).
- [ ] Prisma queries use parameterized statements (never string concatenation in `$queryRawUnsafe`).
- [ ] Database backups can be restored without foreign-key deadlocks.
