import { deals, users, bookings, type User, type InsertUser, type Deal, type InsertDeal, type Booking, type InsertBooking } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deals: Map<number, Deal>;
  private bookings: Map<number, Booking>;
  private currentUserId: number;
  private currentDealId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.deals = new Map();
    this.bookings = new Map();
    this.currentUserId = 1;
    this.currentDealId = 1;
    this.currentBookingId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentDealId++;
    const deal: Deal = {
      ...insertDeal,
      id,
      currentCustomers: 0,
      status: "active",
    };
    this.deals.set(id, deal);
    return deal;
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getDealsInArea(lat: number, lng: number, radius: number): Promise<Deal[]> {
    // Simple distance calculation for MVP
    return Array.from(this.deals.values()).filter((deal) => {
      const dealPoint = deal.location as { coordinates: [number, number] };
      const [dealLng, dealLat] = dealPoint.coordinates;
      const distance = Math.sqrt(
        Math.pow(dealLat - lat, 2) + Math.pow(dealLng - lng, 2)
      );
      return distance <= radius;
    });
  }

  async getDealsByBusiness(businessId: number): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(
      (deal) => deal.businessId === businessId
    );
  }

  async updateDealCustomers(id: number, count: number): Promise<Deal> {
    const deal = await this.getDeal(id);
    if (!deal) throw new Error("Deal not found");
    
    const updatedDeal = {
      ...deal,
      currentCustomers: count,
    };
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "pending",
      stripePaymentId: null,
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookingsByDeal(dealId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.dealId === dealId
    );
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async updateBookingStatus(
    id: number,
    status: string,
    stripePaymentId?: string
  ): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");

    const updatedBooking = {
      ...booking,
      status,
      stripePaymentId: stripePaymentId || booking.stripePaymentId,
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new MemStorage();
