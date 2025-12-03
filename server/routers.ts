import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllCryptocurrencies,
  getCryptocurrencyBySymbol,
  getLatestIndicators,
  getLatestScores,
  getPriceHistory,
  getUserAlerts,
  getUserPortfolio,
  createPriceAlert,
  upsertPortfolioItem,
} from "./db";
import { syncCryptocurrencies } from "./syncService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Cryptocurrency Routers ============
  crypto: router({
    /**
     * Obtiene lista de todas las criptomonedas con sus scores más recientes
     */
    list: publicProcedure.query(async () => {
      const cryptos = await getAllCryptocurrencies();
      const scores = await getLatestScores();

      // Crear un mapa de scores para búsqueda rápida
      const scoreMap = new Map(scores.map(s => [s.cryptocurrencyId, s]));

      return cryptos.map(crypto => {
        const score = scoreMap.get(crypto.id);
        return {
          ...crypto,
          latestScore: score || null,
        };
      });
    }),

    /**
     * Obtiene detalles de una criptomoneda específica
     */
    details: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        const crypto = await getCryptocurrencyBySymbol(input.symbol);
        if (!crypto) {
          throw new Error(`Cryptocurrency ${input.symbol} not found`);
        }

        const indicators = await getLatestIndicators(crypto.id);
        const priceHistory = await getPriceHistory(crypto.id, 100);
        const scores = await getLatestScores();
        const latestScore = scores.find(s => s.cryptocurrencyId === crypto.id);

        return {
          ...crypto,
          indicators,
          priceHistory,
          latestScore,
        };
      }),

    /**
     * Obtiene el historial de precios de una criptomoneda
     */
    priceHistory: publicProcedure
      .input(z.object({ symbol: z.string(), limit: z.number().default(100) }))
      .query(async ({ input }) => {
        const crypto = await getCryptocurrencyBySymbol(input.symbol);
        if (!crypto) {
          throw new Error(`Cryptocurrency ${input.symbol} not found`);
        }

        return getPriceHistory(crypto.id, input.limit);
      }),

    /**
     * Obtiene los indicadores técnicos más recientes
     */
    indicators: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        const crypto = await getCryptocurrencyBySymbol(input.symbol);
        if (!crypto) {
          throw new Error(`Cryptocurrency ${input.symbol} not found`);
        }

        return getLatestIndicators(crypto.id);
      }),
  }),

  // ============ Analysis Routers ============
  analysis: router({
    /**
     * Obtiene los scores de inversión más recientes
     */
    topScores: publicProcedure.query(async () => {
      const scores = await getLatestScores();
      // Filtrar por recomendación y ordenar
      return scores
        .filter(s => ["strong_buy", "buy"].includes(s.recommendation))
        .sort((a, b) => {
          const scoreB = Number(b.overallScore || 0);
          const scoreA = Number(a.overallScore || 0);
          return scoreB - scoreA;
        })
        .slice(0, 20);
    }),

    /**
     * Obtiene análisis detallado de una criptomoneda
     */
    detailed: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        const crypto = await getCryptocurrencyBySymbol(input.symbol);
        if (!crypto) {
          throw new Error(`Cryptocurrency ${input.symbol} not found`);
        }

        const indicators = await getLatestIndicators(crypto.id);
        const priceHistory = await getPriceHistory(crypto.id, 100);
        const scores = await getLatestScores();
        const latestScore = scores.find(s => s.cryptocurrencyId === crypto.id);

        return {
          crypto,
          indicators,
          priceHistory,
          latestScore,
        };
      }),
  }),

  // ============ User Portfolio & Alerts ============
  portfolio: router({
    /**
     * Obtiene el portafolio del usuario
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const portfolio = await getUserPortfolio(ctx.user.id);

      // Enriquecer con datos actuales
      const enriched = await Promise.all(
        portfolio.map(async (item) => {
          const scores = await getLatestScores();
          const score = scores.find(s => s.cryptocurrencyId === item.cryptocurrencyId);
          return {
            ...item,
            latestScore: score || null,
          };
        })
      );

      return enriched;
    }),

    /**
     * Agrega o actualiza un item en el portafolio
     */
    upsert: protectedProcedure
      .input(
        z.object({
          cryptocurrencyId: z.number(),
          quantity: z.string(),
          averageBuyPrice: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await upsertPortfolioItem({
          userId: ctx.user.id,
          cryptocurrencyId: input.cryptocurrencyId,
          quantity: input.quantity as any,
          averageBuyPrice: input.averageBuyPrice as any,
        });

        return result;
      }),
  }),

  alerts: router({
    /**
     * Obtiene las alertas de precio del usuario
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserAlerts(ctx.user.id);
    }),

    /**
     * Crea una nueva alerta de precio
     */
    create: protectedProcedure
      .input(
        z.object({
          cryptocurrencyId: z.number(),
          targetPrice: z.string(),
          alertType: z.enum(["above", "below"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createPriceAlert({
          userId: ctx.user.id,
          cryptocurrencyId: input.cryptocurrencyId,
          targetPrice: input.targetPrice as any,
          alertType: input.alertType,
          isActive: true,
        });

        return result;
      }),
  }),

  // ============ Synchronization Routers ============
  sync: router({
    /**
     * Sincroniza datos de criptomonedas desde CoinMarketCap
     * Solo disponible para administradores
     */
    syncNow: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Solo administradores pueden sincronizar datos");
      }

      try {
        const result = await syncCryptocurrencies(100);
        return {
          success: result.success,
          message: `Sincronizacion completada: ${result.cryptosUpdated} criptomonedas actualizadas, ${result.pricesInserted} precios insertados, ${result.indicatorsCalculated} indicadores calculados, ${result.scoresCalculated} scores calculados`,
          details: result,
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Error en sincronizacion: ${errorMsg}`);
      }
    }),

    /**
     * Obtiene el estado de la ultima sincronizacion
     */
    status: publicProcedure.query(async () => {
      const cryptos = await getAllCryptocurrencies();
      const scores = await getLatestScores();

      return {
        totalCryptocurrencies: cryptos.length,
        totalScores: scores.length,
        lastUpdate: cryptos.length > 0 ? cryptos[0].lastUpdated : null,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
