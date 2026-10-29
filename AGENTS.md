# NASH CMMS — Enterprise Engineering & Commercial Standards
> **Target Valuation**: $7,000 Commercial Grade  
> **Reliability Requirement**: 100% Zero-Bug & Enterprise Production Ready

---

## 1. Project Overview & Architecture
NASH CMMS is an industrial-grade Computerized Maintenance Management System.

- **Frontend**: React 19, TypeScript, Vite 8, TailwindCSS v4, Lucide Icons.
- **Backend API**: Node.js, Express, TypeScript (`tsx` / `tsc`), Prisma ORM.
- **Database**: PostgreSQL 16+ (AWS RDS / Local) managed via Prisma Schema.
- **Production Server**: AWS EC2 (Ubuntu 24.04 LTS), Nginx Reverse Proxy, PM2 Cluster Mode, SSL/Certbot, SSH via `QQQPS.pem`.

---

## 2. Mandatory Coding & Quality Rules

### A. Strict TypeScript & Zero-Any Policy
- Never use `any` when defining core domain entities (Work Orders, Assets, PMs, Parts, Users).
- All entity types must align with `@prisma/client` generated types or `src/types/`.
- Ensure strict null-checks and runtime defensive validation for incoming requests.

### B. Database Integrity & Transaction Safety
- All multi-table business mutations **MUST** use `prisma.$transaction`:
  1. Work Order completion + Parts stock deduction.
  2. PM trigger execution + Next due date calculation.
  3. Work Order creation + Automated task checklist assignment.
- Never run destructive migrations (`prisma migrate reset` or `db push --force-reset`) on production or populated databases without taking a verified JSON or SQL backup first.

### C. Standardized API Response Contract
All REST endpoints in `server/index.ts` must follow a predictable JSON format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional user-friendly status message"
}
```
In case of error:
```json
{
  "success": false,
  "error": "Short error code or description",
  "details": "Technical detail for debugging"
}
```

### D. Bilingual (Arabic & English) Support
- Support full Arabic localization (RTL) alongside English (LTR).
- Ensure currency formatting supports SAR (Saudi Riyal) and USD.
- Date representations should support standard ISO strings and formatted local dates.

### E. Industrial UI/UX Standards
- High-contrast, clean industrial theme (Sleek dark mode + high-visibility light mode).
- Status badges must use standardized color tokens:
  - Open / Low: Emerald / Blue
  - In Progress / Medium: Amber
  - High / Critical / Overdue: Rose / Red
  - Completed: Slate / Emerald
- Mobile responsive layout for on-field maintenance technicians using smartphones and tablets.

---

## 3. Pre-Delivery & Verification Checklist (100% Gate)
Before marking any task, update, or client delivery as complete, verify:
1. **TypeScript Check**: `npx tsc --noEmit` passes with 0 errors.
2. **Server Health**: `GET /api/health` returns status `healthy` with active DB ping.
3. **Database Seed Integrity**: `npx prisma db seed` runs cleanly without foreign-key violations.
4. **Data Isolation**: Verify client branding, company name, and demo data can be cleanly initialized.
