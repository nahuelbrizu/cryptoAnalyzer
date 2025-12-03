import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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

/**
 * Tabla para almacenar información de criptomonedas
 */
export const cryptocurrencies = mysqlTable("cryptocurrencies", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(), // BTC, ETH, etc.
  name: varchar("name", { length: 100 }).notNull(), // Bitcoin, Ethereum, etc.
  cmcId: int("cmcId").unique(), // ID de CoinMarketCap para referencia
  marketCap: decimal("marketCap", { precision: 20, scale: 2 }), // Capitalización de mercado
  volume24h: decimal("volume24h", { precision: 20, scale: 2 }), // Volumen en 24h
  dominance: decimal("dominance", { precision: 5, scale: 2 }), // Dominancia de mercado (%)
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = typeof cryptocurrencies.$inferInsert;

/**
 * Tabla para almacenar datos históricos de precios
 */
export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  cryptocurrencyId: int("cryptocurrencyId").notNull(),
  timestamp: timestamp("timestamp").notNull(), // Hora del dato
  open: decimal("open", { precision: 18, scale: 8 }).notNull(),
  high: decimal("high", { precision: 18, scale: 8 }).notNull(),
  low: decimal("low", { precision: 18, scale: 8 }).notNull(),
  close: decimal("close", { precision: 18, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * Tabla para almacenar indicadores técnicos calculados
 */
export const technicalIndicators = mysqlTable("technicalIndicators", {
  id: int("id").autoincrement().primaryKey(),
  cryptocurrencyId: int("cryptocurrencyId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  rsi14: decimal("rsi14", { precision: 5, scale: 2 }), // RSI con período 14
  macdValue: decimal("macdValue", { precision: 10, scale: 6 }), // Valor MACD
  macdSignal: decimal("macdSignal", { precision: 10, scale: 6 }), // Línea de señal MACD
  macdHistogram: decimal("macdHistogram", { precision: 10, scale: 6 }), // Histograma MACD
  sma20: decimal("sma20", { precision: 18, scale: 8 }), // Media móvil simple 20
  sma50: decimal("sma50", { precision: 18, scale: 8 }), // Media móvil simple 50
  sma200: decimal("sma200", { precision: 18, scale: 8 }), // Media móvil simple 200
  bollingerUpper: decimal("bollingerUpper", { precision: 18, scale: 8 }), // Banda superior Bollinger
  bollingerMiddle: decimal("bollingerMiddle", { precision: 18, scale: 8 }), // Banda media Bollinger
  bollingerLower: decimal("bollingerLower", { precision: 18, scale: 8 }), // Banda inferior Bollinger
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;
export type InsertTechnicalIndicator = typeof technicalIndicators.$inferInsert;

/**
 * Tabla para almacenar scores de inversión
 */
export const investmentScores = mysqlTable("investmentScores", {
  id: int("id").autoincrement().primaryKey(),
  cryptocurrencyId: int("cryptocurrencyId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  technicalScore: decimal("technicalScore", { precision: 5, scale: 2 }), // 0-100
  momentumScore: decimal("momentumScore", { precision: 5, scale: 2 }), // 0-100
  volatilityScore: decimal("volatilityScore", { precision: 5, scale: 2 }), // 0-100
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }), // 0-100 (mayor = más riesgo)
  overallScore: decimal("overallScore", { precision: 5, scale: 2 }), // 0-100
  recommendation: mysqlEnum("recommendation", ["strong_buy", "buy", "hold", "sell", "strong_sell"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentScore = typeof investmentScores.$inferSelect;
export type InsertInvestmentScore = typeof investmentScores.$inferInsert;

/**
 * Tabla para alertas de precio del usuario
 */
export const priceAlerts = mysqlTable("priceAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cryptocurrencyId: int("cryptocurrencyId").notNull(),
  targetPrice: decimal("targetPrice", { precision: 18, scale: 8 }).notNull(),
  alertType: mysqlEnum("alertType", ["above", "below"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  triggered: boolean("triggered").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

/**
 * Tabla para portafolio del usuario
 */
export const portfolios = mysqlTable("portfolios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cryptocurrencyId: int("cryptocurrencyId").notNull(),
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  averageBuyPrice: decimal("averageBuyPrice", { precision: 18, scale: 8 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;
