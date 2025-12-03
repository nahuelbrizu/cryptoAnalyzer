import { describe, it, expect } from "vitest";
import {
  calculateRSI,
  calculateSMA,
  calculateMACD,
  calculateBollingerBands,
  calculateVolatility,
  calculatePriceChange,
  calculateTrendScore,
} from "./technicalAnalysis";

describe("Technical Analysis Algorithms", () => {
  // Datos de prueba: precios de cierre simulados
  const testPrices = [
    44000, 44500, 44200, 44800, 45000, 45500, 45200, 45800, 46000, 46500,
    46200, 46800, 47000, 47500, 47200, 47800, 48000, 48500, 48200, 48800,
    49000, 49500, 49200, 49800, 50000, 50500, 50200, 50800, 51000, 51500,
  ];

  describe("calculateRSI", () => {
    it("debería calcular RSI correctamente", () => {
      const rsi = calculateRSI(testPrices, 14);
      expect(rsi).toBeGreaterThanOrEqual(0);
      expect(rsi).toBeLessThanOrEqual(100);
    });

    it("debería retornar 0 si hay datos insuficientes", () => {
      const rsi = calculateRSI([100, 101, 102], 14);
      expect(rsi).toBe(0);
    });

    it("debería retornar 50 en caso de precio plano", () => {
      const flatPrices = Array(30).fill(100);
      const rsi = calculateRSI(flatPrices, 14);
      expect(rsi).toBe(50);
    });

    it("debería detectar sobrecompra (RSI > 70)", () => {
      const uptrend = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
      const rsi = calculateRSI(uptrend, 14);
      expect(rsi).toBeGreaterThan(70);
    });

    it("debería detectar sobreventa (RSI < 30)", () => {
      const downtrend = Array.from({ length: 30 }, (_, i) => 100 - i * 2);
      const rsi = calculateRSI(downtrend, 14);
      expect(rsi).toBeLessThan(30);
    });
  });

  describe("calculateSMA", () => {
    it("debería calcular SMA correctamente", () => {
      const sma = calculateSMA(testPrices, 10);
      const expected = testPrices.slice(-10).reduce((a, b) => a + b, 0) / 10;
      expect(sma).toBeCloseTo(expected, 2);
    });

    it("debería retornar 0 si hay datos insuficientes", () => {
      const sma = calculateSMA([100, 101], 10);
      expect(sma).toBe(0);
    });

    it("debería calcular correctamente con período 20", () => {
      const sma = calculateSMA(testPrices, 20);
      expect(sma).toBeGreaterThan(0);
      expect(sma).toBeLessThan(Math.max(...testPrices));
    });
  });

  describe("calculateMACD", () => {
    it("debería calcular MACD correctamente", () => {
      const macd = calculateMACD(testPrices);
      expect(macd.macdValue).toBeDefined();
      expect(macd.signal).toBeDefined();
      expect(macd.histogram).toBeDefined();
    });

    it("debería retornar ceros si hay datos insuficientes", () => {
      const macd = calculateMACD([100, 101, 102]);
      expect(macd.macdValue).toBe(0);
      expect(macd.signal).toBe(0);
      expect(macd.histogram).toBe(0);
    });

    it("debería tener relación entre macdValue, signal e histogram", () => {
      const macd = calculateMACD(testPrices);
      // El histograma es la diferencia entre MACD y su línea de señal
      const expectedHistogram = macd.macdValue - macd.signal;
      expect(Math.abs(macd.histogram - expectedHistogram)).toBeLessThan(0.0001);
    });
  });

  describe("calculateBollingerBands", () => {
    it("debería calcular Bandas de Bollinger correctamente", () => {
      const bands = calculateBollingerBands(testPrices, 20, 2);
      expect(bands.upper).toBeGreaterThan(bands.middle);
      expect(bands.middle).toBeGreaterThan(bands.lower);
    });

    it("debería retornar ceros si hay datos insuficientes", () => {
      const bands = calculateBollingerBands([100, 101], 20, 2);
      expect(bands.upper).toBe(0);
      expect(bands.middle).toBe(0);
      expect(bands.lower).toBe(0);
    });

    it("la banda media debería ser igual a SMA", () => {
      const bands = calculateBollingerBands(testPrices, 20, 2);
      const sma = calculateSMA(testPrices, 20);
      expect(bands.middle).toBeCloseTo(sma, 6);
    });

    it("debería tener mayor separación con mayor desviación estándar", () => {
      const bands1 = calculateBollingerBands(testPrices, 20, 1);
      const bands2 = calculateBollingerBands(testPrices, 20, 2);

      const spread1 = bands1.upper - bands1.lower;
      const spread2 = bands2.upper - bands2.lower;

      expect(spread2).toBeGreaterThan(spread1);
    });
  });

  describe("calculateVolatility", () => {
    it("debería calcular volatilidad correctamente", () => {
      const volatility = calculateVolatility(testPrices, 20);
      expect(volatility).toBeGreaterThanOrEqual(0);
    });

    it("debería retornar 0 si hay datos insuficientes", () => {
      const volatility = calculateVolatility([100, 101], 20);
      expect(volatility).toBe(0);
    });

    it("debería detectar mayor volatilidad en precios fluctuantes", () => {
      const stablePrices = Array(30).fill(100);
      const volatilePrices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.5) * 30);

      const stableVol = calculateVolatility(stablePrices, 20);
      const volatileVol = calculateVolatility(volatilePrices, 20);

      expect(volatileVol).toBeGreaterThan(stableVol);
    });
  });

  describe("calculatePriceChange", () => {
    it("debería calcular cambio de precio correctamente", () => {
      const prices = [100, 105, 110, 115, 120];
      const change = calculatePriceChange(prices, 5);
      const expected = ((120 - 100) / 100) * 100;
      expect(change).toBeCloseTo(expected, 1);
    });

    it("debería retornar 0 si hay datos insuficientes", () => {
      const change = calculatePriceChange([100], 5);
      expect(change).toBe(0);
    });

    it("debería detectar cambios positivos", () => {
      const prices = [100, 105, 110, 115, 120];
      const change = calculatePriceChange(prices, 5);
      expect(change).toBeGreaterThan(0);
    });

    it("debería detectar cambios negativos", () => {
      const prices = [120, 115, 110, 105, 100];
      const change = calculatePriceChange(prices, 5);
      expect(change).toBeLessThan(0);
    });
  });

  describe("calculateTrendScore", () => {
    it("debería retornar valor entre 0 y 100", () => {
      const score = calculateTrendScore(50, 0.001, 5);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("debería aumentar con RSI bajo (sobreventa)", () => {
      const score1 = calculateTrendScore(25, 0, 0);
      const score2 = calculateTrendScore(75, 0, 0);

      expect(score1).toBeGreaterThan(score2);
    });

    it("debería aumentar con MACD positivo significativo", () => {
      const score1 = calculateTrendScore(50, 0.01, 0);
      const score2 = calculateTrendScore(50, -0.01, 0);

      expect(score1).toBeGreaterThanOrEqual(score2);
    });

    it("debería aumentar cuando precio está por encima de SMA", () => {
      const score1 = calculateTrendScore(50, 0, 5);
      const score2 = calculateTrendScore(50, 0, -5);

      expect(score1).toBeGreaterThan(score2);
    });
  });

  describe("Integration Tests", () => {
    it("debería procesar precios reales sin errores", () => {
      expect(() => {
        calculateRSI(testPrices, 14);
        calculateSMA(testPrices, 20);
        calculateMACD(testPrices);
        calculateBollingerBands(testPrices, 20, 2);
        calculateVolatility(testPrices, 20);
        calculatePriceChange(testPrices, 24);
        calculateTrendScore(50, 0.001, 5);
      }).not.toThrow();
    });

    it("debería mantener consistencia entre indicadores", () => {
      const rsi = calculateRSI(testPrices, 14);
      const sma = calculateSMA(testPrices, 20);
      const bands = calculateBollingerBands(testPrices, 20, 2);

      // SMA debería estar dentro de las bandas de Bollinger
      expect(sma).toBeLessThanOrEqual(bands.upper);
      expect(sma).toBeGreaterThanOrEqual(bands.lower);
    });
  });
});
