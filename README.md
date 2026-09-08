# Employee Offboarding Automation — BlazeUp HROS

A full-stack **Employee Offboarding Automation Platform** designed to replace manual and paper-based employee exit processes with a centralized digital workflow.

The system manages employee offboarding through **role-based departmental clearances, configurable workflow stages, checklists, approvals, notifications, access revocation, audit tracking, and official PDF document generation**.

**Tech Stack:** React 18 · Vite · Vanilla CSS · Node.js · Express.js · MongoDB · Mongoose · JWT · bcrypt · PDFKit

---

## Description

BlazeUp HROS provides a centralized platform for managing the complete employee exit process.

Instead of coordinating employee clearance through emails, spreadsheets, paper forms, and manual follow-ups, HR can initiate an offboarding case and track the entire process from one application.

Different departments are responsible for their respective clearance activities:

- **Project / Reporting Manager** — project completion and employee handover
- **Admin & Systems** — company assets and IT access
- **Accounts** — financial clearance
- **Personnel** — ID cards and facility-related items
- **HR** — final clearance and employee documents

The system ensures that each user can access and perform only the operations allowed by their assigned role.

---

## The core idea

The main idea of BlazeUp HROS is to use a **configurable workflow engine** instead of hardcoding the employee offboarding process.

Each workflow stage can contain:

- Assigned role
- Execution type
- Dependencies
- Checklist
- Approval status
- Remarks
- Completion information

The workflow engine evaluates these configurations and determines which stage should become active.

This makes the workflow easier to maintain and extend without changing the core workflow logic.

### Employee offboarding workflow

```text
HR Initiates Offboarding
          │
          ▼
Project / Reporting Manager
          │
          │ Approved
          ▼
┌───────────────────────────────────────┐
│       Department Clearances           │
│                                       │
│  Admin & Systems │ Accounts │ Personnel
│       │                │          │   │
└───────┼────────────────┼──────────┼───┘
        │                │          │
        └────────────────┼──────────┘
                         │
                         ▼
                  HR Final Clearance
                         │
                         │ Approved
                         ▼
                  Workflow Completed
                         │
                         ▼
                 Employee → RELIEVED
                         │
                         ▼
                  Official Documents
Workflow stages
Level	Department	Execution	Purpose
1	Project / Reporting Manager	Sequential	Project completion, knowledge transfer and handover
2	Admin & Systems	Parallel	Assets, IT systems and access clearance
2	Accounts	Parallel	Financial and account clearance
2	Personnel	Parallel	ID cards, access cards and facilities
3	HR Final Clearance	Sequential	Final employee exit approval
