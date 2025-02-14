import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name"),
  isBusiness: boolean("is_business").default(false).notNull(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(),
  originalPrice: integer("original_price").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  minCustomers: integer("min_customers").notNull(),
  currentCustomers: integer("current_customers").default(0).notNull(),
  location: jsonb("location").notNull(), // GeoJSON point
  serviceArea: jsonb("service_area").notNull(), // GeoJSON polygon
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").default("pending").notNull(),
  stripePaymentId: text("stripe_payment_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  businessName: true,
  isBusiness: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  currentCustomers: true,
  status: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  stripePaymentId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
