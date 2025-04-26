import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Health check
app.get('/', (req: any, res: any) => {
  res.json({ status: 'OK' });
});

// Keep-alive
const keepAlive = () => setInterval(() => console.log('Server alive'), 5000);

// --- PRODUCT ENDPOINTS --- //

// 1. Create Product
app.post('/products', async (req: any, res: any) => {
  const { name, price, description, sku, stockQuantity } = req.body;
  
  // Validate required fields
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  try {
    const product = await prisma.product.create({
      data: { 
        name,
        price,
        description,
        sku,
        stockQuantity: stockQuantity || 0, // Default to 0 if not provided
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// 2. List All Products
app.get('/products', async (req: any, res: any) => {
  try {
    const products = await prisma.product.findMany();
    console.log('-------')
    console.log(products)
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 3. Get Product by ID
app.get('/products/:id', async (req: any, res: any) => {
  const { id } = req.params;
  
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// 4. Update Product
app.put('/products/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const { name, price, description, sku, stockQuantity } = req.body;
  
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        price,
        description,
        sku,
        stockQuantity,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 5. Delete Product
app.delete('/products/:id', async (req: any, res: any) => {
  const { id } = req.params;
  
  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Start server
const PORT = 3333;
const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to PostgreSQL');
    keepAlive();
  } catch (error) {
    console.error('❌ Prisma connection error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
