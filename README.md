# HANSAI SHIPPING LINE
### Integrated Shipping, Container & Vessel Management System (Enterprise Fleet ERP)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-1b222d)](https://www.prisma.io/)

---

## 1. Overview & Brand Identity

**HANSAI SHIPPING LINE** is a premier international enterprise shipping, container leasing, freight forwarding, and vessel trading conglomerate. This web application provides a full-stack, enterprise-grade Fleet Enterprise Resource Planning (ERP) platform designed for executive oversight, daily port operations, container depot control, financial multi-division management, and marine vessel asset trading.

### Brand Palette & Styling
- **Primary Navy**: `#102A43`
- **Secondary Ocean Blue**: `#176B87`
- **Accent Cyan**: `#23A6C7`
- **Neutral Background**: `#F4F7FA`
- **Card Surface**: `#FFFFFF`
- **Success / Warning / Danger**: `#15966B` / `#E6A23C` / `#DC4C4C`
- **Typography**: Inter / Plus Jakarta Sans

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS with custom enterprise nautical tokens
- **Routing**: React Router DOM v6
- **Charts & Visualizations**: Recharts (Revenue, expenses, fleet distribution, cashflow trends)
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic JWT injection & 401 interceptors
- **Forms & Validation**: Controlled forms & React Hook Form
- **Exports & Documents**:
  - `ExcelJS` & CSV export engine
  - `jsPDF` printable Bill of Lading (B/L) and Commercial Invoices

### Backend
- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Web Framework**: Express.js with Helmet and CORS
- **ORM**: Prisma ORM 5.22
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing (10 salt rounds)
- **Validation**: Zod & Express middleware
- **Audit Logging**: Comprehensive mutation audit logger recording user, action, IP, and timestamps

### Database Architecture
- **Local Development (Default Zero-Config)**: Embedded SQLite (`server/dev.db`) — runs immediately without needing external database daemons or Docker.
- **Enterprise Production**: PostgreSQL schema provided at `server/prisma/schema.postgresql.prisma` with identical relations, decimal types, and composite indexes.

---

## 3. Demo Credentials (Role-Based Access Control)

The platform comes pre-seeded with **6 fully configured demo accounts** representing the 7 enterprise roles. You can sign in using the credentials below, or click any of the **Quick Demo Login chips** directly on the `/login` screen.

