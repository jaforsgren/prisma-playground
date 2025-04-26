# **Prisma + PostgreSQL CRUD Backend Specification**

**Purpose**: A learning-focused backend to explore **Prisma ORM**, **PostgreSQL relationships**, and **migrations**.

---

## **1. System Overview**

### **Core Features**

- CRUD operations for `Product`, `Review`, and `Order` entities.
- Explicit many-to-many relationships with a custom join table (`OrderProduct`).
- Cascading deletes for data integrity.
- Decimal pricing (avoiding floating-point errors).

### **Tech Stack**

- **Backend**: Node.js + Express (or FastAPI/NestJS if preferred).
- **ORM**: Prisma.
- **Database**: PostgreSQL.
- **Testing**: Jest + Supertest.

---

## **2. Database Schema** :

### **Prisma Schema (`schema.prisma`)**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id          Int             @id @default(autoincrement())
  name        String
  price       Decimal         @db.Decimal(10, 2)
  description String?
  sku         String?         @unique
  stockQuantity Int          @default(0)
  createdAt   DateTime        @default(now())
  reviews     Review[]        @relation(onDelete: Cascade)
  orders      OrderProduct[]  @relation(onDelete: Cascade)
}

model Review {
  id        Int      @id @default(autoincrement())
  rating    Int      @range(1, 5)
  comment   String?
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId Int
  createdAt DateTime @default(now())
}

model Order {
  id          Int             @id @default(autoincrement())
  products    OrderProduct[]  @relation(onDelete: Cascade)
  totalPrice  Decimal         @db.Decimal(10, 2)
  createdAt   DateTime        @default(now())
}

model OrderProduct {
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId   Int
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     Int
  quantity    Int       @default(1)
  unitPrice   Decimal   @db.Decimal(10, 2)

  @@id([productId, orderId])
}
```

---

## **3. Key Architecture Decisions**

### **Data Integrity**

- **Cascading Deletes**:
  - Deleting a `Product` also deletes its `Review`s and `OrderProduct` entries.
  - Deleting an `Order` also deletes its `OrderProduct` entries.
- **Decimal Pricing**: `Decimal(10, 2)` for accurate financial calculations.
- **Unique SKU**: Optional but enforced if provided.

### **Migrations**

- Auto-generated for initial setup (`prisma migrate dev`).
- Custom migrations for future changes (e.g., adding indexes, renaming columns).

---

## **4. API Endpoints**

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| POST   | `/products`             | Create a product.                    |
| GET    | `/products`             | List all products.                   |
| GET    | `/products/:id`         | Get a product by ID.                 |
| PUT    | `/products/:id`         | Update a product.                    |
| DELETE | `/products/:id`         | Delete a product (cascades reviews). |
| POST   | `/products/:id/reviews` | Add a review to a product.           |
| POST   | `/orders`               | Create an order with products.       |
| GET    | `/orders/:id`           | Get order details + products.        |

---

## **5. Error Handling**

- **Validation Errors**: Return `400 Bad Request` for invalid data (e.g., negative price).
- **Not Found**: Return `404` if a resource doesn’t exist.
- **Database Errors**: Handle Prisma errors (e.g., unique constraint violations) with `500 Internal Server Error` + logs.

**Example Middleware (Express):**

```ts
app.use((err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "SKU already exists" });
    }
  }
  res.status(500).json({ error: "Internal server error" });
});
```

---

## **6. Testing Plan**

### **Unit Tests**

- Test CRUD operations for each model.
- Verify cascading deletes.

### **Integration Tests**

- Test order creation with multiple products.
- Verify `totalPrice` calculation.

### **Sample Test Cases**

1. **Create Product**:
   - Assert `stockQuantity` defaults to `0`.
   - Assert `price` accepts 2 decimal places.
2. **Delete Product**:
   - Assert all linked `Review`s and `OrderProduct` entries are deleted.
3. **Create Order**:
   - Assert `totalPrice` matches sum of `unitPrice * quantity`.

---

## **7. Setup Instructions**

1. **Initialize PostgreSQL**:
   ```bash
   docker run --name pg-prisma -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres
   ```
2. **Set Up Prisma**:
   ```bash
   npm install prisma @prisma/client
   npx prisma migrate dev --name init
   ```
3. **Seed Data**:
   ```ts
   npx prisma db seed
   ```

---

## **8. Future Extensions**

- **Transactions**: Ensure `totalPrice` updates atomically.
- **Indexes**: Add indexes for `Product.sku` and `Review.rating`.
- **Soft Deletes**: Use `deletedAt` instead of cascading deletes.

---

**Handoff Ready**: This spec covers schema, API design, error handling, and testing. A developer can now implement this system end-to-end.

Let me know if you'd like to adjust any details! 🚀
