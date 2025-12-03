/**
 * Servicio de integración con CoinMarketCap API
 * Obtiene datos en tiempo real de criptomonedas
 */

import { ENV } from './_core/env';

const CMC_API_BASE = 'https://pro-api.coinmarketcap.com/v1';

export interface CMCCryptocurrency {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[];
  max_supply: number | null;
  circulating_supply: number;
  total_supply: number;
  platform: any;
  cmc_rank: number;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  quote: {
    [currency: string]: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_60d: number;
      percent_change_90d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      tvl: number | null;
      last_updated: string;
    };
  };
}

export interface CMCListingsResponse {
  data: CMCCryptocurrency[];
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
}

export interface CMCQuotesResponse {
  data: {
    [id: string]: CMCCryptocurrency;
  };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
}

/**
 * Obtiene lista de criptomonedas con datos actuales
 */
export async function getLatestListings(
  limit: number = 100,
  currency: string = 'USD'
): Promise<CMCCryptocurrency[]> {
  if (!ENV.coinmarketcapApiKey) {
    throw new Error('COINMARKETCAP_API_KEY no está configurada');
  }

  try {
    const url = new URL(`${CMC_API_BASE}/cryptocurrency/listings/latest`);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('convert', currency);
    url.searchParams.append('sort', 'market_cap');
    url.searchParams.append('sort_dir', 'desc');

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': ENV.coinmarketcapApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`CoinMarketCap API error: ${error.status?.error_message || response.statusText}`);
    }

    const data: CMCListingsResponse = await response.json();

    if (data.status.error_code !== 0) {
      throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
    }

    return data.data;
  } catch (error) {
    console.error('[CoinMarketCap] Error fetching listings:', error);
    throw error;
  }
}

/**
 * Obtiene datos de criptomonedas específicas por ID
 */
export async function getQuotesById(
  ids: number[],
  currency: string = 'USD'
): Promise<CMCCryptocurrency[]> {
  if (!ENV.coinmarketcapApiKey) {
    throw new Error('COINMARKETCAP_API_KEY no está configurada');
  }

  try {
    const url = new URL(`${CMC_API_BASE}/cryptocurrency/quotes/latest`);
    url.searchParams.append('id', ids.join(','));
    url.searchParams.append('convert', currency);

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': ENV.coinmarketcapApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`CoinMarketCap API error: ${error.status?.error_message || response.statusText}`);
    }

    const data: CMCQuotesResponse = await response.json();

    if (data.status.error_code !== 0) {
      throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
    }

    return Object.values(data.data);
  } catch (error) {
    console.error('[CoinMarketCap] Error fetching quotes:', error);
    throw error;
  }
}

/**
 * Obtiene datos de criptomonedas específicas por símbolo
 */
export async function getQuotesBySymbol(
  symbols: string[],
  currency: string = 'USD'
): Promise<CMCCryptocurrency[]> {
  if (!ENV.coinmarketcapApiKey) {
    throw new Error('COINMARKETCAP_API_KEY no está configurada');
  }

  try {
    const url = new URL(`${CMC_API_BASE}/cryptocurrency/quotes/latest`);
    url.searchParams.append('symbol', symbols.join(','));
    url.searchParams.append('convert', currency);

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': ENV.coinmarketcapApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`CoinMarketCap API error: ${error.status?.error_message || response.statusText}`);
    }

    const data: CMCQuotesResponse = await response.json();

    if (data.status.error_code !== 0) {
      throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
    }

    return Object.values(data.data);
  } catch (error) {
    console.error('[CoinMarketCap] Error fetching quotes:', error);
    throw error;
  }
}

/**
 * Obtiene información de una criptomoneda específica
 */
export async function getMetadata(ids: number[]): Promise<any> {
  if (!ENV.coinmarketcapApiKey) {
    throw new Error('COINMARKETCAP_API_KEY no está configurada');
  }

  try {
    const url = new URL(`${CMC_API_BASE}/cryptocurrency/info`);
    url.searchParams.append('id', ids.join(','));

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': ENV.coinmarketcapApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`CoinMarketCap API error: ${error.status?.error_message || response.statusText}`);
    }

    const data = await response.json();

    if (data.status.error_code !== 0) {
      throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
    }

    return data.data;
  } catch (error) {
    console.error('[CoinMarketCap] Error fetching metadata:', error);
    throw error;
  }
}

/**
 * Obtiene datos históricos de precios (OHLCV)
 * Nota: Requiere plan de pago en CoinMarketCap
 */
export async function getHistoricalData(
  id: number,
  timeStart?: Date,
  timeEnd?: Date,
  interval: string = 'daily'
): Promise<any> {
  if (!ENV.coinmarketcapApiKey) {
    throw new Error('COINMARKETCAP_API_KEY no está configurada');
  }

  try {
    const url = new URL(`${CMC_API_BASE}/cryptocurrency/ohlcv/historical`);
    url.searchParams.append('id', id.toString());
    url.searchParams.append('convert', 'USD');
    url.searchParams.append('interval', interval);

    if (timeStart) {
      url.searchParams.append('time_start', Math.floor(timeStart.getTime() / 1000).toString());
    }

    if (timeEnd) {
      url.searchParams.append('time_end', Math.floor(timeEnd.getTime() / 1000).toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': ENV.coinmarketcapApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`CoinMarketCap API error: ${error.status?.error_message || response.statusText}`);
    }

    const data = await response.json();

    if (data.status.error_code !== 0) {
      throw new Error(`CoinMarketCap API error: ${data.status.error_message}`);
    }

    return data.data;
  } catch (error) {
    console.error('[CoinMarketCap] Error fetching historical data:', error);
    throw error;
  }
}
