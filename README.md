# BlazeUp HROS - Employee Offboarding Automation System

A production-ready, full-stack HR Operations platform featuring a **generic reusable workflow engine**, dynamic multi-stage clearances (**parallel + sequential executions with dependencies**), department-specific clearance checklists, access revocation simulator, immutable audit logs, and automated statutory PDF document generation (Resignation Acceptance, Clearance NOC, Relieving Letter, and Experience Certificate).

---

## 🌟 Key Features

### 1. Generic Reusable Workflow Engine
- **Configurable Stage Execution**: Supports concurrent execution (`PARALLEL`) and gated execution (`SEQUENTIAL`).
- **Dependency Mapping (`dependsOn`)**: Stages automatically activate only when all prerequisite stages are completed.
- **Dynamic Role Assignment**: Stages route tasks to specific roles (`MANAGER`, `ADMIN_SYSTEMS`, `ACCOUNTS`, `PERSONNEL`, `HR`).
- **Checklist Enforcement**: Mandatory clearance verification before stage sign-off is permitted.
- **Auto-Completion & Auto-Cascading**: When all required stages are approved, the workflow instance and parent offboarding case automatically transition to `COMPLETED`, updating employee status to `RELIEVED` and unlocking document generation.

### 2. Department-Specific Clearance Workflows
- **Stage 1 (Parallel)**: *Project / Reporting Manager* — Project completion, knowledge transfer, client handover sign-off.
- **Stage 2 (Parallel)**: *Admin & Systems (IT)* — Hardware returns (laptop, charger, phone, keys) and credential revocations.
- **Stage 3 (Parallel)**: *Finance & Accounts* — Travel advance, staff loans, salary advances, petty cash imprest clearance.
- **Stage 4 (Sequential)**: *Personnel & Facilities* — ID card, RFID access badges, business cards recovery.
- **Stage 5 (Sequential)**: *HR Final Clearance* — Exit interview completion, statutory release sign-off, F&F approval.

### 3. IT Access Revocation Subsystem
- Simulates credential and account de-provisioning for:
  - Google Workspace / M365 Corporate Email
  - Active Directory SSO / Okta
  - WireGuard & OpenVPN Gateways
  - Cloud Infrastructure (AWS / GitHub)
  - Slack Enterprise Grid
- Individual system revocation and 1-click **Bulk Revoke All Accesses**.
- Built with a clean service abstraction ready for enterprise LDAP/AzureAD/Okta API integration.

### 4. Automated PDF Document Generation
- Generated on-demand using `PDFKit` with official letterhead formatting, reference numbers, and digital verification seal:
  - **Resignation Acceptance Letter**
  - **Clearance Certificate / NOC**
  - **Official Relieving Letter** (Configurable Non-Compete and Non-Solicitation clauses)
  - **Work Experience & Service Certificate**
- Inline browser PDF preview and instant direct downloads.

### 5. Role-Based Access Control (RBAC) & Compliance
- Roles: `SUPER_ADMIN`, `HR_ADMIN`, `HR`, `MANAGER`, `ADMIN_SYSTEMS`, `ACCOUNTS`, `PERSONNEL`, `EMPLOYEE`.
- Strict route & API guards: Approvers cannot approve stages outside their role or inactive stages.
- Immutable Audit Trail recording actor, action, timestamp, stage, and metadata for every state change.

---

## 🏗️ Architecture & Folder Structure

```
BLAZE_UP_PROJECT/
├── backend/
│   ├── src/
│   │   ├── config/           # MongoDB connection with resilient in-memory fallback & env parser
│   │   ├── controllers/      # REST API route handlers
│   │   ├── middlewares/      # JWT authentication, RBAC authorization, centralized error handler
│   │   ├── models/           # Mongoose schemas (User, Employee, Offboarding, Workflow, Document, etc.)
│   │   ├── routes/           # Express API route modules
│   │   ├── services/         # Business logic (Workflow Engine, Access Revocation, PDFKit, Reminders)
│   │   ├── utils/            # Standard response helpers
│   │   ├── app.js            # Express app configuration & middleware pipeline
│   │   ├── server.js         # HTTP server entrypoint
│   │   └── seed.js           # Database population script with demo dataset
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (Sidebar, Navbar, StageTimeline, ChecklistView, DataTable)
│   │   ├── context/          # AuthContext, ToastContext, NotificationContext
│   │   ├── layouts/          # DashboardLayout
│   │   ├── pages/            # View pages (Login, Dashboard, Offboarding, Tasks, Workflows, Documents)
│   │   ├── routes/           # ProtectedRoute and AppRoutes
│   │   ├── services/         # Axios API clients
│   │   ├── styles/           # Modern design system & CSS variables
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
├── package.json              # Monorepo runner scripts
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/blazeup_hros`) or MongoDB Atlas URI (Backend includes automatic in-memory MongoDB fallback in development if no standalone MongoDB instance is running).

---

### Step 1: Install Dependencies

From the project root:
```bash
npm run install:all
```
*Or individually:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### Step 2: Seed the Database

Populate default roles, employees, default workflow template, and initial sample offboarding cases:
```bash
npm run seed
```
*Or:*
```bash
cd backend && node src/seed.js
```

---

### Step 3: Run the Application

Start both backend and frontend concurrently:
```bash
npm run dev
```

