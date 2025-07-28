# Employee Management System

A Vue 3 + Vite application for managing companies, departments, and employees, with real-time updates, role-based access, and modern UX features.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Feature Checklist](#feature-checklist)
- [Assumptions & Notes](#assumptions--notes)
- [Bonus Features](#bonus-features)
- [License](#license)

---

## Overview

This Employee Management System allows users to manage companies, departments, and employees with CRUD operations, real-time updates, and a modern, responsive UI. The system supports role-based access (Admin, Manager, Employee), notifications, theme and locale switching, and more.

---

## Features

- **Authentication & User Management**
  - Login/Logout, session management
  - Role-based navigation (Admin, Manager, Employee)
  - Profile editing and activity feed
  - Forgot/Reset password UI
- **Company Management**
  - List, search, paginate companies
  - Bulk delete/export, CSV import
  - Hierarchy tree view (parent-child)
  - Create/Edit with parent selection and address input
- **Department Management**
  - List, filter by company, search
  - Inline editing, drag-and-drop reorder
  - Create/Edit with company/head selection
- **Employee Management**
  - List, filter, inline edit, bulk import/export
  - Onboarding wizard (3-step)
  - Timeline/history view
- **Global Features**
  - Real-time updates (WebSocket/SSE)
  - Notification center
  - Theme (light/dark) & locale (i18n, RTL)
  - Accessibility improvements

---

## Setup & Installation

### Prerequisites

- Node.js (v16+ recommended)
- pnpm (or npm/yarn)

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

### Start the backend (if required)

- The project uses a mock backend (see `server.js` and `db.json`).
- Start the backend server:

```bash
node server.js
```

### Access the app

- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Feature Checklist

| Feature                                     | Status      |
| ------------------------------------------- | ----------- |
| Auth (Login/Logout/Profile)                 | ✅ Complete |
| Role-Based Menus                            | ✅ Complete |
| Company CRUD/List/Search/Tree/Import/Export | ✅ Complete |
| Company Drag-and-Drop Hierarchy             | ⚠️ Partial  |
| Department CRUD/List/Filter/Order/Inline    | ✅ Complete |
| Department Bulk Assign/Unassign             | ❌ Missing  |
| Employee CRUD/List/Filter/Import/Export     | ✅ Complete |
| Employee Virtualized List                   | ❌ Missing  |
| Employee Advanced Filters/Sorting           | ⚠️ Partial  |
| Employee Onboarding Wizard                  | ✅ Complete |
| Employee Timeline                           | ✅ Complete |
| Real-Time Updates (WS/SSE)                  | ✅ Complete |
| Notifications Center                        | ✅ Complete |
| Theme & Locale (i18n, RTL, Dark/Light)      | ✅ Complete |
| Offline Support (IndexedDB)                 | ❌ Missing  |
| Accessibility                               | ⚠️ Partial  |
| Reporting/Export (Bonus)                    | ❌ Missing  |
| Admin/Audit (Bonus)                         | ❌ Missing  |

---

## Assumptions & Notes

- **Authentication** uses a demo user (`admin@example.com` / `123456`). No real backend authentication or token refresh.
- **Real-time updates** use mock WebSocket/SSE for demo purposes.
- **Data persistence** is via a mock backend (`db.json`).
- **Some advanced/bonus features** (see below) are not implemented due to time constraints.
- **Accessibility**: Basic ARIA and color contrast are present, but not fully audited.

---

## Bonus Features

- **Not Implemented:**
  - Multi-factor authentication (MFA)
  - Department bulk assign/unassign
  - Employee list virtualization for large datasets
  - Custom report builder, scheduled reports, export to PDF/XLSX
  - Admin/audit logs, system settings
  - Offline support (IndexedDB caching)

---

## License

MIT
