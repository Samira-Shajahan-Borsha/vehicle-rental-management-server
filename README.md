# 🚗 Vehicle Rental Management Server

Vehicle Rental Management Server is a production-ready REST API for a vehicle rental company. Staff log in and manage the vehicle fleet, customer bookings are recorded as rentals, and admins get a monthly report of rental activity per vehicle. It enforces double-booking prevention, computes rental totals server-side, and exposes analytics — all behind a clean, service-oriented architecture.

---

## 🎯 Project Overview

Vehicle Rental Management Server is a robust RESTful API that powers a small vehicle rental platform. It enables staff authentication, vehicle fleet management with photo uploads, rental booking with conflict detection, and per-vehicle monthly revenue reporting.

Key capabilities:

- Secure staff login with hashed passwords and JWT token issuance
- Session management via HTTP-only cookies (access + refresh tokens)
- Full vehicles lifecycle: create (with photo upload), read, update (with photo replacement) and soft delete
- Full rentals lifecycle: create, read, update and hard delete
- **Double-booking prevention**: a vehicle can't be booked twice for overlapping dates while a rental is active
- **Server-side `total_amount` calculation**: `daily_rate × number of days` (a same start/end date counts as 1 day)
- **Monthly rental report**: per-vehicle bookings, days rented and revenue — counting only the days that fall inside the requested month — plus the top-revenue vehicle
- Pagination, filtering, sorting and search via a reusable QueryBuilder utility
- Transaction-safe booking so two simultaneous bookings of the same vehicle can't both succeed
- Centralized error handling and Joi request validation

---

## 🌐 Repository & Base URL

- **Repository:**
  https://github.com/Samira-Shajahan-Borsha/vehicle-rental-management-server

- **Base URL (Local Development):**
  http://localhost:5000/api/v1

---

## 🔑 Test Credentials

### Staff Account

| Role      | Email            | Password    |
| --------- | ---------------- | ----------- |
| Staff/Admin | admin@example.com | Admin@123 |

> **Note:** These are development test credentials. The staff account is created by the database seed from the `.env` variables `STAFF_EMAIL` and `STAFF_PASSWORD`. Never use production credentials in the `.env` file.

---

## 🔐 Authentication, Authorization & Security Highlights

Vehicle Rental Management Server secures staff access with short-lived access tokens and longer-lived refresh tokens. Authentication is centered on JWTs, and every `/vehicles`, `/rentals` and `/reports` route is protected by the `checkAuth` middleware.

Key details:

- **Access & Refresh Tokens:** Login exchanges credentials for an access token and a refresh token signed with separate secrets and expiry durations.
- **Secure Cookie Storage:** Both tokens are stored in HTTP-only cookies (`sameSite: none`, `secure` in production), reducing the XSS attack surface.
- **JWT Verification:** `checkAuth` verifies the `accessToken` cookie on every protected route and attaches the decoded payload to `req.user`.
- **Account Existence Validation:** Every authenticated request re-verifies the staff member still exists in the database.
- **Password Security:** Passwords are hashed using `bcryptjs` with configurable salt rounds and are never returned in responses.

Security best practices implemented:

- `httpOnly` cookies with the `secure` flag enabled in production
- Separate short-lived access token and long-lived refresh token
- Centralized middleware for authentication and identity checks

---

## 🧠 Core Business Logic

### 1️⃣ Authentication & Staff

- Public login with email and password, validated with Joi (strict password rules on input)
- On success, returns the staff profile (without the password hash) plus access and refresh tokens

### 2️⃣ Vehicle Fleet Management

- Authenticated staff can create, view, update and delete vehicles
- Vehicle photos are uploaded as `multipart/form-data` (a `file` field for the image and a `data` field containing the other fields as a JSON string)
- Photos are stored in **Cloudinary**; replacing the photo deletes the previous image, and uploaded photos are cleaned up automatically if validation fails
- Unique `plate_number` enforcement (409 on duplicates)
- **Soft delete**: vehicles are marked with `deleted_at` and excluded from all listings instead of being removed
- Listings support pagination, filtering by `category`, and case-insensitive search by `name`

### 3️⃣ Rentals & Booking

