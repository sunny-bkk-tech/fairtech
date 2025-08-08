/**
 * The `registerRoutes` function in this TypeScript code sets up various API routes for user
 * authentication, wallet management, currency exchange, payment processing, vendor registration, and
 * admin actions.
 * @param {Express} app - The `app` parameter in the `registerRoutes` function is an instance of
 * Express, which is used to define and configure routes, middleware, and handle HTTP requests in the
 * Node.js application. It is the main application object that represents the Express application.
 * @returns The `registerRoutes` function returns an HTTP server created using Express with all the
 * defined routes and middleware for authentication, user registration, login, wallet management,
 * currency exchange, payment processing, vendor operations, and admin functionalities.
 */
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertVendorSchema, insertTransactionSchema } from "@shared/schema";
`import dotenv from 'dotenv'

dotenv.config();`
import { formatCurrency } from "@/lib/currency";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

const JWT_SECRET = process.env.JWT_SECRET || "fairpay-secret-key";


// Middleware to verify JWT token
const authenticateToken = (req: Request & { user?: any }, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No token provided');
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: "Invalid token" });
    }

    // Ensure user object has required fields
    if (!user.userId || !user.email) {
      console.log('Invalid user data in token:', user);
      return res.status(403).json({ message: "Invalid user data in token" });
    }

    console.log(`Authenticated user: ${user.userId} (${user.email})`); // Debug log
    req.user = user;
    next();
  });
};

