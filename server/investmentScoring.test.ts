import { describe, it, expect } from "vitest";
import { calculateInvestmentScore, ScoringFactors } from "./investmentScoring";

describe("Investment Scoring System", () => {
  // Factores de prueba base
  const baseFactors: ScoringFactors = {
    rsi: 50,
    macdHistogram: 0,
    sma20: 50000,
    sma50: 49000,
    sma200: 48000,
    currentPrice: 50500,
    volatility: 2.5,
    priceChange24h: 2.5,
    volume24h: 5000000000,
    marketCap: 1000000000000,
  };

  describe("calculateInvestmentScore", () => {
    it("debería retornar un objeto con todos los scores", () => {
      const result = calculateInvestmentScore(baseFactors);

      expect(result).toHaveProperty("technicalScore");
      expect(result).toHaveProperty("momentumScore");
      expect(result).toHaveProperty("volatilityScore");
      expect(result).toHaveProperty("riskScore");
      expect(result).toHaveProperty("overallScore");
      expect(result).toHaveProperty("recommendation");
    });

    it("todos los scores deberían estar entre 0 y 100", () => {
      const result = calculateInvestmentScore(baseFactors);

      expect(result.technicalScore).toBeGreaterThanOrEqual(0);
      expect(result.technicalScore).toBeLessThanOrEqual(100);

      expect(result.momentumScore).toBeGreaterThanOrEqual(0);
      expect(result.momentumScore).toBeLessThanOrEqual(100);

      expect(result.volatilityScore).toBeGreaterThanOrEqual(0);
      expect(result.volatilityScore).toBeLessThanOrEqual(100);

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it("debería retornar una recomendación válida", () => {
      const result = calculateInvestmentScore(baseFactors);
      const validRecommendations = ["strong_buy", "buy", "hold", "sell", "strong_sell"];

      expect(validRecommendations).toContain(result.recommendation);
    });
  });

  describe("Technical Score", () => {
    it("debería aumentar cuando RSI está en sobreventa (< 30)", () => {
      const lowRsiFactors = { ...baseFactors, rsi: 25 };
      const normalFactors = { ...baseFactors, rsi: 50 };

      const lowRsiResult = calculateInvestmentScore(lowRsiFactors);
      const normalResult = calculateInvestmentScore(normalFactors);

      expect(lowRsiResult.technicalScore).toBeGreaterThan(normalResult.technicalScore);
    });

    it("debería disminuir cuando RSI está en sobrecompra (> 70)", () => {
      const highRsiFactors = { ...baseFactors, rsi: 75 };
      const normalFactors = { ...baseFactors, rsi: 50 };

      const highRsiResult = calculateInvestmentScore(highRsiFactors);
      const normalResult = calculateInvestmentScore(normalFactors);

      expect(highRsiResult.technicalScore).toBeLessThan(normalResult.technicalScore);
    });

    it("debería aumentar con MACD positivo significativo", () => {
      const positiveMacdFactors = { ...baseFactors, macdHistogram: 0.01 };
      const negativeMacdFactors = { ...baseFactors, macdHistogram: -0.01 };

      const positiveResult = calculateInvestmentScore(positiveMacdFactors);
      const negativeResult = calculateInvestmentScore(negativeMacdFactors);

      expect(positiveResult.technicalScore).toBeGreaterThanOrEqual(negativeResult.technicalScore);
    });

    it("debería aumentar cuando precio está por encima de SMA200", () => {
      const aboveSmaFactors = { ...baseFactors, currentPrice: 50500, sma200: 48000 };
      const belowSmaFactors = { ...baseFactors, currentPrice: 47500, sma200: 48000 };

      const aboveResult = calculateInvestmentScore(aboveSmaFactors);
      const belowResult = calculateInvestmentScore(belowSmaFactors);

      expect(aboveResult.technicalScore).toBeGreaterThan(belowResult.technicalScore);
    });
  });

  describe("Momentum Score", () => {
    it("debería aumentar con cambios de precio positivos", () => {
      const positiveChangeFactors = { ...baseFactors, priceChange24h: 5 };
      const negativeChangeFactors = { ...baseFactors, priceChange24h: -5 };

      const positiveResult = calculateInvestmentScore(positiveChangeFactors);
      const negativeResult = calculateInvestmentScore(negativeChangeFactors);

      expect(positiveResult.momentumScore).toBeGreaterThan(negativeResult.momentumScore);
    });

    it("debería detectar momentum fuerte (> 5%)", () => {
      const strongMomentumFactors = { ...baseFactors, priceChange24h: 10 };
      const weakMomentumFactors = { ...baseFactors, priceChange24h: 1 };

      const strongResult = calculateInvestmentScore(strongMomentumFactors);
      const weakResult = calculateInvestmentScore(weakMomentumFactors);

      expect(strongResult.momentumScore).toBeGreaterThan(weakResult.momentumScore);
    });

    it("debería amplificar momentum con mayor volumen", () => {
      const highVolumeFactors = { ...baseFactors, volume24h: 10000000000, priceChange24h: 5 };
      const lowVolumeFactors = { ...baseFactors, volume24h: 100000000, priceChange24h: 5 };

      const highVolResult = calculateInvestmentScore(highVolumeFactors);
      const lowVolResult = calculateInvestmentScore(lowVolumeFactors);

      // Mayor volumen debería amplificar el momentum
      expect(highVolResult.momentumScore).toBeGreaterThanOrEqual(lowVolResult.momentumScore);
    });
  });

  describe("Volatility Score", () => {
    it("debería ser mayor para baja volatilidad", () => {
      const lowVolFactors = { ...baseFactors, volatility: 1.5 };
      const highVolFactors = { ...baseFactors, volatility: 8 };

      const lowVolResult = calculateInvestmentScore(lowVolFactors);
      const highVolResult = calculateInvestmentScore(highVolFactors);

      expect(lowVolResult.volatilityScore).toBeGreaterThan(highVolResult.volatilityScore);
    });

    it("debería ser muy bajo para volatilidad extrema", () => {
      const extremeVolFactors = { ...baseFactors, volatility: 15 };
      const result = calculateInvestmentScore(extremeVolFactors);

      expect(result.volatilityScore).toBeLessThan(30);
    });
  });

  describe("Risk Score", () => {
    it("debería aumentar con mayor volatilidad", () => {
      const lowVolFactors = { ...baseFactors, volatility: 1 };
      const highVolFactors = { ...baseFactors, volatility: 10 };

      const lowVolResult = calculateInvestmentScore(lowVolFactors);
      const highVolResult = calculateInvestmentScore(highVolFactors);

      expect(highVolResult.riskScore).toBeGreaterThan(lowVolResult.riskScore);
    });

    it("debería aumentar con bajo volumen de trading", () => {
      const highVolumeFactors = { ...baseFactors, volume24h: 10000000000 };
      const lowVolumeFactors = { ...baseFactors, volume24h: 10000000 };

      const highVolResult = calculateInvestmentScore(highVolumeFactors);
      const lowVolResult = calculateInvestmentScore(lowVolumeFactors);

      expect(lowVolResult.riskScore).toBeGreaterThanOrEqual(highVolResult.riskScore);
    });

    it("debería aumentar para micro caps", () => {
      const largeCap = { ...baseFactors, marketCap: 100000000000 };
      const microCap = { ...baseFactors, marketCap: 100000000 };

      const largeCapResult = calculateInvestmentScore(largeCap);
      const microCapResult = calculateInvestmentScore(microCap);

      expect(microCapResult.riskScore).toBeGreaterThanOrEqual(largeCapResult.riskScore);
    });

    it("debería aumentar con RSI extremo", () => {
      const normalRsiFactors = { ...baseFactors, rsi: 50 };
      const extremeRsiFactors = { ...baseFactors, rsi: 85 };

      const normalResult = calculateInvestmentScore(normalRsiFactors);
      const extremeResult = calculateInvestmentScore(extremeRsiFactors);

      expect(extremeResult.riskScore).toBeGreaterThan(normalResult.riskScore);
    });
  });

  describe("Recommendations", () => {
    it("debería recomendar buy o strong_buy para factores positivos", () => {
      const bullishFactors: ScoringFactors = {
        rsi: 25,
        macdHistogram: 0.002,
        sma20: 50000,
        sma50: 49000,
        sma200: 48000,
        currentPrice: 50500,
        volatility: 1.5,
        priceChange24h: 5,
        volume24h: 8000000000,
        marketCap: 1000000000000,
      };

      const result = calculateInvestmentScore(bullishFactors);
      expect(["strong_buy", "buy"]).toContain(result.recommendation);
    });

    it("debería recomendar sell o strong_sell para factores negativos", () => {
      const bearishFactors: ScoringFactors = {
        rsi: 85,
        macdHistogram: -0.002,
        sma20: 48000,
        sma50: 49000,
        sma200: 50000,
        currentPrice: 47500,
        volatility: 8,
        priceChange24h: -5,
        volume24h: 1000000000,
        marketCap: 10000000,
      };

      const result = calculateInvestmentScore(bearishFactors);
      expect(["sell", "strong_sell"]).toContain(result.recommendation);
    });

    it("debería recomendar hold para factores neutrales", () => {
      const result = calculateInvestmentScore(baseFactors);
      expect(result.recommendation).toBe("hold");
    });
  });

  describe("Edge Cases", () => {
    it("debería manejar RSI en límites", () => {
      const minRsi = calculateInvestmentScore({ ...baseFactors, rsi: 0 });
      const maxRsi = calculateInvestmentScore({ ...baseFactors, rsi: 100 });

      expect(minRsi.technicalScore).toBeDefined();
      expect(maxRsi.technicalScore).toBeDefined();
    });

    it("debería manejar volatilidad cero", () => {
      const result = calculateInvestmentScore({ ...baseFactors, volatility: 0 });
      expect(result.volatilityScore).toBeDefined();
      expect(result.riskScore).toBeDefined();
    });

    it("debería manejar cambios de precio extremos", () => {
      const extreme = calculateInvestmentScore({ ...baseFactors, priceChange24h: 50 });
      expect(extreme.momentumScore).toBeDefined();
      expect(extreme.momentumScore).toBeLessThanOrEqual(100);
    });

    it("debería manejar capitalización de mercado muy pequeña", () => {
      const result = calculateInvestmentScore({ ...baseFactors, marketCap: 1000000 });
      expect(result.riskScore).toBeGreaterThanOrEqual(30);
    });
  });

  describe("Overall Score Calculation", () => {
    it("debería ser promedio ponderado de los componentes", () => {
      const result = calculateInvestmentScore(baseFactors);

      // Verificar que el score general está entre los componentes
      const min = Math.min(
        result.technicalScore,
        result.momentumScore,
        result.volatilityScore,
        100 - result.riskScore
      );

      const max = Math.max(
        result.technicalScore,
        result.momentumScore,
        result.volatilityScore,
        100 - result.riskScore
      );

      expect(result.overallScore).toBeGreaterThanOrEqual(min - 10);
      expect(result.overallScore).toBeLessThanOrEqual(max + 10);
    });

    it("debería ser más bajo cuando hay riesgo alto", () => {
      const lowRiskFactors: ScoringFactors = {
        ...baseFactors,
        volatility: 1,
        marketCap: 1000000000000,
        volume24h: 10000000000,
      };

      const highRiskFactors: ScoringFactors = {
        ...baseFactors,
        volatility: 10,
        marketCap: 10000000,
        volume24h: 100000000,
      };

      const lowRiskResult = calculateInvestmentScore(lowRiskFactors);
      const highRiskResult = calculateInvestmentScore(highRiskFactors);

      expect(lowRiskResult.overallScore).toBeGreaterThan(highRiskResult.overallScore);
    });
  });
});