- Authenticated staff can create, view, update and delete rentals
- **Availability check**: a new or updated rental is rejected with a `409` if the vehicle already has an *active* rental (`booked` or `ongoing`) whose date range overlaps the requested dates
- The overlap check re-runs on update whenever the dates or the vehicle change (excluding the rental being edited)
- `total_amount` is always computed server-side: `daily_rate × number of days`, where a same start/end date counts as 1 day
- Rental status lifecycle: `booked → ongoing → completed / cancelled`
- **Transaction-safe**: the availability check and the insert/update run inside a single database transaction, so two simultaneous bookings of the same vehicle can't both succeed
- Listings support pagination, filtering by `vehicle_id`, `status`, and date range

### 4️⃣ Monthly Rental Report

- Admins can request a monthly report with `GET /reports/rentals?month=YYYY-MM` (optionally filtered to a single vehicle)
- For each vehicle: `id`, `name`, `total_bookings`, `days_rented` and `revenue`
- Only the days/revenue that fall **inside the requested month** are counted — a rental running July 29 – Aug 3 contributes 3 days to the August report, not 6
- Cancelled rentals are excluded from the report
- Also returns the vehicle with the highest revenue for that month (or `null` when there's no revenue)

---

## 🧩 API Endpoints Overview

> All endpoints are prefixed with `/api/v1`. All routes except `/auth/login` require the staff access token cookie.

### 🔐 Authentication

| Endpoint        | Method | Access | Description                      |
| --------------- | ------ | ------ | -------------------------------- |
| `/auth/login`   | POST   | Public | Login with email & password      |

---

### 🚗 Vehicles

| Endpoint       | Method | Access | Description                                       |
| -------------- | ------ | ------ | ------------------------------------------------- |
| `/vehicles`    | GET    | Staff  | List vehicles (paginated, filter by category/search) |
| `/vehicles/:id`| GET    | Staff  | Get a single vehicle                              |
| `/vehicles`    | POST   | Staff  | Create a vehicle (multipart with photo)           |
| `/vehicles/:id`| PUT    | Staff  | Update a vehicle (including photo replacement)    |
| `/vehicles/:id`| DELETE | Staff  | Soft delete a vehicle                             |

> **Vehicle create/update format:** `multipart/form-data` with a `data` field (a JSON string containing `name`, `plate_number`, `category`, `daily_rate`) and a `file` field for the photo.

Example `data` value:

```json
{ "name": "Toyota Corolla", "plate_number": "DHA-1234", "category": "Sedan", "daily_rate": 3500 }
```

---

### 📋 Rentals

| Endpoint       | Method | Access | Description                                           |
| -------------- | ------ | ------ | ----------------------------------------------------- |
| `/rentals`     | GET    | Staff  | List rentals (filter by vehicle, status, date range) |
| `/rentals/:id` | GET    | Staff  | Get a single rental                                   |
| `/rentals`     | POST   | Staff  | Create a rental (409 on overlapping active booking)   |
| `/rentals/:id` | PUT    | Staff  | Update a rental (re-checks availability on date/vehicle changes) |
| `/rentals/:id` | DELETE | Staff  | Delete a rental                                       |

---

### 📊 Reports

| Endpoint                    | Method | Access | Description                                 |
| --------------------------- | ------ | ------ | ------------------------------------------- |
| `/reports/rentals`          | GET    | Staff  | Monthly rental report per vehicle           |

---

### 📄 Query Parameters (List Endpoints)

#### `/vehicles`

| Parameter  | Type   | Default | Description                           |
| ---------- | ------ | ------- | ------------------------------------- |
| `page`     | number | `1`     | Page number for pagination            |
| `limit`    | number | `10`    | Number of items per page (max 100)    |
| `category` | string | —       | Filter by vehicle category            |
| `search`   | string | —       | Case-insensitive search on vehicle name |

#### `/rentals`

| Parameter   | Type   | Default | Description                             |
| ----------- | ------ | ------- | --------------------------------------- |
| `page`      | number | `1`     | Page number for pagination              |
| `limit`     | number | `10`    | Number of items per page (max 100)      |
| `vehicle_id`| number | —       | Filter by vehicle                       |
| `status`    | string | —       | Filter by status (`booked`, `ongoing`, `completed`, `cancelled`) |
| `startDate` | string | —       | Rentals starting on/after this date (`YYYY-MM-DD`) |
| `endDate`   | string | —       | Rentals ending on/before this date (`YYYY-MM-DD`) |

#### `/reports/rentals`

| Parameter   | Type   | Default | Description                          |
| ----------- | ------ | ------- | ------------------------------------ |
| `month`     | string | —       | Report month in `YYYY-MM` format (e.g. `2026-08`) |
| `vehicle_id`| number | —       | Restrict the report to one vehicle   |

---

### 📦 Response Format

Successful responses follow a consistent envelope:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Vehicles retrieved successfully",
  "meta": { "page": 1, "limit": 10, "total": 2, "totalPage": 1 },
  "data": []
}
```

List endpoints include a `meta` object with `page`, `limit`, `total` and `totalPage`. Errors return `success: false` with a `statusCode` and `message`.

---

## 🛠️ Technology Stack

### 🧠 Core & Runtime

- 🚀 **Node.js:** JavaScript runtime
- 🌐 **Express.js:** HTTP server and REST API routing
- 🧪 **TypeScript:** Static type checking and compilation

### 🗄️ Database & ORM

- 🐘 **PostgreSQL:** Relational database
- 🧾 **Knex:** SQL query builder with migrations and seeds

### 🔐 Authentication & Security

- 🔑 **jsonwebtoken:** JWT access and refresh token handling
- 🛡️ **bcryptjs:** Password hashing and verification
- 🍪 **cookie-parser:** HTTP cookie parsing for token storage

### 📁 File Uploads

- 🖼️ **Multer:** Multipart file upload handling
- ☁️ **multer-storage-cloudinary:** Uploads photos directly to Cloudinary
- 🌤️ **cloudinary:** Cloud image storage and deletion

### ✅ Validation & Serialization

- 🧩 **Joi:** Request and query schema validation

### 🌐 HTTP & Network

- 🌍 **CORS:** Cross-Origin Resource Sharing middleware
- ⚙️ **dotenv:** Environment variable management
- 🧾 **http-status-codes:** HTTP status helpers

### 🛠️ Development Tools

- ⚡ **tsx:** TypeScript watch-mode development server
- 🧹 **ESLint:** Code linting and quality checks
- 🎨 **Prettier:** Code formatting
- 🧠 **TypeScript:** Compile-time type safety

### 📦 Type Definitions (Dev Dependencies)

- **@types/cookie-parser**
- **@types/cors**
- **@types/express**
- **@types/jsonwebtoken**
- **@types/multer**
- **@types/node**
- **@types/pg**

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **PostgreSQL** (a Neon cloud instance works great)
- A **Cloudinary** account (for vehicle photo uploads)
- **Git** for version control

### Clone the Repository

```bash
git clone https://github.com/Samira-Shajahan-Borsha/vehicle-rental-management-server.git
cd vehicle-rental-management-server
```

### Environment Setup

1. **Create the environment file:**

```bash
cp .env.example .env
```

2. **Configure `.env` variables:**

```bash
# General
PORT=5000
NODE_ENV=development

