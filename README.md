# Xeno Shopify Data Ingestion & Insights Service

A multi-tenant Shopify data analytics platform that ingests store data and provides actionable insights through a modern dashboard.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Vercel)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Login     │  │  Dashboard  │  │   Metrics   │  │  Settings  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                              │                                      │
│                    React + Vite + TailwindCSS                       │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ REST API
┌──────────────────────────────┼──────────────────────────────────────┐
│                         BACKEND (Render)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │    Auth     │  │   Tenants   │  │  Analytics  │  │  Shopify   │ │
│  │   Module    │  │   Module    │  │   Module    │  │   Module   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                              │                                      │
│              Express.js + Prisma ORM + JWT Auth                     │
│                              │                                      │
│  ┌───────────────────────────┴───────────────────────────────────┐ │
│  │                    CRON Scheduler (10 min)                     │ │
│  │              Auto-sync all tenant Shopify data                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                      SUPABASE POSTGRESQL                            │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Tenant  │ │ Customer │ │ Order  │ │ Product  │ │    Event     │ │
│  │         │ │          │ │        │ │          │ │   (Bonus)    │ │
│  └─────────┘ └──────────┘ └────────┘ └──────────┘ └──────────────┘ │
│                    Multi-tenant isolation via tenant_id             │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SHOPIFY ADMIN API                              │
│         Customers • Orders • Products • Webhooks                    │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
/project-root
├── /backend
│   ├── /src
│   │   ├── app.js                    # Express app setup
│   │   ├── server.js                 # Server entry point
│   │   ├── /config
│   │   │   ├── env.js                # Environment variables
│   │   │   ├── supabase.js           # Supabase client
│   │   │   └── shopify.js            # Shopify API client
│   │   ├── /middleware
│   │   │   └── auth.js               # JWT authentication
│   │   ├── /modules
│   │   │   ├── /auth                 # Authentication module
│   │   │   ├── /tenants              # Tenant management
│   │   │   ├── /shopify              # Shopify integration
│   │   │   ├── /ingestion            # Data ingestion
│   │   │   └── /analytics            # Analytics & reporting
│   │   ├── /scheduler
│   │   │   └── cron.js               # Scheduled sync jobs
│   │   └── /utils
│   │       ├── error.js              # Error handling
│   │       └── response.js           # Response helpers
│   ├── /prisma
│   │   └── schema.prisma             # Database schema
│   └── package.json
├── /frontend
│   ├── /src
│   │   ├── /components               # Reusable components
│   │   ├── /pages                    # Page components
│   │   ├── /services
│   │   │   └── api.js                # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

```
┌──────────────────┐       ┌──────────────────┐
│      Tenant      │       │     Customer     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)          │
│ name             │  │    │ shopifyId        │
│ email (unique)   │  │    │ email            │
│ password         │  │    │ firstName        │
│ shopifyDomain    │  ├───▶│ lastName         │
│ shopifyToken     │  │    │ totalSpent       │
│ createdAt        │  │    │ ordersCount      │
│ updatedAt        │  │    │ tenantId (FK)    │
└──────────────────┘  │    └──────────────────┘
                      │
                      │    ┌──────────────────┐
                      │    │      Order       │
                      │    ├──────────────────┤
                      │    │ id (PK)          │
                      │    │ shopifyId        │
                      │    │ orderNumber      │
                      ├───▶│ totalPrice       │
                      │    │ financialStatus  │
                      │    │ orderDate        │
                      │    │ tenantId (FK)    │
                      │    └──────────────────┘
                      │
                      │    ┌──────────────────┐
                      │    │     Product      │
                      │    ├──────────────────┤
                      │    │ id (PK)          │
                      ├───▶│ shopifyId        │
                      │    │ title            │
                      │    │ price            │
                      │    │ tenantId (FK)    │
                      │    └──────────────────┘
                      │
                      │    ┌──────────────────┐
                      │    │      Event       │
                      │    ├──────────────────┤
                      └───▶│ id (PK)          │
                           │ eventType        │
                           │ payload (JSON)   │
                           │ tenantId (FK)    │
                           └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Shopify store with Admin API access

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env)**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
JWT_SECRET="your-secret-key-min-32-chars"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
```

### 3. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📡 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new tenant |
| POST | `/auth/login` | Login & get JWT token |

**Signup Request:**
```json
{
  "name": "Store Name",
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Tenant Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/tenants/register` | ✅ | Connect Shopify store |
| GET | `/tenants/me` | ✅ | Get current tenant |
| PUT | `/tenants/update` | ✅ | Update tenant info |

**Register Shopify Request:**
```json
{
  "shopifyDomain": "your-store.myshopify.com",
  "shopifyToken": "shpat_xxxxx"
}
```

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/summary` | ✅ | Dashboard summary stats |
| GET | `/analytics/orders?start=&end=` | ✅ | Orders with date filter |
| GET | `/analytics/top-customers?limit=5` | ✅ | Top customers by spend |
| GET | `/analytics/revenue-by-month` | ✅ | Monthly revenue data |

### Shopify Integration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/shopify/sync` | ✅ | Manual data sync |
| POST | `/shopify/ingest/:tenant_id` | ✅ | Ingest specific tenant |
| POST | `/shopify/webhook` | ❌ | Shopify webhook receiver |

## 🔐 Getting Shopify API Credentials

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" → "Create an app"
3. Configure Admin API scopes:
   - `read_customers`
   - `read_orders`
   - `read_products`
4. Install the app and copy the Admin API access token

## 🌐 Deployment

### Backend on Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Configure:
   - **Build Command:** `cd backend && npm install && npx prisma generate`
   - **Start Command:** `cd backend && npm start`
4. Add environment variables from `.env.example`

### Frontend on Vercel

1. Import project on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL

### Prisma Migrations (Production)

```bash
# Generate migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

## ⚙️ Features

- ✅ Multi-tenant architecture with tenant_id isolation
- ✅ JWT-based authentication
- ✅ Shopify Admin API integration
- ✅ Automatic data sync every 10 minutes
- ✅ Webhook support for real-time updates
- ✅ Dashboard with key metrics
- ✅ Revenue & order trend charts
- ✅ Top customers ranking
- ✅ Date range filtering
- ✅ Event logging (bonus)
- ✅ Professional UI with TailwindCSS

## ⚠️ Known Limitations

1. **Rate Limiting:** Shopify API has rate limits (40 requests/second). Large stores may need pagination.
2. **Webhook Verification:** Production should verify Shopify webhook signatures.
3. **Token Storage:** Shopify tokens stored in DB should be encrypted in production.
4. **Pagination:** Current implementation fetches max 250 records per entity.

## 🔮 Production Improvements

1. Add Redis for caching and rate limiting
2. Implement Shopify webhook signature verification
3. Add database connection pooling
4. Encrypt sensitive data (tokens)
5. Add comprehensive logging (Winston/Pino)
6. Implement proper pagination for large datasets
7. Add unit and integration tests
8. Set up CI/CD pipeline
9. Add monitoring (Sentry, DataDog)
10. Implement refresh tokens for better security

## 📄 License

MIT
