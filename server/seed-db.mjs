/**
 * Script para popular la base de datos con datos de ejemplo
 * Ejecutar: node server/seed-db.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL no está configurada");
  process.exit(1);
}

// Datos de ejemplo de criptomonedas
const cryptoData = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    cmcId: 1,
    marketCap: 1500000000000,
    volume24h: 45000000000,
    dominance: 45.5,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    cmcId: 1027,
    marketCap: 250000000000,
    volume24h: 18000000000,
    dominance: 18.2,
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    cmcId: 1839,
    marketCap: 85000000000,
    volume24h: 2500000000,
    dominance: 5.8,
  },
  {
    symbol: "SOL",
    name: "Solana",
    cmcId: 5426,
    marketCap: 65000000000,
    volume24h: 3200000000,
    dominance: 4.2,
  },
  {
    symbol: "XRP",
    name: "XRP",
    cmcId: 52,
    marketCap: 45000000000,
    volume24h: 1800000000,
    dominance: 2.9,
  },
  {
    symbol: "ADA",
    name: "Cardano",
    cmcId: 2010,
    marketCap: 35000000000,
    volume24h: 1200000000,
    dominance: 2.3,
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    cmcId: 74,
    marketCap: 28000000000,
    volume24h: 1500000000,
    dominance: 1.8,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    cmcId: 5805,
    marketCap: 22000000000,
    volume24h: 950000000,
    dominance: 1.5,
  },
];

// Generar datos históricos de precios
function generatePriceHistory(basePrice, cryptoId) {
  const history = [];
  let price = basePrice;

  for (let i = 100; i >= 0; i--) {
    // Simular cambios de precio
    const change = (Math.random() - 0.5) * 0.1 * price;
    price += change;

    const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const volatility = Math.random() * 0.05 * price;

    history.push({
      cryptocurrencyId: cryptoId,
      timestamp,
      open: price - volatility,
      high: price + volatility * 1.5,
      low: price - volatility * 1.5,
      close: price,
      volume: Math.random() * 1000000000,
    });
  }

  return history;
}

// Generar indicadores técnicos
function generateIndicators(cryptoId) {
  return {
    cryptocurrencyId: cryptoId,
    timestamp: new Date(),
    rsi14: Math.random() * 100,
    macdValue: (Math.random() - 0.5) * 0.001,
    macdSignal: (Math.random() - 0.5) * 0.0005,
    macdHistogram: (Math.random() - 0.5) * 0.0005,
    sma20: 50000 + Math.random() * 5000,
    sma50: 48000 + Math.random() * 7000,
    sma200: 45000 + Math.random() * 10000,
    bollingerUpper: 52000 + Math.random() * 5000,
    bollingerMiddle: 50000 + Math.random() * 5000,
    bollingerLower: 48000 + Math.random() * 5000,
  };
}

// Generar scores de inversión
function generateInvestmentScore(cryptoId) {
  const technicalScore = Math.random() * 100;
  const momentumScore = Math.random() * 100;
  const volatilityScore = Math.random() * 100;
  const riskScore = Math.random() * 100;
  const overallScore = (technicalScore + momentumScore + volatilityScore + (100 - riskScore)) / 4;

  const recommendations = ["strong_buy", "buy", "hold", "sell", "strong_sell"];
  const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];

  return {
    cryptocurrencyId: cryptoId,
    timestamp: new Date(),
    technicalScore: technicalScore.toFixed(2),
    momentumScore: momentumScore.toFixed(2),
    volatilityScore: volatilityScore.toFixed(2),
    riskScore: riskScore.toFixed(2),
    overallScore: overallScore.toFixed(2),
    recommendation,
  };
}

async function seedDatabase() {
  let connection;

  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(DATABASE_URL);
    console.log("✅ Conectado a la base de datos");

    // Insertar criptomonedas
    for (const crypto of cryptoData) {
      const query = `
        INSERT INTO cryptocurrencies (symbol, name, cmcId, marketCap, volume24h, dominance)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        marketCap = VALUES(marketCap),
        volume24h = VALUES(volume24h),
        dominance = VALUES(dominance)
      `;

      await connection.execute(query, [
        crypto.symbol,
        crypto.name,
        crypto.cmcId,
        crypto.marketCap,
        crypto.volume24h,
        crypto.dominance,
      ]);

      console.log(`✅ Criptomoneda insertada: ${crypto.name}`);

      // Obtener el ID de la criptomoneda
      const [rows] = await connection.execute(
        "SELECT id FROM cryptocurrencies WHERE symbol = ?",
        [crypto.symbol]
      );

      if (rows.length > 0) {
        const cryptoId = rows[0].id;

        // Insertar historial de precios
        const priceHistory = generatePriceHistory(50000, cryptoId);
        for (const price of priceHistory) {
          const priceQuery = `
            INSERT INTO priceHistory (cryptocurrencyId, timestamp, open, high, low, close, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          await connection.execute(priceQuery, [
            price.cryptocurrencyId,
            price.timestamp,
            price.open,
            price.high,
            price.low,
            price.close,
            price.volume,
          ]);
        }

        console.log(`  📊 ${priceHistory.length} registros de precio insertados`);

        // Insertar indicadores técnicos
        const indicators = generateIndicators(cryptoId);
        const indicatorsQuery = `
          INSERT INTO technicalIndicators 
          (cryptocurrencyId, timestamp, rsi14, macdValue, macdSignal, macdHistogram, sma20, sma50, sma200, bollingerUpper, bollingerMiddle, bollingerLower)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(indicatorsQuery, [
          indicators.cryptocurrencyId,
          indicators.timestamp,
          indicators.rsi14,
          indicators.macdValue,
          indicators.macdSignal,
          indicators.macdHistogram,
          indicators.sma20,
          indicators.sma50,
          indicators.sma200,
          indicators.bollingerUpper,
          indicators.bollingerMiddle,
          indicators.bollingerLower,
        ]);

        console.log(`  📈 Indicadores técnicos insertados`);

        // Insertar scores de inversión
        const score = generateInvestmentScore(cryptoId);
        const scoreQuery = `
          INSERT INTO investmentScores 
          (cryptocurrencyId, timestamp, technicalScore, momentumScore, volatilityScore, riskScore, overallScore, recommendation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(scoreQuery, [
          score.cryptocurrencyId,
          score.timestamp,
          score.technicalScore,
          score.momentumScore,
          score.volatilityScore,
          score.riskScore,
          score.overallScore,
          score.recommendation,
        ]);

        console.log(`  🎯 Score de inversión insertado: ${score.recommendation}\n`);
      }
    }

    console.log("✅ Base de datos poblada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