*Or start them in separate terminals:*
```bash
# Terminal 1 (Backend - Port 5000)
cd backend && npm run dev

# Terminal 2 (Frontend - Port 5173)
cd frontend && npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Persona Accounts

All seed accounts use the default password: **`Password123!`**

| Role | Email | Purpose / Capabilities |
| :--- | :--- | :--- |
| **HR Admin** | `hradmin@blazeup.com` | Complete system access, workflow designer, case initiation, audit trail |
| **HR Operations** | `hr@blazeup.com` | Case initiation, final clearance, document generation |
| **Manager** | `manager@blazeup.com` | Project & KT clearance review |
| **IT Admin (Admin & Systems)** | `itadmin@blazeup.com` | Hardware asset checklist & digital access revocation |
| **Accounts** | `accounts@blazeup.com` | Financial dues, advances, and loans settlement |
| **Personnel** | `personnel@blazeup.com` | ID card and physical access card recovery |
| **Employee** | `rahul.kumar@blazeup.com` | Self-service status & document viewing |

> 💡 **Pro-Tip**: The application includes a **1-Click Demo Persona Switcher** on the Login screen and in the top navigation bar to seamlessly test all clearance stages.

---

## 🔄 Complete End-to-End Walkthrough Flow

1. **Login as HR Admin** (`hradmin@blazeup.com`):
   - View Dashboard metrics and Department workload distribution.
   - Go to **Workflow Engine** (`/workflows`) to view/edit the 5-stage parallel/sequential pipeline.
   - Go to **Offboarding Cases** -> Click **Initiate Offboarding**.
   - Select employee **Rahul Kumar**, pick resignation date & last working day, and launch process.
2. **Parallel Review Stages Activated**:
   - Stages 1, 2, and 3 are now simultaneously in `ACTIVE` status.
3. **Login as Manager** (`manager@blazeup.com`):
   - Navigate to **My Clearance Tasks** (`/tasks`).
   - Open Rahul Kumar's clearance, verify mandatory checklist items, add remarks, and click **Sign & Approve Clearance**.
4. **Login as IT Admin** (`itadmin@blazeup.com`):
   - Open clearance review, click **Revoke All Accesses** (or revoke individually), verify hardware checklist, and approve.
5. **Login as Accounts** (`accounts@blazeup.com`):
   - Verify financial settlement checklist and approve.
6. **Sequential Dependency Resolution**:
   - The workflow engine automatically detects dependencies are satisfied and transitions **Personnel & Facilities Clearance** to `ACTIVE`.
7. **Login as Personnel** (`personnel@blazeup.com`):
   - Verify ID badge & RFID card returns and approve.
8. **Final Clearance**:
   - The **HR Final Clearance** stage transitions to `ACTIVE`.
   - Login as **HR** (`hr@blazeup.com`), complete final sign-off and approve.
9. **Automatic Completion & Document Issuance**:
   - Offboarding status updates to `COMPLETED` and employee status to `RELIEVED`.
   - Go to **Documents & Letters** (`/documents`): Generate and download **Clearance NOC**, **Resignation Acceptance**, **Relieving Letter**, and **Experience Letter** with live PDF preview!

---

## 📡 REST API Overview

### Authentication & Users
- `POST /api/auth/login`: User login returning JWT.
- `POST /api/auth/register`: Create user account.
- `GET /api/auth/me`: Get current authenticated profile.
- `GET /api/auth/demo-users`: List demo accounts for quick switcher.

### Offboarding Lifecycle
- `GET /api/offboarding`: Filterable list of cases with pagination.
- `POST /api/offboarding`: Initiate new offboarding & instantiate workflow instance.
- `GET /api/offboarding/:id`: 360° case view (employee, workflow, access, documents, audits).
- `PUT /api/offboarding/:id`: Update case notes.
- `POST /api/offboarding/:id/cancel`: Cancel active offboarding case.

### Approvals & Tasks
- `GET /api/approvals/my-tasks`: Fetch clearance tasks assigned to caller's role.
- `GET /api/approvals/:id`: Get task evaluation details with checklist.
- `POST /api/approvals/:id/approve`: Approve stage, validate checklist, advance workflow.
- `POST /api/approvals/:id/reject`: Reject clearance and halt workflow.
- `POST /api/approvals/:id/reminder`: Send reminder notification to approver.

### Workflow Configuration
- `GET /api/workflows`: List workflow templates.
- `POST /api/workflows`: Create workflow template with stage definitions.
- `PUT /api/workflows/:id`: Update stages, execution types, and dependencies.
- `POST /api/workflows/:id/duplicate`: Clone template.

### Document & Letter Generation
- `POST /api/documents/generate`: Generate PDF document based on case data and rules.
- `GET /api/documents/:id/download`: Stream binary PDF to browser.
- `GET /api/documents/offboarding/:offboardingId`: List case documents.
- `GET /api/documents/settings/clauses`: Get configured legal clauses.
- `PUT /api/documents/settings/clauses`: Update non-compete and letterhead clauses.

### IT Access Revocation
- `GET /api/access-revocation`: List all case access statuses.
- `GET /api/access-revocation/:offboardingId`: Get case access items.
- `POST /api/access-revocation/:offboardingId/revoke`: Revoke single system access.
- `POST /api/access-revocation/:offboardingId/revoke-all`: Bulk revoke all accesses.

### Analytics & Compliance
- `GET /api/dashboard/metrics`: Aggregated real-time metrics & department charts.
- `GET /api/audit-logs`: Searchable compliance audit logs.
- `GET /api/notifications`: In-app notification center.

---

## 🛡️ License
Built for BlazeUp HROS.
