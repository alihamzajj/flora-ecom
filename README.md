# LUMÉA Skincare — Enterprise Luxury E-commerce

A production-ready luxury cosmetics and skincare e-commerce website built on **React, TypeScript, Vite, TanStack Router (TanStack Start), Express, and MongoDB**.

---

## Technical Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Router (Start), TanStack Query, Radix & shadcn/ui.
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB).
- **Services**: Stripe (Payments), Cloudinary (Image Uploads), Nodemailer (Invoices & verification emails).
- **Security**: Helmet, CORS, Express-Rate-Limit, Mongo Sanitization.

---

## Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v20+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Make sure MongoDB service is running locally on port `27017` or use MongoDB Atlas)

### 2. Install Dependencies
Run in the root directory to install both client and backend dependencies:
```bash
# Install root (client) packages
npm install

# Install server packages
npm install --prefix server
```

### 3. Environment Variables
Create a `.env` file inside the `server/` directory:
```bash
# Clone the example config
cp server/.env.example server/.env
```
Ensure you set your variables (MongoDB, Stripe, Cloudinary). If you do not have Stripe or Cloudinary keys, the backend automatically runs in **Mock Sandbox Mode**, which allows you to complete orders and mock image uploads without credentials!

### 4. Seed the Database
Ensure your MongoDB is running, then run:
```bash
npm run seed
```
This will pre-seed your database with all luxury skincare products, sizes, pricing, ingredients, and benefits matching the original design.

---

## Running the Application

To run both the **Vite Client** and **Express Backend** concurrently with a single command, execute in the root:
```bash
npm run dev
```

Once running:
- **Frontend Client**: [http://localhost:3000](http://localhost:3000) (or [http://localhost:5173](http://localhost:5173))
- **Express Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## Running via Docker (Optional)

If you have Docker and Docker Compose installed, you can spin up the MongoDB database, Express API server, and Vite client in isolated containers with:

```bash
docker-compose up --build
```
This will automatically launch:
- MongoDB at `localhost:27017`
- Backend API at `localhost:5000`
- Frontend Client at `localhost:3000`