# Neon PostgreSQL — connection string from your Neon dashboard
DB_URL=your_postgres_connection_string

# BCRYPT
BCRYPT_SALT_ROUND=10

# JWT
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Seed staff
STAFF_EMAIL=admin@example.com
STAFF_PASSWORD=Admin@123

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Install Dependencies

```bash
npm install
```

### Set Up the Database

Run the migrations and seeds to build the schema and load demo data:

```bash
npm run db:setup
```

This creates the `staff`, `vehicles` and `rentals` tables, seeds the staff account from `.env`, and inserts two vehicles plus three rentals — including one that **spans a month boundary** (July 29 – Aug 3) so the monthly report is testable.

---

## ▶️ Running the Project

### Development Mode

Start the development server with hot-reload using `tsx`:

```bash
npm run dev
```

The server connects to PostgreSQL and starts on `http://localhost:5000`. Changes to TypeScript files automatically restart the server.

### Type Check / Build

Verify the TypeScript compiles:

```bash
npm run build
```

> `build` runs `tsc --noEmit` (the project is executed directly from source via `tsx`).

### Production Mode

```bash
npm run start:prod
```

This type-checks the project and then starts the server. Ensure `.env` is configured with production values before deployment.

### Linting & Formatting

```bash
npm run lint        # Run ESLint
npm run format      # Format with Prettier
```

