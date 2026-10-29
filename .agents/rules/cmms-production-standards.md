# NASH CMMS — Operational & Coding Rules

## Rule 1: Type Strictness & Defensive Programming
- Ensure all API endpoints in `server/index.ts` have try-catch blocks and explicit status codes.
- Do not bypass TypeScript errors using `@ts-ignore` or `any`.

## Rule 2: Database Safety
- In production, never execute destructive schema resets (`prisma migrate reset` or `db push --force-reset`).
- Multi-step modifications (e.g. closing work order and updating inventory stock) must always use `prisma.$transaction`.

## Rule 3: Commercial Quality Gate
- Before deploying or declaring a task complete, verify that the system builds cleanly:
  - Frontend: `npm run build`
  - Backend: `npm run server:build`
  - Health check: `GET /api/health`
