# Avis World College — Agent Management System (AMS) Frontend

![Avis AMS Banner](https://img.shields.io/badge/Avis%20World%20College-AMS%20v2.4.0-702B40?style=for-the-badge&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-764ABC?style=flat-square)
![PWA Ready](https://img.shields.io/badge/PWA-Enabled-success?style=flat-square)

An enterprise-grade **Agent Management System (AMS)** and academic administrative portal designed for **Avis World College**. This modern Single-Page & Progressive Web Application (SPA/PWA) streamlines international student recruitment, institutional partner networks, agent commissions, course registrations, and financial settlements.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Security & Performance Hardening](#security--performance-hardening)
- [PWA & Offline Resilience](#pwa--offline-resilience)
- [Testing](#testing)
- [Design System & Theming](#design-system--theming)
- [License](#license)

---

## Overview

The Avis AMS Frontend empowers administrators, international agents, and college representatives with a unified operational cockpit. It handles complex academic administration flows:

- **Global Partner Ecosystem**: Onboard, monitor, and manage educational agents and regional representatives across multiple territories.
- **Academic Lifecycle**: Oversee students, track enrolled courses, inspect student profiles, and maintain college directories.
- **Financial & Commission Engine**: Configure granular commission rates, manage tiered incentives, track fee disbursements, and settle partner payouts.
- **Analytical Governance**: Real-time business intelligence metrics, student intake charts, and audit-ready data exports.

---

## Key Features

### 1. Executive Dashboard

- **Live Institutional KPI Cards**: Total students, active agents, global representatives, and financial summaries.
- **Visual Analytics**: Interactive enrollment trends and payment breakdowns powered by Recharts.
- **Quick Action Triggers**: Instant modal shortcuts to register students, onboard agents, create representatives, or initiate settlements.
- **Live Activity Feed**: Audit trail of recent user actions, course changes, and system alerts.

### 2. Academic & Student Management (`/college`)

- Comprehensive student directory with search, dynamic filters, and CSV export.
- Detailed student profile views with academic records and financial history.
- Course directory and curriculum overview.

### 3. Partner & Network Management (`/admins`, `/agents`, `/representatives`, `/partner`)

- **Admin Roster**: Multi-level administrator directory with granular access status, edit modals, and security-hardened operations.
- **Agents Directory**: Full life-cycle tracking of registered agency partners with commission structures and performance indicators.
- **Representatives**: Dedicated management for country and regional representatives.
- **Partner Profile Views**: Unified interface displaying contract details, associated students, and payout histories.

### 4. Commissions & Payments (`/commission-config`, `/payment`, `/payment_report`)

- Dynamic course commission configuration per partner tier.
- Payment processing, settlement validation (`/payment/settle/:paymentId`), and receipt generation.
- Exportable transaction ledgers with date range and status filters.

### 5. Progressive Web App (PWA) & Offline Readiness

- Custom PWA installation prompt modal for both desktop and mobile users.
- Service worker background update listener with graceful toast notifications.
- Automatic online/offline transition detection (`useNetworkStatus`) with offline fallback screen.

---

## Tech Stack

| Domain                 | Technology / Library                                                                  | Purpose                                                                |
| :--------------------- | :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------- |
| **Framework**          | [React 18](https://react.dev/)                                                        | Component architecture & concurrent rendering                          |
| **Language**           | [TypeScript 5](https://www.typescriptlang.org/)                                       | Strict static typing and developer ergonomics                          |
| **Build Tool**         | [Vite 6](https://vitejs.dev/)                                                         | Lightning-fast HMR and optimized production bundling                   |
| **Styling**            | [Tailwind CSS 3](https://tailwindcss.com/)                                            | Utility-first styling with custom Avis College brand palette           |
| **Routing**            | [React Router 7](https://reactrouter.com/)                                            | Type-safe declarative client-side routing                              |
| **State Management**   | [Zustand 5](https://github.com/pmndrs/zustand)                                        | Lightweight, predictable global stores (`useAppStore`, `useAuthStore`) |
| **Animations**         | [Framer Motion 11](https://www.framer.com/motion/) & [GSAP 3](https://greensock.com/) | Fluid transitions with `prefers-reduced-motion` compliance             |
| **Data Visualization** | [Recharts 2](https://recharts.org/)                                                   | Responsive SVG charts (bar charts, pie breakdowns, trends)             |
| **Forms & Validation** | [React Hook Form 7](https://react-hook-form.com/) + [Zod 4](https://zod.dev/)         | High-performance forms with strict schema validation                   |
| **Icons**              | [Lucide React](https://lucide.dev/)                                                   | Clean, accessible SVG iconography                                      |
| **Dates**              | [date-fns 4](https://date-fns.org/)                                                   | Modular and immutable date parsing & formatting                        |
| **Testing**            | Node.js Test Runner (`node --test`)                                                   | Built-in test runner with native TypeScript type stripping             |

---

## Architecture & Directory Structure

```text
AMS_Frontend/
├── public/                 # Static assets, PWA icons, manifest
├── src/
│   ├── app/                # Application root, routing & providers
│   │   ├── providers/      # Context providers & wrappers
│   │   ├── App.tsx         # Root component with offline/PWA listeners
│   │   ├── main.tsx        # Application bootstrap entry
│   │   ├── router.tsx      # React Router configuration & route trees
│   │   └── routes.ts       # Centralized type-safe route catalog (ROUTES)
│   ├── assets/             # Brand images, illustrations, SVG icons
│   ├── components/         # Reusable UI & presentation components
│   │   ├── animations/     # Framer Motion transition variants
│   │   ├── charts/         # Reusable Recharts wrappers
│   │   ├── common/         # Breadcrumbs, ErrorBoundary, ToastMessage, PWA modals
│   │   └── ui/             # Buttons, Inputs, Modals, Pagination, Table primitives
│   ├── features/           # Domain-driven feature modules
│   │   ├── admins/         # Administrator directory, modals & roster
│   │   ├── agents/         # Educational agent listings & details
│   │   ├── auth/           # Login, authentication guards & sessions
│   │   ├── college/        # Students, courses, and academic profiles
│   │   ├── courseCommission/# Commission rate matrices & rule config
│   │   ├── dashboard/      # Primary executive dashboard & metric widgets
│   │   ├── institute/      # Institute profiles & campus details
│   │   ├── partners/       # Unified partner profiles & views
│   │   ├── payment/        # Settlement workflows & payment records
│   │   ├── paymentReport/  # Payment transaction logs & statements
│   │   ├── profile/        # Current user profile & account settings
│   │   ├── reports/        # Custom report generation
│   │   └── representatives/# Regional representative rosters & stats
│   ├── hooks/              # Reusable custom hooks (network, PWA, debounce)
│   ├── layouts/            # DashboardLayout, Sidebar, Header components
│   ├── lib/                # Security sanitizers, PWA handlers, network utilities
│   ├── services/           # API client, error handlers, and HTTP layer
│   ├── store/              # Global Zustand state stores
│   ├── styles/             # Tailwind & custom CSS imports
│   ├── types/              # Domain TypeScript types & interfaces
│   └── utils/              # Export utilities (CSV), data formatters
├── tests/                  # Unit and security test suites
├── .env                    # Environment configuration
├── tailwind.config.js      # Custom theme colors and layout extensions
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build config, chunk splitting & security headers
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher recommended (supports native `--experimental-strip-types`), minimum `v18.x`.
- **Package Manager**: `npm` (v9+) or `pnpm`.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd AMS_Frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Running the Application

- **Start Development Server:**

  ```bash
  npm run dev
  ```

  The development server will launch at: `http://localhost:5174/`

- **Build for Production:**

  ```bash
  npm run build
  ```

  Runs TypeScript type-checks (`tsc -b`) and creates an optimized production bundle in `/dist`.

- **Preview Production Build:**
  ```bash
  npm run preview
  ```
  Serves the `/dist` directory locally with production security headers at: `http://localhost:4173/`

---

## Available Scripts

| Command           | Action                                                                             |
| :---------------- | :--------------------------------------------------------------------------------- |
| `npm run dev`     | Starts Vite local development server with HMR on port `5174`.                      |
| `npm run build`   | Compiles TypeScript and builds production-optimized assets.                        |
| `npm run preview` | Runs a local server to test the production build output.                           |
| `npm test`        | Executes the native Node.js test suite across security and error handling modules. |

---

## Security & Performance Hardening

Avis AMS implements multi-layered security controls to safeguard institutional and student data:

1. **Content Security Policy (CSP) & HTTP Headers**:
   - `vite.config.ts` injects strict security headers:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: SAMEORIGIN`
     - `X-XSS-Protection: 1; mode=block`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - Production CSP restricting script execution, style origins, and object rendering.
2. **Input & URL Sanitization (`src/lib/security.ts`)**:
   - `sanitizeInput()` removes raw HTML tags, `<script>` blocks, and inline event handlers (`onerror`, `onload`).
   - `sanitizeUrl()` validates protocol safety, disallowing dangerous schemes like `javascript:` and protocol-relative URLs.
   - `validateFileUpload()` validates file MIME types and enforces strict file size boundaries.
3. **Data Protection & Error Redaction (`src/lib/errorHandler.ts`)**:
   - Sensitive credentials, Bearer tokens, passwords, database URIs, and local operating system paths are automatically redacted from error traces before being logged or displayed.
4. **Optimized Code Splitting**:
   - Rollup manual chunks configure dedicated vendor groups (`vendor-core`, `vendor-charts`, `vendor-animation`, `vendor-forms`, `vendor-date`, `vendor-icons`), ensuring optimal caching and fast initial paint times.
   - Production sourcemaps are intentionally disabled (`sourcemap: false`) to avoid leaking source code architecture.

---

## PWA & Offline Resilience

Avis AMS operates as an installable Progressive Web App with offline tolerance:

- **Network Monitoring**: The `useNetworkStatus` hook detects dropped connections and automatically triggers feedback when connectivity is restored.
- **Dynamic Chunk Retry**: `lazyWithRetry` safely recovers lazy-loaded React components in the event of temporary network blips or cache mismatches following new deployments.
- **Installation Modals**: Non-intrusive banner and modal suggestions prompt eligible users to install the dashboard to their home screen or desktop application dock.

---

## Testing

The project uses the fast, zero-dependency **Node.js Native Test Runner** (`node:test` and `node:assert/strict`) with TypeScript type stripping:

```bash
npm test
```

### Verified Test Areas:

- **`tests/security.test.ts`**: Validates XSS injection defenses, URL protocol white-listing, and file upload validation.
- **`tests/errorHandler.test.ts`**: Verifies sanitization and redaction of secrets, tokens, and filesystem paths.
- **`tests/apiError.test.ts`**: Validates status code mappings, user-friendly fallback messaging, and network timeout handling.

---

## Design System & Theming

The application utilizes an authoritative, institutional color palette defined in `tailwind.config.js`:

- **Primary Brand**: Avis Burgundy (`#702B40`) with deep wine tones (`#501E2E`) and lighter accents (`#8B3650`).
- **Accent**: Refined Gold (`#D4AF37`, `#B8860B`) used for badges, verified partner badges, and highlights.
- **Backgrounds**: Soft Slate/Zinc neutrals designed for high-contrast data readability.
- **Accessibility**: All interactive and animated elements respect the user's `prefers-reduced-motion` settings via Framer Motion's `useReducedMotion()`.

---

## License

Internal proprietary software developed for **Avis World College**.  
All rights reserved. Unauthorized copying, distribution, or reproduction of this codebase is strictly prohibited.
