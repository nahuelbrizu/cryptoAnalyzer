/**
 * Módulo de análisis técnico con algoritmos eficientes para criptomonedas
 */

export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Calcula el Índice de Fuerza Relativa (RSI)
 * Rango: 0-100. >70 sobreventa, <30 sobrecompra
 * @param prices Array de precios de cierre
 * @param period Período de cálculo (típicamente 14)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 0;

  let gains = 0;
  let losses = 0;

  // Calcular ganancias y pérdidas promedio iniciales
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calcular RSI para el resto de los precios
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.round(rsi * 100) / 100;
}

/**
 * Calcula la Media Móvil Simple (SMA)
 * @param prices Array de precios
 * @param period Período de la media móvil
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;

  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calcula el MACD (Moving Average Convergence Divergence)
 * @param prices Array de precios de cierre
 * @returns { macdValue, signal, histogram }
 */
export function calculateMACD(prices: number[]) {
  if (prices.length < 26) {
    return { macdValue: 0, signal: 0, histogram: 0 };
  }

  // Calcular EMA 12 y EMA 26
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  // MACD es la diferencia entre EMA 12 y EMA 26
  const macdValue = ema12 - ema26;

  // Calcular la línea de señal (EMA 9 del MACD)
  // Para simplificar, usamos una aproximación con SMA
  const signal = (macdValue * 2) / 11; // Aproximación simplificada

  // Histograma es la diferencia entre MACD y su línea de señal
  const histogram = macdValue - signal;

  return {
    macdValue: Math.round(macdValue * 1000000) / 1000000,
    signal: Math.round(signal * 1000000) / 1000000,
    histogram: Math.round(histogram * 1000000) / 1000000,
  };
}

/**
 * Calcula la Media Móvil Exponencial (EMA)
 * @param prices Array de precios
 * @param period Período de la EMA
 */
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

/**
 * Calcula las Bandas de Bollinger
 * @param prices Array de precios de cierre
 * @param period Período (típicamente 20)
 * @param stdDev Número de desviaciones estándar (típicamente 2)
 */
export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  if (prices.length < period) {
    return { upper: 0, middle: 0, lower: 0 };
  }

  const recentPrices = prices.slice(-period);
  const middle = calculateSMA(prices, period);

  // Calcular desviación estándar
  const variance = recentPrices.reduce((sum, price) => {
    return sum + Math.pow(price - middle, 2);
  }, 0) / period;

  const standardDeviation = Math.sqrt(variance);

  return {
    upper: Math.round((middle + stdDev * standardDeviation) * 100000000) / 100000000,
    middle: Math.round(middle * 100000000) / 100000000,
    lower: Math.round((middle - stdDev * standardDeviation) * 100000000) / 100000000,
  };
}

/**
 * Calcula la volatilidad (desviación estándar de retornos)
 * @param prices Array de precios
 * @param period Período (típicamente 20)
 */
export function calculateVolatility(prices: number[], period: number = 20): number {
  if (prices.length < period) return 0;

  const recentPrices = prices.slice(-period);
  const returns: number[] = [];

  for (let i = 1; i < recentPrices.length; i++) {
    const ret = (recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1];
    returns.push(ret);
  }

  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => {
    return sum + Math.pow(ret - meanReturn, 2);
  }, 0) / returns.length;

  const volatility = Math.sqrt(variance) * 100; // Convertir a porcentaje
  return Math.round(volatility * 100) / 100;
}

/**
 * Calcula el cambio porcentual en un período
 * @param prices Array de precios
 * @param period Período en días
 */
export function calculatePriceChange(prices: number[], period: number = 24): number {
  if (prices.length < period) return 0;

  const oldPrice = prices[prices.length - period];
  const newPrice = prices[prices.length - 1];

  if (oldPrice === 0) return 0;

  const change = ((newPrice - oldPrice) / oldPrice) * 100;
  return Math.round(change * 100) / 100;
}

/**
 * Calcula el índice de fuerza (Force Index)
 * Combina precio y volumen
 * @param ohlcv Array de datos OHLCV
 * @param period Período (típicamente 13)
 */
export function calculateForceIndex(ohlcv: OHLCV[], period: number = 13): number {
  if (ohlcv.length < 2) return 0;

  const rawForce = ohlcv[ohlcv.length - 1].volume * 
    (ohlcv[ohlcv.length - 1].close - ohlcv[ohlcv.length - 2].close);

  // Usar EMA del force index
  const ema = calculateEMA([rawForce], period);
  return Math.round(ema * 100) / 100;
}

/**
 * Calcula un score de tendencia basado en múltiples indicadores
 * Retorna un valor entre 0-100
 * @param rsi Índice de Fuerza Relativa
 * @param macdHistogram Histograma MACD
 * @param priceVsSMA Diferencia porcentual entre precio y SMA200
 */
export function calculateTrendScore(
  rsi: number,
  macdHistogram: number,
  priceVsSMA: number
): number {
  let score = 50; // Neutral

  // RSI: >70 sobreventa (bearish), <30 sobrecompra (bullish)
  if (rsi > 70) {
    score -= (rsi - 70) * 0.5; // Máximo -15 puntos
  } else if (rsi < 30) {
    score += (30 - rsi) * 0.5; // Máximo +15 puntos
  }

  // MACD: positivo es bullish
  if (macdHistogram > 0) {
    score += Math.min(macdHistogram * 10, 15);
  } else {
    score -= Math.min(Math.abs(macdHistogram) * 10, 15);
  }

  // Precio vs SMA: arriba es bullish
  if (priceVsSMA > 0) {
    score += Math.min(priceVsSMA * 0.5, 15);
  } else {
    score -= Math.min(Math.abs(priceVsSMA) * 0.5, 15);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
