# MAISON NOIR — Backend API Foundation (Phase 1)

Luxury Fashion & AI Stylist E-Commerce Backend built with **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, and **TypeScript**.

---

## Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Language**: TypeScript
- **Security**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), HTTP Security Headers (`helmet`), CORS (`cors`), Rate Limiting (`express-rate-limit`)
- **Validation**: Request schema validation (`zod`)

---

## Directory Architecture

```
server/
├── dist/                  # Compiled JavaScript output
├── src/
│   ├── config/
│   │   └── db.ts          # Mongoose connection & pool config
│   ├── controllers/
│   │   └── health.controller.ts # Health check controller
│   ├── middleware/
│   │   ├── auth.ts        # JWT verification & role authorization
│   │   ├── errorHandler.ts # Centralized error handler
│   │   └── notFound.ts    # 404 handler
│   ├── models/
│   │   ├── Address.ts     # User address schema
│   │   ├── AIOutfit.ts    # AI Stylist outfit model
│   │   ├── Cart.ts        # User shopping cart model
│   │   ├── Category.ts    # Product category model
│   │   ├── Notification.ts# User concierge notifications
│   │   ├── Order.ts       # E-commerce order model
│   │   ├── Product.ts     # Product & variants schema
│   │   ├── User.ts        # User authentication & profile schema
│   │   └── Wishlist.ts    # User wishlist model
│   ├── routes/
│   │   ├── health.routes.ts # Health check route
│   │   └── index.ts       # Router aggregator
│   ├── services/
│   │   └── seed.ts        # Database seeder matching frontend catalog
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces & Express augmentation
│   ├── validators/
│   │   └── validate.ts    # Zod validation helpers
│   ├── app.ts             # Express app setup & middleware stack
│   └── server.ts          # Entry point & server boot script
├── .env                   # Local environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript compiler configuration
└── README.md              # Documentation
```

---

## Environment Variables Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/maison_noir
JWT_SECRET=maison_noir_super_secret_jwt_key_2026_luxury_brand
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## Installation & Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure local MongoDB daemon is running, or set `MONGODB_URI` in `.env`.

4. Seed the database with Maison Noir catalog products & categories:
   ```bash
   npm run seed
   ```

5. Start development server with live reload:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

7. Start production build:
   ```bash
   npm start
   ```

---

## Available Endpoints (Phase 1)

### Health Check
- **`GET /api/health`**
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Maison Noir API is running",
      "data": {
        "environment": "development",
        "timestamp": "2026-08-07T10:00:00.000Z",
        "database": "connected"
      }
    }
    ```

---

## Database Models Overview

- **User**: Authentication, bcrypt hashed passwords, roles (`user`, `admin`), addresses array.
- **Product**: Slugs, size/color variant arrays with individual stocks, text indexes for full search.
- **Category**: Slugs, active status, catalog metadata.
- **Cart**: User-scoped cart line items referencing Product ObjectIDs.
- **Wishlist**: Unique compound index `(userId, productId)` preventing duplicate saves.
- **Order**: Checkout records with shipping address, order status, and payment breakdown.
- **AIOutfit**: AI Stylist briefing inputs, recommended product references, AI confidence score.
- **Notification**: Concierge alert records.
