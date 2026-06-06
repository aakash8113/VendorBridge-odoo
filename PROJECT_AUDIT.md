# VendorBridge - Project Audit & Implementation Plan

## Architecture
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + Recharts
- **Backend**: Express.js + Prisma ORM + PostgreSQL
- **Auth**: JWT-based (bcryptjs + jsonwebtoken)

## Frontend Pages & API Connectivity Status

| Page | API Connected | Mock Data | Issues |
|------|:---:|:---:|-------|
| LoginPage | ✅ | ❌ | None |
| SignupPage | ✅ | ❌ | None |
| Dashboard | ✅ | ❌ | None |
| Vendors | ✅ | ❌ | None |
| CreateRFQ | ✅ | ❌ | File upload not used |
| SubmitQuotation | ✅ | ❌ | None |
| QuotationComparison | ✅ | ❌ | None |
| ApprovalWorkflow | ✅ | ❌ | None |
| PurchaseOrder | ✅ | ❌ | PDF/Email buttons not wired |
| ActivityLogs | ✅ | ❌ | None |
| Reports | ❌ | ✅ (100%) | Fully mock data |

## Backend Endpoints Status

| Endpoint | Method | Status | Used By |
|----------|--------|:------:|---------|
| /api/auth/register | POST | ✅ | SignupPage |
| /api/auth/login | POST | ✅ | LoginPage |
| /api/vendors | GET | ✅ | Vendors |
| /api/vendors | POST | ✅ | Vendors |
| /api/vendors/:id | PUT | ✅ | Vendors (status only) |
| /api/rfqs | POST | ✅ | CreateRFQ |
| /api/rfqs | GET | ✅ | SubmitQuotation, QuotationComparison |
| /api/rfqs/:id | GET | ✅ | (not used by FE yet) |
| /api/quotations | POST | ✅ | SubmitQuotation |
| /api/quotations/vendor | GET | ✅ | (not used by FE yet) |
| /api/quotations/compare/:rfqId | GET | ✅ | QuotationComparison |
| /api/quotations/pending | GET | ✅ | ApprovalWorkflow |
| /api/quotations/:id/approve | PUT | ✅ | ApprovalWorkflow, QuotationComparison |
| /api/quotations/:id/reject | PUT | ✅ | ApprovalWorkflow |
| /api/pos | GET | ✅ | PurchaseOrder |
| /api/invoices/generate/:poId | POST | ✅ | (not used by FE yet) |
| /api/documents/pdf/:invoiceId | GET | ✅ | (not used by FE yet) |
| /api/invoices/:invoiceId/send | POST | ✅ | (not used by FE yet) |
| /api/analytics/kpis | GET | ✅ | Dashboard |
| /api/analytics/spend-by-category | GET | ✅ | Dashboard |
| /api/logs | GET | ✅ | ActivityLogs |

## Missing Endpoints To Implement
1. GET /api/quotations - Admin view all quotations
2. GET /api/invoices - List all invoices
3. PUT /api/pos/:id - Update PO status
4. PUT /api/invoices/:id - Update invoice status
5. GET /api/analytics/monthly-trend - Monthly spend
6. GET /api/analytics/top-vendors - Top vendors
7. PUT /api/vendors/:id/update - Full vendor update

## Implementation Plan
1. Fix emailService.js duplicate function bug
2. Add missing backend controllers & routes
3. Connect Reports page to real APIs
4. Wire PDF download + Email buttons on PurchaseOrder
5. Add all missing API client functions
6. End-to-end verification