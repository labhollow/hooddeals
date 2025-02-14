import { deals, users, bookings, type User, type InsertUser, type Deal, type InsertDeal, type Booking, type InsertBooking } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Deal operations
  createDeal(deal: InsertDeal): Promise<Deal>;
  getDeal(id: number): Promise<Deal | undefined>;
  getDealsInArea(lat: number, lng: number, radius: number): Promise<Deal[]>;
  getDealsByBusiness(businessId: number): Promise<Deal[]>;
  updateDealCustomers(id: number, count: number): Promise<Deal>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByDeal(dealId: number): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string, stripePaymentId?: string): Promise<Booking>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals)
      .values({
        ...insertDeal,
        currentCustomers: 0,
        status: "active"
      })
      .returning();
    return deal;
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async getDealsInArea(lat: number, lng: number, radius: number): Promise<Deal[]> {
    // Use PostGIS to find deals within radius km of the point
    const point = `POINT(${lng} ${lat})`;
    return await db.select().from(deals).where(
      and(
        eq(deals.status, "active"),
        sql`ST_DWithin(
          ST_GeomFromGeoJSON(${deals.location}), 
          ST_SetSRID(ST_GeomFromText(${point}), 4326), 
          ${radius * 1000}
        )`
      )
    );
  }

  async getDealsByBusiness(businessId: number): Promise<Deal[]> {
    return db.select().from(deals).where(eq(deals.businessId, businessId));
  }

  async updateDealCustomers(id: number, count: number): Promise<Deal> {
    const [deal] = await db
      .update(deals)
      .set({ currentCustomers: count })
      .where(eq(deals.id, id))
      .returning();

    if (!deal) throw new Error("Deal not found");
    return deal;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings)
      .values({
        ...insertBooking,
        status: "pending",
        stripePaymentId: null
      })
      .returning();
    return booking;
  }

  async getBookingsByDeal(dealId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.dealId, dealId));
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async updateBookingStatus(
    id: number,
    status: string,
    stripePaymentId?: string
  ): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        status,
        stripePaymentId: stripePaymentId || null
      })
      .where(eq(bookings.id, id))
      .returning();

    if (!booking) throw new Error("Booking not found");
    return booking;
  }
}

export const storage = new DatabaseStorage();