> **Default Password for All Demo Accounts**: `hansai123`

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@hansai.com` | `hansai123` | Full unrestricted access to all modules, financial journals, users, RBAC, and demo reset |
| **Administrator** | `admin@hansai.com` | `hansai123` | Operational, vessel, and container administrative control |
| **Finance Manager** | `finance@hansai.com` | `hansai123` | P&L statements, Cashflow, Invoices, Payment collection, Tax & Customs calculator |
| **Shipping Manager** | `shipping@hansai.com` | `hansai123` | Shipment dispatch, 12-stage tracking, B/L generation, Port schedules |
| **Container Manager** | `container@hansai.com` | `hansai123` | Container fleet inventory, Leasing contracts, Container Buy/Sell, Depot PTI maintenance |
| **Operational Staff** | `staff@hansai.com` | `hansai123` | Shipment tracking milestone updates, depot inspections, document view |
| **Viewer / Executive** | `viewer@hansai.com` | `hansai123` | Read-only executive dashboard and operational reports |

---

## 4. Key Functional Modules

### 1. Executive Dashboard
- **Financial KPIs**: Total Revenue, Operating Expenses, Gross Profit, Net Profit, Cash Balance, Accounts Receivable (AR), Accounts Payable (AP), and Outstanding Invoices.
- **Operational KPIs**: Active Shipments, Completed Deliveries, Delayed Cargo Alerts, Available Fleet TEU, Leased Containers, and Units Sold.
- **Interactive Visualizations**:
  - Monthly Revenue vs. Expense trend (Area / Bar)
  - Revenue by Business Division (Shipping Line, Container Rental, Container Trading, Vessel Trading)
  - Container Utilization gauge
  - Shipment Status breakdown
- **Time Filters**: Today, This Week, This Month, This Quarter, This Year, All Time.

### 2. Shipping Management & 12-Stage Tracking
- FCL & LCL shipment creation and management.
- Complete documentation: HS Code, Gross/Net Weight, Volume (CBM), POL, POD, Shipping Line, Vessel, Voyage, Booking #, Bill of Lading (B/L) #.
- **12-Stage Visual Milestone Progression**:
  1. Warehouse Preparation
  2. Stuffing
  3. Documentation
  4. Customs Clearance Origin
  5. Gate In
  6. Vessel Departure
  7. In Transit
  8. Vessel Arrival
  9. Customs Clearance Destination
  10. Container Release
  11. Final Delivery
  12. Proof of Delivery (POD)
- One-click Printable / PDF Bill of Lading generator.

### 3. Container Fleet Inventory & Maintenance
- Centralized tracking of 100+ ISO-standard containers (`HNSU-...`).
- Types: 20FT Standard, 40FT Standard, 40FT High Cube, 20FT Reefer, 40FT Reefer, Open Top, Flat Rack.
- Real-time statuses: `Available`, `Rented`, `In Transit`, `Under Maintenance`, `Damaged`, `Sold`.
- Depot Maintenance: Pre-Trip Inspection (PTI), Reefer servicing, corner casting, structural refurbishment.

### 4. Container Rental (Leasing) Management
- Automated contract generation with daily, weekly, or monthly rates.
- Automatic calculation engine:
  - $\text{Rental Amount} = \text{Duration} \times \text{Rate}$
  - $\text{Late Fee} = \text{Overdue Days} \times \text{Daily Penalty Rate}$
  - $\text{Total} = \text{Rental} + \text{Late Fee} + \text{Damage Charges}$
  - $\text{Outstanding} = \text{Total} - \text{Payments Received}$
- One-click Return processing and payment receipt registration.

### 5. Container Trading (Purchase & Sales)
- **Container Purchase**: Supplier PO, acquisition cost calculation (Purchase Price + Transport + Inspection + Repair + Other).
- **Container Sales**: Buyer invoice, automated gross profit calculation ($\text{Selling Price} - \text{Acquisition Cost} - \text{Expenses}$).
- Validation safeguard: Prevents selling units that are currently leased or already marked as sold.

### 6. Module 21: Vessel Database & Ship Management (Enterprise Fleet)
Full technical management across **7 distinct vessel categories**:
1. **Tugboat**: Bollard pull (tons), towing winch type, twin-screw / azimuth stern drive (ASD).
2. **Barge / Deck Cargo Barge**: Deadweight tonnage (DWT), deck strength ($T/m^2$), sidewalls.
3. **Oil Tanker**: Liquid capacity ($m^3$), cargo pumps, segregation grades, double hull status.
4. **Landing Craft Tank (LCT)**: Ramp door dimensions & capacity, vehicle deck load, shallow draft.
5. **Container Ship**: TEU/FEU capacity, reefer plugs, onboard crane configuration ($2 \times 40T$).
6. **Bulk Carrier**: Grain/bale capacity, cargo holds/hatches, grab cranes, bulk cargo rating.
7. **Fast Crew Boat**: Passenger seats, deck cargo area, service speed (25+ knots), dynamic positioning.

Sub-modules include:
- **Vessel Purchase (M21-C)**: Capitalized acquisition cost, escrow tracking, flag registration.
- **Vessel Sales (M21-D)**: Realized Trading Profit vs. Accounting Gain/Loss after accumulated depreciation.
- **Vessel Maintenance & OPEX (M21-F)**: Annual drydock, class surveys, bunkering (fuel), crew payroll, port disbursements.
- **Vessel Documents & Certificates (M21-G)**: Automatic expiry alerts for BKI/Class certificates, Load Line, Safety Construction, Safe Manning.
- **Vessel Classification Surveys**: Annual, intermediate, special drydock, and UWILD inspections.
- **Vessel Trading Calculator (M21-H)**: ROI, CapEx payback, charter day-rate profitability, and breakeven voyage analysis.

### 7. Financial Management & Multi-Division P&L
- Multi-division separation:
  1. Shipping Line Operations
  2. Container Rental
  3. Container Trading
  4. Vessel Trading
- General Ledger Transactions with dual-currency (USD / IDR) support.
- Cashflow Statements (Operating, Investing, Financing cashflows).
- Commercial Invoices with automated tax computation, PDF generation, and payment settlement.

### 8. Tax, Customs & THC Calculator
- Indonesian Import/Export Customs duty modeling:
  - **CIF Base**: $\text{Customs Value} = \text{FOB} + \text{Freight} + \text{Insurance}$
  - **Bea Masuk (Import Duty)**: Configurable tariff %
  - **PPN Impor (Import VAT)**: Standard 11% tax base
  - **PPh 22 Impor**: 2.5% (with API) vs 7.5% (without API)
- Terminal Handling Charges (THC) calculator for Port of Tanjung Priok, Tanjung Perak, and Singapore Port.
- *Notice*: Explicit disclaimer informing operators that calculations represent estimates and require verification against official customs billing (Billing DJBC) and PPJK calculations.

### 9. Advanced Logistics Calculators
- **Ocean Freight Calculator**: Freight rates, BAF, CAF, ISPS, THC, and documentation fees.
- **LCL W/M Calculator**: Weight vs. Measurement (Revenue Ton) comparative pricing.
- **CBM & Container Stowing Calculator**: Box dimension volumetric calculation and container fit estimator.
- **Currency & Commercial Margin Calculator**: Live exchange rate conversion and target markup pricing.

### 10. System Administration & Demo Data Reset
- User management with role assignments and password resets.
- Audit log explorer with action timestamps and IP addresses.
- **One-Click Demo Data Reset**: Safely resets the system back to the rich demonstration state with 100 containers, 29 vessels, 30 shipments, and financial records.

---

## 5. Quickstart & Installation

### Prerequisites
- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher

### 1. Installation
Clone the repository or navigate to the project directory:
```bash
cd "c:\Users\Ansel\Documents\dashboard hansai"
```

Install root, backend, and frontend dependencies:
```bash
npm run install:all
```

### 2. Database Initialization & Seeding
Initialize the SQLite database schema and populate realistic demo data:
```bash
npm run setup
```
*(Or simply `npm run seed` if the schema is already generated).*

### 3. Start Development Servers
Run both backend Express server and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

Log in with `admin@hansai.com` and password `hansai123` or use the quick login buttons.

---

## 6. Switching to PostgreSQL (Production Setup)

To deploy to production using PostgreSQL:

1. Configure your PostgreSQL connection string in `server/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hansai_shipping?schema=public"
```

2. Replace `server/prisma/schema.prisma` with `server/prisma/schema.postgresql.prisma`:
```bash
cp server/prisma/schema.postgresql.prisma server/prisma/schema.prisma
```

3. Run Prisma migration and seed:
```bash
cd server
npx prisma db push
node prisma/seed.js
```

---

## 7. REST API Endpoints Overview

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User authentication & JWT issuance | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |
| `POST` | `/api/auth/forgot-password`| Request password reset | Public |
| `GET` | `/api/dashboard/kpi` | Executive dashboard KPIs & charts | Authenticated |
| `GET` | `/api/shipments` | List shipments with filtering & pagination | Authenticated |
| `POST` | `/api/shipments` | Create new FCL/LCL shipment | Shipping / Admin |
| `PUT` | `/api/shipments/:id/tracking`| Update shipment 12-stage milestone | Staff / Shipping / Admin |
| `GET` | `/api/containers/inventory` | List container fleet | Authenticated |
| `POST` | `/api/containers/inventory`| Register new container | Container / Admin |
| `GET` | `/api/containers/rentals` | List container leasing contracts | Authenticated |
| `POST` | `/api/containers/rentals` | Create rental lease contract | Container / Admin |
| `PUT` | `/api/containers/rentals/:id/return` | Process container lease return | Container / Admin |
| `GET` | `/api/containers/purchases`| Container procurement history | Authenticated |
| `GET` | `/api/containers/sales` | Container sales & trading profit | Authenticated |
| `GET` | `/api/vessels` | Full fleet database across 7 vessel types| Authenticated |
| `POST` | `/api/vessels/purchases` | Record vessel acquisition | Admin / Super Admin |
| `POST` | `/api/vessels/sales` | Record vessel sale & trading profit | Admin / Super Admin |
| `GET` | `/api/vessels/dashboard` | Vessel trading & fleet valuation KPIs | Authenticated |
| `GET` | `/api/finance/profit-loss` | Multi-division Profit & Loss report | Finance / Admin |
| `GET` | `/api/finance/cashflow` | Cashflow statement | Finance / Admin |
| `GET` | `/api/finance/invoices` | Commercial invoices list | Finance / Admin |
| `POST` | `/api/calculators/tax-customs` | Indonesian customs & duty calculator | Authenticated |
| `POST` | `/api/calculators/thc` | Terminal Handling Charge calculation | Authenticated |
| `POST` | `/api/system/reset-demo` | Safely restore demo seed data | Super Admin |

---

## 8. License & Commercial Rights

Copyright © 2026 **HANSAI SHIPPING LINE**. All rights reserved.  
Built for enterprise maritime operations and fleet logistics management.

