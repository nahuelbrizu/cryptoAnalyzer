import { describe, it, expect, beforeAll } from "vitest";
import { getLatestListings, getQuotesBySymbol } from "./coinmarketcap";

describe("CoinMarketCap API Integration", () => {
  // Verificar que la API key está configurada
  const apiKeyConfigured = !!process.env.COINMARKETCAP_API_KEY;

  describe("API Key Configuration", () => {
    it("debería tener COINMARKETCAP_API_KEY configurada", () => {
      expect(apiKeyConfigured).toBe(true);
    });
  });

  // Solo ejecutar tests de API si la clave está configurada
  if (apiKeyConfigured) {
    describe("getLatestListings", () => {
      it("debería obtener lista de criptomonedas", async () => {
        const listings = await getLatestListings(5);

        expect(listings).toBeDefined();
        expect(Array.isArray(listings)).toBe(true);
        expect(listings.length).toBeGreaterThan(0);
      });

      it("debería retornar criptomonedas con estructura correcta", async () => {
        const listings = await getLatestListings(1);

        expect(listings.length).toBeGreaterThan(0);
        const crypto = listings[0];

        expect(crypto).toHaveProperty("id");
        expect(crypto).toHaveProperty("name");
        expect(crypto).toHaveProperty("symbol");
        expect(crypto).toHaveProperty("quote");
        expect(crypto.quote).toHaveProperty("USD");
      });

      it("debería incluir datos de precio y volumen", async () => {
        const listings = await getLatestListings(1);
        const crypto = listings[0];
        const usdQuote = crypto.quote.USD;

        expect(usdQuote).toHaveProperty("price");
        expect(usdQuote).toHaveProperty("volume_24h");
        expect(usdQuote).toHaveProperty("market_cap");
        expect(usdQuote).toHaveProperty("market_cap_dominance");

        expect(typeof usdQuote.price).toBe("number");
        expect(usdQuote.price).toBeGreaterThan(0);
      });

      it("debería retornar cambios de precio en diferentes períodos", async () => {
        const listings = await getLatestListings(1);
        const crypto = listings[0];
        const usdQuote = crypto.quote.USD;

        expect(usdQuote).toHaveProperty("percent_change_1h");
        expect(usdQuote).toHaveProperty("percent_change_24h");
        expect(usdQuote).toHaveProperty("percent_change_7d");

        expect(typeof usdQuote.percent_change_24h).toBe("number");
      });
    });

    describe("getQuotesBySymbol", () => {
      it("debería obtener datos de criptomonedas por símbolo", async () => {
        const quotes = await getQuotesBySymbol(["BTC", "ETH"]);

        expect(quotes).toBeDefined();
        expect(Array.isArray(quotes)).toBe(true);
        expect(quotes.length).toBeGreaterThanOrEqual(1);
      });

      it("debería retornar Bitcoin con datos correctos", async () => {
        const quotes = await getQuotesBySymbol(["BTC"]);

        expect(quotes.length).toBeGreaterThan(0);
        const btc = quotes[0];

        expect(btc.symbol).toBe("BTC");
        expect(btc.name).toBe("Bitcoin");
        expect(btc.quote.USD.price).toBeGreaterThan(0);
      });

      it("debería manejar múltiples símbolos", async () => {
        const quotes = await getQuotesBySymbol(["BTC", "ETH", "BNB"]);

        expect(quotes.length).toBeGreaterThanOrEqual(1);
        const symbols = quotes.map((q) => q.symbol);
        expect(symbols).toContain("BTC");
      });
    });

    describe("Error Handling", () => {
      it("debería lanzar error con símbolo inválido", async () => {
        try {
          await getQuotesBySymbol(["INVALID_SYMBOL_XYZ123"]);
          // Si no lanza error, el test falla
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error.message).toContain("CoinMarketCap API error");
        }
      });
    });
  } else {
    describe("API Key Missing", () => {
      it("debería indicar que la API key no está configurada", () => {
        console.warn("COINMARKETCAP_API_KEY no está configurada. Saltando tests de API.");
        expect(apiKeyConfigured).toBe(false);
      });
    });
  }
});
