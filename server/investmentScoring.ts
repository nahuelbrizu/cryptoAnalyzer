/**
 * Módulo de scoring de inversión
 * Calcula scores de inversión basados en múltiples factores
 */

export interface ScoringFactors {
  rsi: number; // 0-100
  macdHistogram: number; // Puede ser positivo o negativo
  sma20: number;
  sma50: number;
  sma200: number;
  currentPrice: number;
  volatility: number; // En porcentaje
  priceChange24h: number; // En porcentaje
  volume24h: number;
  marketCap: number;
}

export interface InvestmentScoreResult {
  technicalScore: number; // 0-100
  momentumScore: number; // 0-100
  volatilityScore: number; // 0-100
  riskScore: number; // 0-100 (mayor = más riesgo)
  overallScore: number; // 0-100
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
  reasoning: string;
}

/**
 * Calcula el score técnico basado en indicadores técnicos
 */
function calculateTechnicalScore(factors: ScoringFactors): number {
  let score = 50; // Neutral

  // RSI: >70 sobreventa (bearish), <30 sobrecompra (bullish)
  if (factors.rsi > 70) {
    score -= (factors.rsi - 70) * 0.8; // Máximo -24 puntos
  } else if (factors.rsi < 30) {
    score += (30 - factors.rsi) * 0.8; // Máximo +24 puntos
  }

  // MACD: positivo es bullish
  if (factors.macdHistogram > 0) {
    score += Math.min(Math.abs(factors.macdHistogram) * 20, 20);
  } else {
    score -= Math.min(Math.abs(factors.macdHistogram) * 20, 20);
  }

  // Posición respecto a medias móviles
  const priceVsSMA200 = ((factors.currentPrice - factors.sma200) / factors.sma200) * 100;
  const priceVsSMA50 = ((factors.currentPrice - factors.sma50) / factors.sma50) * 100;

  if (priceVsSMA200 > 0 && priceVsSMA50 > 0) {
    score += Math.min(priceVsSMA200 * 0.1, 15); // Precio arriba de medias = bullish
  } else if (priceVsSMA200 < 0 && priceVsSMA50 < 0) {
    score -= Math.min(Math.abs(priceVsSMA200) * 0.1, 15); // Precio abajo de medias = bearish
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calcula el score de momentum
 */
function calculateMomentumScore(factors: ScoringFactors): number {
  let score = 50; // Neutral

  // Cambio de precio en 24h
  if (factors.priceChange24h > 5) {
    score += Math.min(factors.priceChange24h * 2, 30); // Momentum positivo fuerte
  } else if (factors.priceChange24h > 0) {
    score += factors.priceChange24h * 3;
  } else if (factors.priceChange24h < -5) {
    score -= Math.min(Math.abs(factors.priceChange24h) * 2, 30); // Momentum negativo fuerte
  } else if (factors.priceChange24h < 0) {
    score += factors.priceChange24h * 3; // Negativo suma negativo
  }

  // Volumen: mayor volumen = mayor confianza en el movimiento
  // Asumimos un volumen promedio de 1 millón
  const volumeRatio = Math.log(factors.volume24h / 1000000 + 1);
  if (factors.priceChange24h > 0) {
    score += Math.min(volumeRatio * 5, 10); // Volumen amplifica momentum positivo
  } else if (factors.priceChange24h < 0) {
    score -= Math.min(volumeRatio * 5, 10); // Volumen amplifica momentum negativo
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calcula el score de volatilidad
 * Mayor volatilidad = mayor riesgo pero también mayor oportunidad
 */
function calculateVolatilityScore(factors: ScoringFactors): number {
  // Volatilidad baja (< 2%) = más segura
  // Volatilidad media (2-5%) = equilibrio
  // Volatilidad alta (> 5%) = más riesgosa pero con mayor potencial

  if (factors.volatility < 2) {
    return 80; // Muy segura
  } else if (factors.volatility < 3) {
    return 70;
  } else if (factors.volatility < 5) {
    return 60; // Equilibrio
  } else if (factors.volatility < 8) {
    return 40;
  } else {
    return Math.max(10, 30 - factors.volatility); // Muy volátil
  }
}

/**
 * Calcula el score de riesgo (0-100, mayor = más riesgo)
 */
function calculateRiskScore(factors: ScoringFactors): number {
  let riskScore = 50; // Riesgo neutral

  // Volatilidad es el factor principal de riesgo
  riskScore = Math.min(100, factors.volatility * 10);

  // RSI extremo aumenta el riesgo
  if (factors.rsi > 80 || factors.rsi < 20) {
    riskScore += 10;
  }

  // Cambios extremos de precio aumentan el riesgo
  if (Math.abs(factors.priceChange24h) > 10) {
    riskScore += 15;
  }

  // Bajo volumen aumenta el riesgo
  if (factors.volume24h < 100000) {
    riskScore += 20;
  }

  // Capitalización de mercado baja aumenta el riesgo
  if (factors.marketCap < 1000000) {
    riskScore += 25; // Micro cap = muy riesgoso
  } else if (factors.marketCap < 10000000) {
    riskScore += 15; // Small cap
  }

  return Math.max(0, Math.min(100, Math.round(riskScore)));
}

/**
 * Calcula el score general de inversión
 */
function calculateOverallScore(
  technicalScore: number,
  momentumScore: number,
  volatilityScore: number,
  riskScore: number
): number {
  // Ponderación: 40% técnico, 30% momentum, 20% volatilidad, 10% riesgo
  const overall =
    technicalScore * 0.4 +
    momentumScore * 0.3 +
    volatilityScore * 0.2 +
    (100 - riskScore) * 0.1; // Invertir riesgo (menor riesgo = mejor)

  return Math.round(overall);
}

/**
 * Determina la recomendación de inversión
 */
function getRecommendation(
  overallScore: number,
  riskScore: number
): "strong_buy" | "buy" | "hold" | "sell" | "strong_sell" {
  // Ajustar recomendación según el riesgo
  const adjustedScore = overallScore - riskScore * 0.1;

  if (adjustedScore >= 75) {
    return "strong_buy";
  } else if (adjustedScore >= 60) {
    return "buy";
  } else if (adjustedScore >= 40) {
    return "hold";
  } else if (adjustedScore >= 25) {
    return "sell";
  } else {
    return "strong_sell";
  }
}

/**
 * Genera el razonamiento de la recomendación
 */
function generateReasoning(
  factors: ScoringFactors,
  scores: {
    technical: number;
    momentum: number;
    volatility: number;
    risk: number;
  }
): string {
  const reasons: string[] = [];

  // Análisis técnico
  if (factors.rsi > 70) {
    reasons.push("RSI indica sobrecompra");
  } else if (factors.rsi < 30) {
    reasons.push("RSI indica sobreventa");
  }

  // Análisis de tendencia
  if (factors.currentPrice > factors.sma200) {
    reasons.push("Precio por encima de SMA200 (tendencia alcista)");
  } else {
    reasons.push("Precio por debajo de SMA200 (tendencia bajista)");
  }

  // Momentum
  if (factors.priceChange24h > 5) {
    reasons.push("Momentum positivo fuerte en 24h");
  } else if (factors.priceChange24h < -5) {
    reasons.push("Momentum negativo fuerte en 24h");
  }

  // Volatilidad y riesgo
  if (scores.volatility < 40) {
    reasons.push("Baja volatilidad (más seguro)");
  } else if (scores.volatility > 60) {
    reasons.push("Alta volatilidad (mayor riesgo)");
  }

  // Volumen
  if (factors.volume24h > 10000000) {
    reasons.push("Volumen de trading alto (buena liquidez)");
  } else if (factors.volume24h < 100000) {
    reasons.push("Volumen bajo (baja liquidez)");
  }

  return reasons.join(". ");
}

/**
 * Calcula el score completo de inversión
 */
export function calculateInvestmentScore(factors: ScoringFactors): InvestmentScoreResult {
  const technicalScore = calculateTechnicalScore(factors);
  const momentumScore = calculateMomentumScore(factors);
  const volatilityScore = calculateVolatilityScore(factors);
  const riskScore = calculateRiskScore(factors);
  const overallScore = calculateOverallScore(technicalScore, momentumScore, volatilityScore, riskScore);
  const recommendation = getRecommendation(overallScore, riskScore);

  const scores = {
    technical: technicalScore,
    momentum: momentumScore,
    volatility: volatilityScore,
    risk: riskScore,
  };

  const reasoning = generateReasoning(factors, scores);

  return {
    technicalScore,
    momentumScore,
    volatilityScore,
    riskScore,
    overallScore,
    recommendation,
    reasoning,
  };
}

/**
 * Calcula recomendaciones para un portafolio
 */
export function getPortfolioRecommendations(
  scores: InvestmentScoreResult[]
): InvestmentScoreResult[] {
  // Ordenar por score general descendente
  return scores
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 10); // Top 10
}
