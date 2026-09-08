# ⚡ BlazeUp HROS — Enterprise Offboarding Platform

> An enterprise-grade HR operations system that automates employee separation through a **generic workflow engine (parallel & sequential clearances)**, **simulated IT access revocation**, **strict 8-role RBAC**, and **standalone PDF letter generation**.

---

## 🚀 Quick Start (3 Steps)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Seed database with multi-role accounts & sample workflow data
npm run seed

# 3. Start both backend (Port 5000) & frontend (Port 5173)
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Login Accounts

All accounts use password: **`Password123!`**

| Role | Name | Email | Key Responsibility |
|---|---|---|---|
| **HR_ADMIN** | Sarah Jenkins | `hradmin@blazeup.com` | Full HR system control, workflow templates & case initiation |
| **HR** | Priya Sharma | `hr@blazeup.com` | Operations, exit interview & final clearance sign-off |
| **MANAGER** | Marcus Vance | `manager@blazeup.com` | Project handover & knowledge transfer clearance |
| **ADMIN_SYSTEMS** | David Chen | `itadmin@blazeup.com` | Hardware return & 1-click cloud/SSO access revocation |
| **ACCOUNTS** | Elena Rostova | `accounts@blazeup.com` | Financial dues, advance recovery & finance NOC |
| **PERSONNEL** | Vikram Mehta | `personnel@blazeup.com` | Physical ID badge & facilities return |
| **EMPLOYEE** | Rahul Kumar | `rahul.kumar@blazeup.com` | Self-service: track clearance & download release letters |
| **SUPER_ADMIN** | Alexander Pierce | `superadmin@blazeup.com` | Governance, user administration & security audit logs |

---

## 🔄 Clearance Workflow Pipeline

```
[HR Initiates Offboarding]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│              PARALLEL CLEARANCE STAGES                 │
│  ├─ Stage 1: Reporting Manager (KT & Code Handover)    │
│  ├─ Stage 2: IT Systems (Hardware & Access Revocation) │
│  └─ Stage 3: Finance & Accounts (Settlement & Advances)│
└─────────────────────────┬──────────────────────────────┘
                          │ (All 3 Parallel Stages Approved)
                          ▼
┌────────────────────────────────────────────────────────┐
│             SEQUENTIAL CLEARANCE STAGES                │
│  └─ Stage 4: Personnel & Facilities (Physical ID/RFID) │
└─────────────────────────┬──────────────────────────────┘
                          │ (Personnel Approved)
                          ▼
┌────────────────────────────────────────────────────────┐
│  └─ Stage 5: HR Final Clearance & Exit Interview       │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│     AUTOMATED COMPLETION & STATUTORY PDF GENERATION    │
│  ├─ Resignation Acceptance Letter                      │
│  ├─ Clearance Certificate (NOC)                        │
│  ├─ Relieving Letter (with Non-Compete Clauses)        │
│  └─ Experience Certificate                             │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Key Enterprise Features

- **Generic DAG Workflow Engine**: Supports concurrent (`PARALLEL`) and dependency-gated (`SEQUENTIAL`) stage executions.
- **Automated IT Deprovisioning**: 1-Click single/bulk access revocation for Google Workspace, Active Directory, AWS, VPN, and Slack.
- **Standalone Server-Side PDFs (PDFKit)**: Generates official company letterhead documents directly on the backend with zero browser DOM/UI capture.
- **Strict Role-Based Access Control (RBAC)**: Backend validates JWT signature (`req.user.role`). Stage approvals strictly verify that `stage.role === req.user.role`, returning **HTTP 403 Forbidden** for unauthorized attempts.
- **Immutable Audit Trail**: Logs every action, stage transition, and credential revocation with timestamps and user metadata.

---

## 🧪 Run Automated Verification Tests

```bash
cd backend
node test_verification.js
```
*Validates JWT authentication for all 8 roles, cross-role 403 Forbidden enforcement, stage approval security, and standalone PDFKit binary generation.*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, Vanilla CSS (Glassmorphic SaaS UI).
- **Backend**: Node.js, Express.js (REST APIs, JWT, Error Middlewares).
- **Database**: MongoDB with Mongoose (with automated in-memory fallback).
- **Document Engine**: Server-side PDFKit binary streaming.
