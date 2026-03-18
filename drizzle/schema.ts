import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here
// Conversations table
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  driverId: int("driverId").notNull(),
  tripId: varchar("tripId", { length: 64 }),
  lastMessage: text("lastMessage"),
  lastMessageTime: timestamp("lastMessageTime"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages table
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["user", "driver"]).notNull(),
  content: text("content").notNull(),
  isRead: int("isRead").default(0).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Trips table (for tracking rides)
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  tripId: varchar("tripId", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  driverId: int("driverId"),
  pickupLocation: text("pickupLocation").notNull(),
  dropoffLocation: text("dropoffLocation").notNull(),
  pickupLat: varchar("pickupLat", { length: 20 }),
  pickupLng: varchar("pickupLng", { length: 20 }),
  dropoffLat: varchar("dropoffLat", { length: 20 }),
  dropoffLng: varchar("dropoffLng", { length: 20 }),
  vehicleType: varchar("vehicleType", { length: 50 }),
  estimatedPrice: int("estimatedPrice"),
  actualPrice: int("actualPrice"),
  status: mysqlEnum("status", ["searching", "accepted", "arriving", "in_progress", "completed", "cancelled"]).default("searching").notNull(),
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  rating: int("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

// Favorites table (for storing favorite destinations)
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 100 }).notNull(), // e.g., "Home", "Work", "Gym"
  address: text("address").notNull(), // Full address
  latitude: varchar("latitude", { length: 20 }).notNull(),
  longitude: varchar("longitude", { length: 20 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("MapPin"), // Icon type (Home, Briefcase, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
