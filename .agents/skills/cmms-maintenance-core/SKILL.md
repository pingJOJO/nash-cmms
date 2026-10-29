---
name: cmms-maintenance-core
description: >-
  Provides domain expertise for industrial maintenance management (CMMS) in NASH CMMS, including MTTR/MTBF/OEE KPI formulas, PM recurrence schedules, meter-triggered work orders, inventory reorder thresholds, and total cost rollups. Use when implementing or troubleshooting maintenance business logic.
---

# CMMS Maintenance Core Domain & Engine Rules

This skill provides exact industrial maintenance algorithms, data relationships, and business calculation logic for NASH CMMS.

---

## 1. Key Performance Indicator (KPI) Formulas

### A. Mean Time To Repair (MTTR)
Measures the average time required to troubleshoot and repair failed equipment:
$$\text{MTTR} = \frac{\sum (\text{Total Corrective Downtime Hours})}{\text{Number of Corrective Repairs}}$$
- **Scope**: Applied to Work Orders where `type = 'CORRECTIVE'` and `status = 'COMPLETED'`.
- **Target**: Lower is better (Industry benchmark < 4 hours for standard line machinery).

### B. Mean Time Between Failures (MTBF)
Measures equipment reliability during scheduled operational time:
$$\text{MTBF} = \frac{\text{Total Operating Hours} - \text{Total Unplanned Downtime Hours}}{\text{Number of Failures}}$$
- **Scope**: Critical assets with recorded runtime meters and breakdown logs.
- **Target**: Higher is better.

### C. Preventive Maintenance (PM) Compliance
Percentage of scheduled maintenance tasks completed within SLA:
$$\text{PM Compliance \%} = \left(\frac{\text{PMs Completed on Time}}{\text{Total Scheduled PMs}}\right) \times 100$$
- Standard 10% Rule: A task due on Day 30 is compliant if executed between Day 27 and Day 33.

---

## 2. Work Order Total Cost Rollup Logic

The total cost of a Work Order is calculated dynamically across three dimensions:

$$\text{Total Cost} = \text{Labor Cost} + \text{Parts Cost} + \text{Additional / Contractor Costs}$$

1. **Labor Cost**:
   $$\sum (\text{Hours Spent} \times \text{User Hourly Rate})$$
2. **Parts Cost**:
   $$\sum (\text{Quantity Used} \times \text{Unit Cost of Part})$$
3. **Additional Costs**:
   $$\sum (\text{Permits, Rental Tools, Third-Party Contractor Invoices})$$

**Integrity Rule**: When a Work Order is marked `COMPLETED`:
- Stock quantity in `Part` must decrease by `Quantity Used`.
- If `currentStock <= minStock`, flag part status as `LOW_STOCK`.

---

## 3. Preventive Maintenance (PM) Trigger Engine

PMs trigger automated Work Order creation through two mechanisms:

### A. Time-Based Recurrence
- **Frequencies**: `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL`.
- **Calculation**:
  $$\text{Next Due Date} = \text{Last Completed Date} + \text{Interval Days}$$

### B. Meter-Based Recurrence (Run Hours / Mileage / Cycles)
- When a technician logs a new `MeterReading`:
  $$\Delta = \text{Current Reading} - \text{Last PM Meter Reading}$$
- If $\Delta \ge \text{Meter Interval}$, automatically trigger a PM Work Order.

---

## 4. Asset Hierarchy & QR Tagging

- **Structure**: Location / Facility $\rightarrow$ Category $\rightarrow$ Asset $\rightarrow$ Sub-Component.
- **QR Code Payload**: URL linking directly to asset details:
  `https://yourdomain.com/assets/<ASSET_ID>`
- Scanning the QR code allows a field technician to instantly view maintenance history, active work orders, and open a new request.
