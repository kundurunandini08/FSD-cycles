
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE = path.join(__dirname, "data", "products.json");

// Read products
const readProducts = () => {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
};

// Write products
const writeProducts = (products) => {
  fs.writeFileSync(FILE, JSON.stringify(products, null, 2), "utf-8");
};

// Home route
app.get("/", (req, res) => {
  res.send("Products server running");
});

// Create product
app.post("/products", (req, res) => {
  const products = readProducts();

  const newProduct = {
    id: products.length === 0 ? 1 : products[products.length - 1].id + 1,
    ...req.body,
  };

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json({
    message: "Product added successfully",
    data: newProduct,
  });
});

// Get all products
app.get("/products", (req, res) => {
  let products = readProducts();
  const category = req.query.category;

  if (category) {
    products = products.filter((prod) => prod.category === category);
  }

  res.status(200).json({
    message: "All Products fetched successfully",
    data: products,
  });
});

// Get product by ID
app.get("/products/:id", (req, res) => {
  const products = readProducts();

  const product = products.find(
    (prod) => prod.id === Number(req.params.id)
  );

  if (product) {
    res.status(200).json({
      message: "Product details fetched successfully",
      data: product,
    });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Update product
app.put("/products/:id", (req, res) => {
  const products = readProducts();

  const index = products.findIndex(
    (prod) => prod.id === Number(req.params.id)
  );

  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    writeProducts(products);

    res.status(200).json({
      message: "Product updated successfully",
      data: products[index],
    });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Delete product
app.delete("/products/:id", (req, res) => {
  const products = readProducts();

  const index = products.findIndex(
    (prod) => prod.id === Number(req.params.id)
  );

  if (index !== -1) {
    const product = products.splice(index, 1)[0];
    writeProducts(products);

    res.status(200).json({
      message: "Product deleted successfully",
      data: product,
    });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// 404 route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