### Database Scripts

```bash
npm run db:migrate            # Run all migrations
npm run db:migrate:rollback   # Roll back the last migration
npm run db:migrate:make       # Create a new migration file
npm run db:seed               # Run all seeds
npm run db:setup              # Migrate + seed
```

---

## 📂 Project Structure

```text
vehicle-rental-management-server/
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server startup entry point
│   ├── config/
│   │   ├── cloudinary.ts           # Cloudinary configuration & image deletion
│   │   ├── env.ts                  # Environment variable validation and loading
│   │   ├── knex.ts                 # Knex connection pool (pg) and config builder
│   │   └── multer.ts               # Multer + CloudinaryStorage upload config
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 20260820000000_create_tables.ts  # staff, vehicles, rentals schema
│   │   └── seeds/
│   │       ├── 01_staff.ts         # Seed staff account from .env
│   │       ├── 02_vehicles.ts      # Seed two vehicles
│   │       └── 03_rentals.ts       # Seed rentals incl. month-boundary booking
│   ├── errorHelper/
│   │   └── AppError.ts             # Custom error class
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication guard (checkAuth)
│   │   ├── globalErrorHandler.middleware.ts # Centralized error handling
│   │   ├── notFound.middleware.ts  # 404 handler
│   │   └── validate.middleware.ts  # Joi request/query validation
│   ├── modules/
│   │   ├── auth/                   # Staff login and token issuance
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.type.ts
│   │   │   └── auth.validation.ts
│   │   ├── rental/                 # Rental CRUD with availability checks
│   │   │   ├── rental.controller.ts
│   │   │   ├── rental.route.ts
│   │   │   ├── rental.service.ts
│   │   │   ├── rental.type.ts
│   │   │   └── rental.validation.ts
│   │   ├── report/                 # Monthly rental report
│   │   │   ├── report.controller.ts
│   │   │   ├── report.route.ts
│   │   │   ├── report.service.ts
│   │   │   ├── report.type.ts
│   │   │   └── report.validation.ts
│   │   └── vehicle/                # Vehicle CRUD with soft delete & photo upload
│   │       ├── vehicle.controller.ts
│   │       ├── vehicle.route.ts
│   │       ├── vehicle.service.ts
│   │       ├── vehicle.type.ts
│   │       └── vehicle.validation.ts
│   ├── routes/
│   │   └── index.ts                # Route aggregation and mounting
│   ├── types/
│   │   └── express.d.ts            # Express Request type extension (req.user)
│   └── utils/
│       ├── catchAsync.ts           # Async error wrapper
│       ├── jwt.ts                  # JWT token generation and verification
│       ├── password.ts             # Password hashing and verification
│       ├── queryBuilder.ts         # Reusable filter/search/paginate query builder
│       ├── sendResponse.ts         # Standardized response formatter
│       ├── setCookie.ts            # Cookie setter utility
│       └── tokens.ts               # Access/refresh token creation
├── knexfile.ts                     # Knex config for CLI (migrate/seed)
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── eslint.config.mjs               # ESLint configuration
├── package.json                    # Project dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

---

## 🧪 Testing with Postman

1. **Log in** to get your session cookies:

   ```
   POST http://localhost:5000/api/v1/auth/login
   Content-Type: application/json

   {
     "email": "admin@example.com",
     "password": "Admin@123"
   }
   ```

   The response sets the `accessToken` and `refreshToken` cookies, which Postman stores and sends automatically on subsequent requests.

2. **Exercise the protected routes** (e.g. `GET /api/v1/vehicles`, `POST /api/v1/rentals`). The cookie-based session is handled automatically.

3. **Vehicle photo uploads** use `multipart/form-data` with a `data` field (JSON string of the vehicle fields) and a `file` field for the image.

4. **Test the monthly report**:

   ```
   GET http://localhost:5000/api/v1/reports/rentals?month=2026-08
   ```

   The seeded rental spanning July 29 – Aug 3 contributes **3 days** (Aug 1 – Aug 3) to the August report.