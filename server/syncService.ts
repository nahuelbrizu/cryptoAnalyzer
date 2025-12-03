/**
 * Servicio de sincronización de datos con CoinMarketCap
 * Actualiza automáticamente precios, indicadores técnicos y scores de inversión
 */

import { getLatestListings } from "./coinmarketcap";
import {
  upsertCryptocurrency,
  insertPriceHistory,
  insertTechnicalIndicators,
  insertInvestmentScore,
  getAllCryptocurrencies,
} from "./db";
import {
  calculateRSI,
  calculateSMA,
  calculateMACD,
  calculateBollingerBands,
  calculateVolatility,
  calculatePriceChange,
} from "./technicalAnalysis";
import { calculateInvestmentScore } from "./investmentScoring";
import type { ScoringFactors } from "./investmentScoring";
import type { CMCCryptocurrency } from "./coinmarketcap";

export interface SyncResult {
  success: boolean;
  cryptosUpdated: number;
  pricesInserted: number;
  indicatorsCalculated: number;
  scoresCalculated: number;
  errors: string[];
  timestamp: Date;
}

/**
 * Sincroniza datos de criptomonedas desde CoinMarketCap
 */
export async function syncCryptocurrencies(limit: number = 100): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    cryptosUpdated: 0,
    pricesInserted: 0,
    indicatorsCalculated: 0,
    scoresCalculated: 0,
    errors: [],
    timestamp: new Date(),
  };

  try {
    console.log(`[Sync] Iniciando sincronización de ${limit} criptomonedas...`);

    // Obtener lista de criptomonedas desde CoinMarketCap
    const listings = await getLatestListings(limit);
    console.log(`[Sync] Obtenidas ${listings.length} criptomonedas de CoinMarketCap`);

    // Procesar cada criptomoneda
    for (const listing of listings) {
      try {
        await processCryptocurrency(listing, result);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[Sync] Error procesando ${listing.symbol}:`, errorMsg);
        result.errors.push(`${listing.symbol}: ${errorMsg}`);
      }
    }

    result.success = result.errors.length === 0;
    console.log(`[Sync] Sincronización completada:`, {
      cryptosUpdated: result.cryptosUpdated,
      pricesInserted: result.pricesInserted,
      indicatorsCalculated: result.indicatorsCalculated,
      scoresCalculated: result.scoresCalculated,
      errors: result.errors.length,
    });

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Sync] Error fatal en sincronización:", errorMsg);
    result.errors.push(`Error fatal: ${errorMsg}`);
    return result;
  }
}

/**
 * Procesa una criptomoneda individual
 */
async function processCryptocurrency(
  listing: CMCCryptocurrency,
  result: SyncResult
): Promise<void> {
  const usdQuote = listing.quote.USD;

  // Actualizar información de criptomoneda
  const crypto = await upsertCryptocurrency({
    symbol: listing.symbol,
    name: listing.name,
    cmcId: listing.id,
    marketCap: usdQuote.market_cap.toString(),
    volume24h: usdQuote.volume_24h.toString(),
    dominance: usdQuote.market_cap_dominance.toString(),
  });

  if (!crypto) {
    throw new Error("No se pudo actualizar criptomoneda");
  }

  result.cryptosUpdated++;

  // Insertar precio histórico actual
  const priceHistory = await insertPriceHistory({
    cryptocurrencyId: crypto.id,
    timestamp: new Date(usdQuote.last_updated),
    open: usdQuote.price.toString(),
    high: (usdQuote.price * (1 + Math.abs(usdQuote.percent_change_1h) / 100)).toString(),
    low: (usdQuote.price * (1 - Math.abs(usdQuote.percent_change_1h) / 100)).toString(),
    close: usdQuote.price.toString(),
    volume: usdQuote.volume_24h.toString(),
  });

  if (priceHistory) {
    result.pricesInserted++;
  }

  // Obtener historial de precios para calcular indicadores
  // Nota: En una implementación real, obtendrías datos históricos de CoinMarketCap
  // Por ahora usamos datos simulados para demostración
  const priceHistory_data = await getPriceHistoryForIndicators(crypto.id);

  if (priceHistory_data && priceHistory_data.length >= 20) {
    // Calcular indicadores técnicos
    const prices = priceHistory_data.map((p) => Number(p.close));

    const rsi = calculateRSI(prices, 14);
    const macd = calculateMACD(prices);
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const sma200 = calculateSMA(prices, 200);
    const bollinger = calculateBollingerBands(prices, 20, 2);
    const volatility = calculateVolatility(prices, 20);

    const indicators = await insertTechnicalIndicators({
      cryptocurrencyId: crypto.id,
      timestamp: new Date(),
      rsi14: rsi.toString(),
      macdValue: macd.macdValue.toString(),
      macdSignal: macd.signal.toString(),
      macdHistogram: macd.histogram.toString(),
      sma20: sma20.toString(),
      sma50: sma50.toString(),
      sma200: sma200.toString(),
      bollingerUpper: bollinger.upper.toString(),
      bollingerMiddle: bollinger.middle.toString(),
      bollingerLower: bollinger.lower.toString(),
    });

    if (indicators) {
      result.indicatorsCalculated++;

      // Calcular score de inversión
      const priceChange = calculatePriceChange(prices, 24);

      const scoringFactors: ScoringFactors = {
        rsi,
        macdHistogram: macd.histogram,
        sma20,
        sma50,
        sma200,
        currentPrice: usdQuote.price,
        volatility,
        priceChange24h: priceChange,
        volume24h: usdQuote.volume_24h,
        marketCap: usdQuote.market_cap,
      };

      const investmentScore = calculateInvestmentScore(scoringFactors);

      const score = await insertInvestmentScore({
        cryptocurrencyId: crypto.id,
        timestamp: new Date(),
        technicalScore: investmentScore.technicalScore.toString(),
        momentumScore: investmentScore.momentumScore.toString(),
        volatilityScore: investmentScore.volatilityScore.toString(),
        riskScore: investmentScore.riskScore.toString(),
        overallScore: investmentScore.overallScore.toString(),
        recommendation: investmentScore.recommendation,
      });

      if (score) {
        result.scoresCalculated++;
      }
    }
  }
}

/**
 * Obtiene historial de precios para calcular indicadores
 * En una implementación real, esto vendría de CoinMarketCap o una base de datos histórica
 */
async function getPriceHistoryForIndicators(cryptocurrencyId: number): Promise<any[]> {
  // Simulación: retornar datos de ejemplo
  // En producción, esto debería obtener datos reales de la base de datos
  const prices = [];
  let basePrice = 50000;

  for (let i = 100; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 0.05 * basePrice;
    basePrice += change;

    prices.push({
      cryptocurrencyId,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      open: basePrice - Math.random() * 100,
      high: basePrice + Math.random() * 200,
      low: basePrice - Math.random() * 200,
      close: basePrice,
      volume: Math.random() * 1000000000,
    });
  }

  return prices;
}

/**
 * Inicia sincronización periódica
 * Se ejecuta cada N minutos
 */
export function startPeriodicSync(intervalMinutes: number = 60): ReturnType<typeof setInterval> {
  console.log(`[Sync] Iniciando sincronización periódica cada ${intervalMinutes} minutos`);

  // Ejecutar inmediatamente
  syncCryptocurrencies(100).catch((error) => {
    console.error("[Sync] Error en sincronización inicial:", error);
  });

  // Luego ejecutar periódicamente
  const intervalMs = intervalMinutes * 60 * 1000;
  return setInterval(() => {
    syncCryptocurrencies(100).catch((error) => {
      console.error("[Sync] Error en sincronización periódica:", error);
    });
  }, intervalMs);
}

/**
 * Detiene la sincronización periódica
 */
export function stopPeriodicSync(timer: ReturnType<typeof setInterval>): void {
  clearInterval(timer);
  console.log("[Sync] Sincronización periódica detenida");
}