// Middleware to verify admin role
const requireAdmin = async (req: Request & { user?: any }, res: Response, next: any) => {
  if (!req.user) return res.sendStatus(401);

  const user = await storage.getUser(req.user.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Validate nationality requirements for vendors
      if (userData.role === "vendor" && userData.nationality !== "LA") {
        return res.status(400).json({ message: "Vendor accounts are only available for Laos nationals" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create default wallets for all supported currencies
      const currencies = ['USD', 'THB', 'EUR', 'LAK'];
      for (const currency of currencies) {
        await storage.createWallet({
          userId: user.id,
          currency,
          balance: "0",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          nationality: user.nationality,
          phoneNumber: user.phoneNumber,
          passportNumber: user.passportNumber,
          role: user.role,
          isVerified: user.isVerified
        }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log('Login request body:', req.body);  // <-- DEBUG LOG

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        nationality: user.nationality,
        phoneNumber: user.phoneNumber,
        passportNumber: user.passportNumber,
        role: user.role,
        isVerified: user.isVerified
      }, 
      token 
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(400).json({ message: error.message || "Unknown error" });
  }
});

  // app.post("/api/auth/login", async (req, res) => {
  //   try {
  //     const { email, password } = req.body;

  //     const user = await storage.getUserByEmail(email);
  //     if (!user) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     const isValidPassword = await bcrypt.compare(password, user.password);
  //     if (!isValidPassword) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

  //     res.json({ 
  //       user: { 
  //         id: user.id, 
  //         username: user.username, 
  //         email: user.email,
  //         nationality: user.nationality,
  //         phoneNumber: user.phoneNumber,
  //         passportNumber: user.passportNumber,
  //         role: user.role,
  //         isVerified: user.isVerified
  //       }, 
  //       token 
  //     });
  //   } catch (error: any) {
  //     res.status(400).json({ message: error.message });
  //   }
  // });

  // Wallet routes
  app.get("/api/wallets", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      // Add extra validation to ensure user ID is properly set
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      console.log(`Getting wallets for user: ${req.user.userId}`); // Debug log
      const wallets = await storage.getUserWallets(req.user.userId);

      // Ensure wallets belong to the authenticated user
      const validatedWallets = wallets.filter(wallet => wallet.userId === req.user.userId);

      res.json(validatedWallets);
    } catch (error: any) {
      console.error(`Error getting wallets for user ${req.user?.userId}:`, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Exchange rates - Initialize with real-time data simulation
  app.get("/api/exchange-rates", async (req, res) => {
    try {
      let rates = await storage.getAllExchangeRates();

      // If no rates exist, initialize with current market rates
      if (rates.length === 0) {
        const defaultRates = [
          { fromCurrency: 'USD', toCurrency: 'LAK', rate: '20850.00' },
          { fromCurrency: 'THB', toCurrency: 'LAK', rate: '625.00' },
          { fromCurrency: 'EUR', toCurrency: 'LAK', rate: '22750.00' },
          { fromCurrency: 'USD', toCurrency: 'THB', rate: '33.50' },
          { fromCurrency: 'EUR', toCurrency: 'USD', rate: '1.09' },
          { fromCurrency: 'LAK', toCurrency: 'USD', rate: '0.000048' },
          { fromCurrency: 'LAK', toCurrency: 'THB', rate: '0.0016' },
          { fromCurrency: 'LAK', toCurrency: 'EUR', rate: '0.000044' },
        ];

        for (const rate of defaultRates) {
          await storage.updateExchangeRate(rate);
        }

        rates = await storage.getAllExchangeRates();
      }

      res.json(rates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Currency exchange
  app.post("/api/exchange", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      const { fromCurrency, toCurrency, amount } = req.body;

      if (!fromCurrency || !toCurrency || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid exchange parameters" });
      }

      // Get exchange rate
      const exchangeRate = await storage.getExchangeRate(fromCurrency, toCurrency);
      if (!exchangeRate) {
        return res.status(400).json({ message: "Exchange rate not available" });
      }

      let fromWallet = await storage.getWalletByUserAndCurrency(req.user.userId, fromCurrency);
      let toWallet = await storage.getWalletByUserAndCurrency(req.user.userId, toCurrency);

      // Create wallets if they don't exist
      if (!fromWallet) {
        fromWallet = await storage.createWallet({
          userId: req.user.userId,
          currency: fromCurrency,
          balance: "0",
        });
      }

      if (!toWallet) {
        toWallet = await storage.createWallet({
          userId: req.user.userId,
          currency: toCurrency,
          balance: "0",
        });
      }

      const amountNum = parseFloat(amount.toString());
      const rateNum = parseFloat(exchangeRate.rate);
      const convertedAmount = amountNum * rateNum;
      const fee = amountNum * 0.005; // 0.5% fee

      // Check sufficient balance
      if (parseFloat(fromWallet.balance || "0") < amountNum + fee) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Update balances
      const newFromBalance = (parseFloat(fromWallet.balance || "0") - amountNum - fee).toString();
      const newToBalance = (parseFloat(toWallet.balance || "0") + convertedAmount).toString();

      await storage.updateWalletBalance(fromWallet.id, newFromBalance);
      await storage.updateWalletBalance(toWallet.id, newToBalance);

      // Create transaction record
      await storage.createTransaction({
        userId: req.user.userId,
        fromCurrency,
        toCurrency,
        amount: amountNum.toString(),
        convertedAmount: convertedAmount.toString(),
        exchangeRate: exchangeRate.rate,
        fee: fee.toString(),
        type: 'exchange',
        status: 'completed',
        description: `Exchange ${fromCurrency} to ${toCurrency}`,
      });

      res.json({ success: true, convertedAmount, fee });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment intent for top-ups
  // app.post("/api/create-payment-intent", authenticateToken, async (req: Request & { user?: any }, res) => {
  //   try {
  //     const { amount, currency } = req.body;

  //     if (!amount || amount <= 0) {
  //       return res.status(400).json({ message: "Invalid amount" });
  //     }

  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: Math.round(amount * 100), // Convert to cents
  //       currency: currency.toLowerCase(),
  //       metadata: {
  //         userId: req.user.userId,
  //         type: 'topup',
  //         targetCurrency: currency,
  //       },
  //       payment_method_types: ['card'],
  //     });

  //     res.json({ clientSecret: paymentIntent.client_secret });
  //   } catch (error: any) {
  //     res.status(500).json({ message: "Error creating payment intent: " + error.message });
  //   }
  // });
app.post("/api/create-payment-intent", authenticateToken, async (req: Request & { user?: any }, res) => {
  try {
    console.log("Payment intent request body:", req.body);
    
    const { amount, currency } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const supportedCurrencies = ['usd', 'thb', 'lak', 'eur'];
    if (!currency || !supportedCurrencies.includes(currency.toLowerCase())) {
      return res.status(400).json({ 
        message: `Unsupported currency. Supported: ${supportedCurrencies.join(', ')}`
      });
    }

    // Convert amount to smallest currency unit
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    // Validate minimum amount (50 cents equivalent)
    if (amountInCents < 50) {
      return res.status(400).json({ 
        message: `Minimum amount is ${formatCurrency(0.50, currency)}`
      });
    }

    console.log(`Creating payment intent for user ${userId}: ${amount} ${currency}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: { userId, type: 'topup', targetCurrency: currency },
      payment_method_types: ['card'],
    });

    console.log("Payment intent created:", paymentIntent.id);

    res.json({ 
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error: any) {
    console.error("Payment intent creation failed:", error);
    res.status(500).json({ 
      success: false,
      message: "Payment processing error",
      error: error.message 
    });
  }
});

  // Confirm payment and update wallet (called after successful payment)
  app.post("/api/confirm-payment", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      const { paymentIntentId, amount, currency } = req.body;

      if (!paymentIntentId || !amount || !currency) {
        return res.status(400).json({ message: "Missing payment details" });
      }

      // Verify the payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not successful" });
      }

      const userId = req.user.userId;

      // Double-check that the payment intent metadata matches the authenticated user
      if (paymentIntent.metadata.userId && paymentIntent.metadata.userId !== userId) {
        console.error(`Payment intent user mismatch: expected ${userId}, got ${paymentIntent.metadata.userId}`);
        return res.status(403).json({ message: "Payment intent user mismatch" });
      }

      console.log(`Confirming payment for user: ${userId}, amount: ${amount}, currency: ${currency}`);

      // Find or create wallet
      let wallet = await storage.getWalletByUserAndCurrency(userId, currency);
      if (!wallet) {
        wallet = await storage.createWallet({
          userId,
          currency: currency,
          balance: amount.toString(),
        });
      } else {
        // Update existing wallet balance
        const currentBalance = parseFloat(wallet.balance || "0");
        const newBalance = currentBalance + parseFloat(amount);
        await storage.updateWalletBalance(wallet.id, newBalance.toString());
      }

      // Create transaction record
      await storage.createTransaction({
        userId,
        amount: amount.toString(),
        type: 'topup',
        status: 'completed',
        description: `Top up ${currency} wallet`,
        stripePaymentIntentId: paymentIntentId,
        fromCurrency: currency,
        toCurrency: currency,
      });

      res.json({ success: true, message: "Wallet updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Stripe webhook to handle successful payments
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      const event = req.body;

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, targetCurrency } = paymentIntent.metadata;

        // Update wallet balance
        const wallet = await storage.getWalletByUserAndCurrency(userId, targetCurrency);
        if (wallet) {
          const amount = paymentIntent.amount / 100; // Convert back from cents
          const newBalance = (parseFloat(wallet.balance || "0") + amount).toString();
          await storage.updateWalletBalance(wallet.id, newBalance);

          // Create transaction record
          await storage.createTransaction({
            userId,
            amount: amount.toString(),
            type: 'topup',
            status: 'completed',
            description: `Top up ${targetCurrency} wallet`,
            stripePaymentIntentId: paymentIntent.id,
            fromCurrency: targetCurrency,
            toCurrency: targetCurrency,
          });
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transaction history
  app.get("/api/transactions", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.user.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vendor transactions (payments received by this vendor)
  app.get("/api/transactions/vendor", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      // Get vendor info for this user
      const vendor = await storage.getVendorByUserId(req.user.userId);
      if (!vendor) {
        return res.json([]);
      }

      // Get transactions where this vendor received payments
      const transactions = await storage.getTransactionsByVendorId(vendor.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // QR Payment processing
  app.post("/api/qr-payment", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      const { vendorId, amount, currency, description } = req.body;

      if (!vendorId || !amount || !currency || amount <= 0) {
        return res.status(400).json({ message: "Invalid payment parameters" });
      }

      // Validate that the vendor exists
      const vendor = await storage.getVendor(vendorId);
      if (!vendor) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }

      // Check if vendor is verified
      if (!vendor.isVerified) {
        return res.status(400).json({ message: "Vendor is not verified" });
      }

      // Get or create user's wallet
      let wallet = await storage.getWalletByUserAndCurrency(req.user.userId, currency);
      if (!wallet) {
        wallet = await storage.createWallet({
          userId: req.user.userId,
          currency: currency,
          balance: "0",
        });
      }

      // Check sufficient balance
      const amountNum = parseFloat(amount.toString());
      if (parseFloat(wallet.balance || "0") < amountNum) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Update wallet balance
      const newBalance = (parseFloat(wallet.balance || "0") - amountNum).toString();
      await storage.updateWalletBalance(wallet.id, newBalance);

      // Create transaction
      const transaction = await storage.createTransaction({
        userId: req.user.userId,
        vendorId,
        amount: amountNum.toString(),
        type: 'payment',
        status: 'completed',
        description: description || 'QR Payment',
        fromCurrency: currency,
        toCurrency: currency,
      });

      res.json({ success: true, transaction });
    } catch (error: any) {
      console.error('QR Payment error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Vendor registration
  app.post("/api/vendors", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      const vendorData = insertVendorSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });

      // Check if vendor already exists for this user
      const existingVendor = await storage.getVendorByUserId(req.user.userId);
      if (existingVendor) {
        return res.status(400).json({ message: "Vendor already registered for this user" });
      }

      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get vendor info
  app.get("/api/vendors/me", authenticateToken, async (req: Request & { user?: any }, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.user.userId);
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update exchange rates (admin endpoint - in production this would be protected)
  app.post("/api/admin/update-rates", async (req, res) => {
    try {
      const { rates } = req.body;

      if (!rates || !Array.isArray(rates)) {
        return res.status(400).json({ message: "Invalid rates data" });
      }

      for (const rate of rates) {
        await storage.updateExchangeRate(rate);
      }

      res.json({ success: true, message: "Exchange rates updated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/vendors", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/vendors/:id/approve", authenticateToken, requireAdmin, async (req: Request & { user?: any }, res) => {
    try {
      const { id } = req.params;
      await storage.approveVendor(id, req.user.userId);
      
      // Get vendor details to update user role
      const vendor = await storage.getVendor(id);
      if (vendor) {
        await storage.updateUserRole(vendor.userId, 'vendor');
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/vendors/:id/reject", authenticateToken, requireAdmin, async (req: Request & { user?: any }, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await storage.rejectVendor(id, reason, req.user.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}