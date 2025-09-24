import { 
  type User, 
  type InsertUser, 
  type Category, 
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Analytics,
  type InsertAnalytics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderPaymentStatus(id: string, paymentStatus: string, mpesaTransactionId?: string): Promise<Order | undefined>;
  
  // Analytics
  getAnalytics(): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private analytics: Map<string, Analytics>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.analytics = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Categories
    const categories: InsertCategory[] = [
      { name: "Fruits & Vegetables", icon: "fas fa-apple-alt" },
      { name: "Dairy & Eggs", icon: "fas fa-cheese" },
      { name: "Meat & Seafood", icon: "fas fa-drumstick-bite" },
      { name: "Bakery", icon: "fas fa-bread-slice" },
      { name: "Beverages", icon: "fas fa-wine-bottle" },
      { name: "Snacks", icon: "fas fa-cookie-bite" },
    ];
    
    categories.forEach(cat => this.createCategory(cat));
    
    // Products
    const products: InsertProduct[] = [
      {
        name: "Fresh Bananas",
        description: "Fresh organic bananas, perfect for snacking",
        price: "120",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "fruits",
        size: "1 kg",
        inStock: true
      },
      {
        name: "Fresh Milk",
        description: "Pure fresh milk from local dairy farms",
        price: "80",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "dairy",
        size: "1 Liter",
        inStock: true
      },
      {
        name: "Whole Wheat Bread",
        description: "Nutritious whole wheat bread, freshly baked",
        price: "60",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "bakery",
        size: "750g",
        inStock: true
      },
      {
        name: "Fresh Tomatoes",
        description: "Red ripe tomatoes, locally grown",
        price: "100",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "fruits",
        size: "500g",
        inStock: true
      },
      {
        name: "Chicken Breast",
        description: "Fresh chicken breast, high quality protein",
        price: "650",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "meat",
        size: "1 kg",
        inStock: true
      },
      {
        name: "Basmati Rice",
        description: "Premium basmati rice, aromatic and fluffy",
        price: "280",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "pantry",
        size: "2 kg",
        inStock: true
      },
      {
        name: "Orange Juice",
        description: "Fresh squeezed orange juice, vitamin C rich",
        price: "150",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "beverages",
        size: "1 Liter",
        inStock: true
      },
      {
        name: "Potato Chips",
        description: "Crispy potato chips, perfect snack",
        price: "90",
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "snacks",
        size: "200g",
        inStock: true
      },
      {
        name: "Greek Yogurt",
        description: "Creamy Greek yogurt, high in protein",
        price: "220",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "dairy",
        size: "500g",
        inStock: true
      },
      {
        name: "Green Apples",
        description: "Fresh green apples, crisp and sweet",
        price: "200",
        image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "fruits",
        size: "1 kg",
        inStock: true
      }
    ];
    
    products.forEach(prod => this.createProduct(prod));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      description: insertProduct.description || null,
      size: insertProduct.size || null,
      inStock: insertProduct.inStock ?? true,
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      customerEmail: insertOrder.customerEmail || null,
      discount: insertOrder.discount || "0",
      paymentStatus: insertOrder.paymentStatus || "pending",
      orderStatus: insertOrder.orderStatus || "processing",
      mpesaTransactionId: insertOrder.mpesaTransactionId || null,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderPaymentStatus(id: string, paymentStatus: string, mpesaTransactionId?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.paymentStatus = paymentStatus;
      if (mpesaTransactionId) {
        order.mpesaTransactionId = mpesaTransactionId;
      }
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  // Analytics
  async getAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analytics.values());
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = { ...insertAnalytics, id };
    this.analytics.set(id, analytics);
    return analytics;
  }
}

export const storage = new MemStorage();
