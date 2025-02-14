import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealSchema, insertBookingSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const user = await storage.createUser(result.data);
    res.json(user);
  });

  // Deals
  app.post("/api/deals", async (req, res) => {
    const result = insertDealSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const deal = await storage.createDeal(result.data);
    res.json(deal);
  });

  app.get("/api/deals/:id", async (req, res) => {
    const deal = await storage.getDeal(parseInt(req.params.id));
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    res.json(deal);
  });

  app.get("/api/deals", async (req, res) => {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: "Missing location parameters" });
    }
    const deals = await storage.getDealsInArea(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseFloat(radius as string)
    );
    res.json(deals);
  });

  app.get("/api/business/:id/deals", async (req, res) => {
    const deals = await storage.getDealsByBusiness(parseInt(req.params.id));
    res.json(deals);
  });

  // Bookings
  app.post("/api/bookings", async (req, res) => {
    const result = insertBookingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const booking = await storage.createBooking(result.data);
    
    // Update deal customers count
    const deal = await storage.getDeal(booking.dealId);
    if (deal) {
      await storage.updateDealCustomers(deal.id, deal.currentCustomers + 1);
    }
    
    res.json(booking);
  });

  app.get("/api/deals/:id/bookings", async (req, res) => {
    const bookings = await storage.getBookingsByDeal(parseInt(req.params.id));
    res.json(bookings);
  });

  app.get("/api/users/:id/bookings", async (req, res) => {
    const bookings = await storage.getBookingsByUser(parseInt(req.params.id));
    res.json(bookings);
  });

  const httpServer = createServer(app);
  return httpServer;
}
