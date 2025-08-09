import {
  users,
  wallets,
  transactions,
  vendors,
  exchangeRates,
  type User,
  type InsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type Vendor,
  type InsertVendor,
  type ExchangeRate,
  type InsertExchangeRate,
} from "@shared/schema";
import bcrypt from 'bcrypt'
import pg from "pg";
const { Pool } = pg;
import { eq, and, lt, gt, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import dotenv from "dotenv";

import connectPg from "connect-pg-simple";
dotenv.config();
// Create memory store for sessions

// 1. Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "sunny",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fairpaydb",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// 2. Create Pool and Drizzle Instance
export const pool = new Pool(dbConfig);
export const db = drizzle(pool, { schema });

//temp
async function updatePassword(email: string, newPlainPassword: string) {
  const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "sunny",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fairpaydb",
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  const hashed = await bcrypt.hash(newPlainPassword, 10);
  await pool.query(
    "UPDATE users SET password = $1 WHERE email = $2",
    [hashed, email]
  );

  console.log(`✅ Password updated for ${email}`);
  await pool.end();
}

//updatePassword("user@fairpay.la", "user123").catch(console.error);
//temp---

// 4. Session Store Configuration
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
  pruneSessionInterval: 60,
});
// Create session stores
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeCustomerId(userId: string, customerId: string): Promise<User>;

  // Wallet methods
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWalletByUserAndCurrency(
    userId: string,
    currency: string
  ): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(walletId: string, balance: string): Promise<Wallet>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction>;

  // Vendor methods
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getAllVendors(): Promise<Vendor[]>;
  approveVendor(vendorId: string, adminId: string): Promise<Vendor>;
  rejectVendor(
    vendorId: string,
    reason: string,
    adminId: string
  ): Promise<Vendor>;

  // Exchange rate methods
  getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRate | undefined>;
  updateExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;
  getAllExchangeRates(): Promise<ExchangeRate[]>;

  // Admin methods
  getAdminStats(): Promise<any>;

  //New method to get transactions by vendor ID
  getTransactionsByVendorId(vendorId: string): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = sessionStore;
    this.testConnection().catch((err) => {
     
      console.error("❌ Database connection failed:", err);
      process.exit(1);
    });
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  private async testConnection() {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStripeCustomerId(
    userId: string,
    customerId: string
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async getWalletByUserAndCurrency(
    userId: string,
    currency: string
  ): Promise<Wallet | undefined> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)));
    return wallet || undefined;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(insertWallet).returning();
    return wallet;
  }

  async updateWalletBalance(
    walletId: string,
    balance: string
  ): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance })
      .where(eq(wallets.id, walletId))
      .returning();
    return wallet;
  }

  async updateUserRole(userId: string, role: string) {
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user[0] || undefined;
  }

  async createTransaction(
    insertTransaction: InsertTransaction
  ): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getUserTransactions(
    userId: string,
    limit = 10
  ): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async updateTransactionStatus(
    id: string,
    status: string
  ): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }

  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRate | undefined> {
    const [rate] = await db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, fromCurrency),
          eq(exchangeRates.toCurrency, toCurrency)
        )
      );
    return rate || undefined;
  }

  async updateExchangeRate(
    insertRate: InsertExchangeRate
  ): Promise<ExchangeRate> {
    const existingRate = await this.getExchangeRate(
      insertRate.fromCurrency,
      insertRate.toCurrency
    );

    if (existingRate) {
      const [rate] = await db
        .update(exchangeRates)
        .set({ rate: insertRate.rate, updatedAt: new Date() })
        .where(
          and(
            eq(exchangeRates.fromCurrency, insertRate.fromCurrency),
            eq(exchangeRates.toCurrency, insertRate.toCurrency)
          )
        )
        .returning();
      return rate;
    } else {
      const [rate] = await db
        .insert(exchangeRates)
        .values(insertRate)
        .returning();
      return rate;
    }
  }

  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    return await db.select().from(exchangeRates);
  }

  async getAllVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async approveVendor(vendorId: string, adminId: string): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({
        status: "approved",
        isVerified: true,
        approvedBy: adminId,
        approvedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))
      .returning();
    return vendor;
  }

  async rejectVendor(
    vendorId: string,
    reason: string,
    adminId: string
  ): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({
        status: "rejected",
        rejectionReason: reason,
        approvedBy: adminId,
        approvedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))
      .returning();
    return vendor;
  }

  async getVendor(vendorId: string): Promise<Vendor | undefined> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));
    return vendor || undefined;
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await db.select().from(users);
    const totalVendors = await db.select().from(vendors);
    const pendingVendors = await db
      .select()
      .from(vendors)
      .where(eq(vendors.status, "pending"));
    const totalTransactions = await db.select().from(transactions);

    return {
      totalUsers: totalUsers.length,
      totalVendors: totalVendors.length,
      pendingVendors: pendingVendors.length,
      totalTransactions: totalTransactions.length,
    };
  }

  async getTransactionsByVendorId(vendorId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.vendorId, vendorId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }
}

export const storage = new DatabaseStorage();
