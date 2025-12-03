import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  cryptocurrencies, Cryptocurrency, InsertCryptocurrency,
  priceHistory, PriceHistory, InsertPriceHistory,
  technicalIndicators, TechnicalIndicator, InsertTechnicalIndicator,
  investmentScores, InvestmentScore, InsertInvestmentScore,
  priceAlerts, PriceAlert, InsertPriceAlert,
  portfolios, Portfolio, InsertPortfolio
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Operations ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Cryptocurrency Operations ============

export async function upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(cryptocurrencies)
      .values(crypto)
      .onDuplicateKeyUpdate({
        set: {
          name: crypto.name,
          marketCap: crypto.marketCap,
          volume24h: crypto.volume24h,
          dominance: crypto.dominance,
          lastUpdated: new Date(),
        }
      });

    if (crypto.symbol) {
      const updated = await db.select().from(cryptocurrencies)
        .where(eq(cryptocurrencies.symbol, crypto.symbol))
        .limit(1);
      return updated[0] || null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to upsert cryptocurrency:", error);
    throw error;
  }
}

export async function getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(cryptocurrencies)
    .where(eq(cryptocurrencies.symbol, symbol))
    .limit(1);

  return result[0] || null;
}

export async function getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(cryptocurrencies)
    .orderBy(desc(cryptocurrencies.marketCap));
}

// ============ Price History Operations ============

export async function insertPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(priceHistory).values(priceData);
    const result = await db.select().from(priceHistory)
      .where(and(
        eq(priceHistory.cryptocurrencyId, priceData.cryptocurrencyId),
        eq(priceHistory.timestamp, priceData.timestamp)
      ))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to insert price history:", error);
    throw error;
  }
}

export async function getPriceHistory(cryptocurrencyId: number, limit: number = 100): Promise<PriceHistory[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(priceHistory)
    .where(eq(priceHistory.cryptocurrencyId, cryptocurrencyId))
    .orderBy(desc(priceHistory.timestamp))
    .limit(limit);
}

// ============ Technical Indicators Operations ============

export async function insertTechnicalIndicators(indicators: InsertTechnicalIndicator): Promise<TechnicalIndicator | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(technicalIndicators).values(indicators);
    const result = await db.select().from(technicalIndicators)
      .where(and(
        eq(technicalIndicators.cryptocurrencyId, indicators.cryptocurrencyId),
        eq(technicalIndicators.timestamp, indicators.timestamp)
      ))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to insert technical indicators:", error);
    throw error;
  }
}

export async function getLatestIndicators(cryptocurrencyId: number): Promise<TechnicalIndicator | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(technicalIndicators)
    .where(eq(technicalIndicators.cryptocurrencyId, cryptocurrencyId))
    .orderBy(desc(technicalIndicators.timestamp))
    .limit(1);

  return result[0] || null;
}

// ============ Investment Scores Operations ============

export async function insertInvestmentScore(score: InsertInvestmentScore): Promise<InvestmentScore | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(investmentScores).values(score);
    const result = await db.select().from(investmentScores)
      .where(and(
        eq(investmentScores.cryptocurrencyId, score.cryptocurrencyId),
        eq(investmentScores.timestamp, score.timestamp)
      ))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to insert investment score:", error);
    throw error;
  }
}

export async function getLatestScores(): Promise<InvestmentScore[]> {
  const db = await getDb();
  if (!db) return [];

  // Obtener el score más reciente para cada criptomoneda
  const result = await db.select().from(investmentScores)
    .orderBy(desc(investmentScores.timestamp))
    .limit(100);

  // Filtrar para obtener solo el más reciente de cada crypto
  const seen = new Set<number>();
  return result.filter(score => {
    if (seen.has(score.cryptocurrencyId)) return false;
    seen.add(score.cryptocurrencyId);
    return true;
  });
}

// ============ Price Alerts Operations ============

export async function createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(priceAlerts).values(alert);
    const result = await db.select().from(priceAlerts)
      .where(and(
        eq(priceAlerts.userId, alert.userId),
        eq(priceAlerts.cryptocurrencyId, alert.cryptocurrencyId)
      ))
      .orderBy(desc(priceAlerts.createdAt))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create price alert:", error);
    throw error;
  }
}

export async function getUserAlerts(userId: number): Promise<PriceAlert[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(priceAlerts)
    .where(and(
      eq(priceAlerts.userId, userId),
      eq(priceAlerts.isActive, true)
    ))
    .orderBy(desc(priceAlerts.createdAt));
}

// ============ Portfolio Operations ============

export async function upsertPortfolioItem(portfolio: InsertPortfolio): Promise<Portfolio | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(portfolios)
      .values(portfolio)
      .onDuplicateKeyUpdate({
        set: {
          quantity: portfolio.quantity,
          averageBuyPrice: portfolio.averageBuyPrice,
          updatedAt: new Date(),
        }
      });

    const result = await db.select().from(portfolios)
      .where(and(
        eq(portfolios.userId, portfolio.userId),
        eq(portfolios.cryptocurrencyId, portfolio.cryptocurrencyId)
      ))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to upsert portfolio item:", error);
    throw error;
  }
}

export async function getUserPortfolio(userId: number): Promise<Portfolio[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(portfolios)
    .where(eq(portfolios.userId, userId))
    .orderBy(desc(portfolios.updatedAt));
}
