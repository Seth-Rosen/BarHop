import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  serial,
  boolean,
  decimal,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// =======================
// USER MANAGEMENT
// =======================

// Enhanced user table with social features
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  username: varchar("username").unique(),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  isLocationSharingEnabled: boolean("is_location_sharing_enabled").default(false),
  lastKnownLatitude: decimal("last_known_latitude", { precision: 10, scale: 7 }),
  lastKnownLongitude: decimal("last_known_longitude", { precision: 10, scale: 7 }),
  lastLocationUpdate: timestamp("last_location_update"),
  isOnline: boolean("is_online").default(false),
  walkMeHomeActive: boolean("walk_me_home_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friend relationships
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  addresseeId: varchar("addressee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("unique_friendship").on(table.requesterId, table.addresseeId),
]);

// User check-ins for location sharing
export const userCheckIns = pgTable("user_check_ins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  barId: integer("bar_id").references(() => bars.id, { onDelete: "set null" }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  message: text("message"),
  isPublic: boolean("is_public").default(true),
  expiresAt: timestamp("expires_at"), // Auto-expire check-ins
  createdAt: timestamp("created_at").defaultNow(),
});

// =======================
// BAR & LOCATION DATA
// =======================

export const bars = pgTable("bars", {
  id: serial("id").primaryKey(),
  placeId: varchar("place_id").unique(),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  type: varchar("type").notNull(),
  description: text("description"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  hours: jsonb("hours"), // Store opening hours as JSON
  phoneNumber: varchar("phone_number"),
  website: varchar("website"),
  imageUrl: text("image_url"),
  features: text("features").array(),
  isSponsored: boolean("is_sponsored").default(false),
  promotion: text("promotion"),
  isOpen: boolean("is_open"),
  priceRange: varchar("price_range"),
  isVerified: boolean("is_verified").default(false),
  businessOwnerId: varchar("business_owner_id").references(() => users.id),
  customization: jsonb("customization"), // Bar-specific customizations
  lastGoogleSync: timestamp("last_google_sync"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom locations (for BarHop itineraries)
export const customLocations = pgTable("custom_locations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// =======================
// USER FAVORITES & LISTS
// =======================

// User's favorite bars
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  barId: integer("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("unique_user_favorite").on(table.userId, table.barId),
]);

// Custom lists created by users
export const userLists = pgTable("user_lists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Items in user lists
export const userListItems = pgTable("user_list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull().references(() => userLists.id, { onDelete: "cascade" }),
  barId: integer("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  notes: text("notes"),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  uniqueIndex("unique_list_item").on(table.listId, table.barId),
]);

// =======================
// BARHOP ITINERARIES
// =======================

// BarHop plans/itineraries
export const barHops = pgTable("bar_hops", {
  id: serial("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  plannedDate: timestamp("planned_date").notNull(),
  isPublic: boolean("is_public").default(false),
  maxParticipants: integer("max_participants"),
  status: varchar("status").notNull().default("planned"), // planned, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual stops in a BarHop itinerary
export const barHopStops = pgTable("bar_hop_stops", {
  id: serial("id").primaryKey(),
  barHopId: integer("bar_hop_id").notNull().references(() => barHops.id, { onDelete: "cascade" }),
  barId: integer("bar_id").references(() => bars.id, { onDelete: "cascade" }),
  customLocationId: integer("custom_location_id").references(() => customLocations.id, { onDelete: "cascade" }),
  stopOrder: integer("stop_order").notNull(),
  plannedArrivalTime: timestamp("planned_arrival_time"),
  estimatedDuration: integer("estimated_duration_minutes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// BarHop participants and RSVPs
export const barHopParticipants = pgTable("bar_hop_participants", {
  id: serial("id").primaryKey(),
  barHopId: integer("bar_hop_id").notNull().references(() => barHops.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("interested"), // interested, going, maybe, declined
  joinedAt: timestamp("joined_at").defaultNow(),
  lastStatusUpdate: timestamp("last_status_update").defaultNow(),
}, (table) => [
  uniqueIndex("unique_participant").on(table.barHopId, table.userId),
]);

// BarHop invitations
export const barHopInvitations = pgTable("bar_hop_invitations", {
  id: serial("id").primaryKey(),
  barHopId: integer("bar_hop_id").notNull().references(() => barHops.id, { onDelete: "cascade" }),
  inviterId: varchar("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteeId: varchar("invitee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
}, (table) => [
  uniqueIndex("unique_invitation").on(table.barHopId, table.inviteeId),
]);

// =======================
// SOCIAL FEATURES
// =======================

// User reviews for bars
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  barId: integer("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("unique_user_review").on(table.userId, table.barId),
]);

// User posts/updates (for social feed)
export const userPosts = pgTable("user_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  barId: integer("bar_id").references(() => bars.id, { onDelete: "set null" }),
  barHopId: integer("bar_hop_id").references(() => barHops.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// =======================
// BUSINESS/ADMIN FEATURES
// =======================

// Business accounts for bar owners
export const businessAccounts = pgTable("business_accounts", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: varchar("business_name").notNull(),
  businessType: varchar("business_type").notNull(),
  taxId: varchar("tax_id"),
  isVerified: boolean("is_verified").default(false),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, basic, premium
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics for bar owners
export const barAnalytics = pgTable("bar_analytics", {
  id: serial("id").primaryKey(),
  barId: integer("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  profileViews: integer("profile_views").default(0),
  favoriteAdds: integer("favorite_adds").default(0),
  checkIns: integer("check_ins").default(0),
  barHopInclusions: integer("bar_hop_inclusions").default(0),
  reviewCount: integer("review_count").default(0),
  averageRating: decimal("average_rating", { precision: 2, scale: 1 }),
}, (table) => [
  uniqueIndex("unique_bar_date").on(table.barId, table.date),
]);

// =======================
// RELATIONS
// =======================

export const usersRelations = relations(users, ({ many }) => ({
  sentFriendRequests: many(friendships, { relationName: "requester" }),
  receivedFriendRequests: many(friendships, { relationName: "addressee" }),
  favorites: many(userFavorites),
  lists: many(userLists),
  checkIns: many(userCheckIns),
  customLocations: many(customLocations),
  createdBarHops: many(barHops),
  barHopParticipations: many(barHopParticipants),
  sentInvitations: many(barHopInvitations, { relationName: "inviter" }),
  receivedInvitations: many(barHopInvitations, { relationName: "invitee" }),
  reviews: many(userReviews),
  posts: many(userPosts),
  businessAccount: many(businessAccounts),
}));

export const barsRelations = relations(bars, ({ many, one }) => ({
  favorites: many(userFavorites),
  listItems: many(userListItems),
  barHopStops: many(barHopStops),
  checkIns: many(userCheckIns),
  reviews: many(userReviews),
  posts: many(userPosts),
  analytics: many(barAnalytics),
  owner: one(users, {
    fields: [bars.businessOwnerId],
    references: [users.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const barHopsRelations = relations(barHops, ({ one, many }) => ({
  creator: one(users, {
    fields: [barHops.creatorId],
    references: [users.id],
  }),
  stops: many(barHopStops),
  participants: many(barHopParticipants),
  invitations: many(barHopInvitations),
  posts: many(userPosts),
}));

export const barHopStopsRelations = relations(barHopStops, ({ one }) => ({
  barHop: one(barHops, {
    fields: [barHopStops.barHopId],
    references: [barHops.id],
  }),
  bar: one(bars, {
    fields: [barHopStops.barId],
    references: [bars.id],
  }),
  customLocation: one(customLocations, {
    fields: [barHopStops.customLocationId],
    references: [customLocations.id],
  }),
}));

export const userListsRelations = relations(userLists, ({ one, many }) => ({
  user: one(users, {
    fields: [userLists.userId],
    references: [users.id],
  }),
  items: many(userListItems),
}));

// =======================
// ZOD SCHEMAS
// =======================

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertBarSchema = createInsertSchema(bars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBarHopSchema = createInsertSchema(barHops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// =======================
// TYPES
// =======================

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertBar = z.infer<typeof insertBarSchema>;
export type Bar = typeof bars.$inferSelect;
export type InsertBarHop = z.infer<typeof insertBarHopSchema>;
export type BarHop = typeof barHops.$inferSelect;
export type BarHopWithDetails = BarHop & {
  creator: User;
  stops: (typeof barHopStops.$inferSelect & {
    bar?: Bar;
    customLocation?: typeof customLocations.$inferSelect;
  })[];
  participants: (typeof barHopParticipants.$inferSelect & {
    user: User;
  })[];
};
export type Friendship = typeof friendships.$inferSelect;
export type UserList = typeof userLists.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type UserCheckIn = typeof userCheckIns.$inferSelect;
export type UserReview = typeof userReviews.$inferSelect;

// Location search schema
export const locationSearchSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().optional().default(5),
});

export type LocationSearch = z.infer<typeof locationSearchSchema>;