import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { Card } from "@/components/ui/card";

export interface PriceData {
  timestamp: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  data: PriceData[];
  symbol: string;
  title?: string;
  height?: number;
}

/**
 * Componente de gráfico OHLC (Open, High, Low, Close) interactivo
 * Muestra el historial de precios de una criptomoneda
 */
export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  symbol,
  title = "Historial de Precios",
  height = 500,
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Convertir datos para Plotly
    const timestamps = data.map((d) =>
      typeof d.timestamp === "string" ? d.timestamp : d.timestamp.toISOString()
    );
    const opens = data.map((d) => Number(d.open));
    const highs = data.map((d) => Number(d.high));
    const lows = data.map((d) => Number(d.low));
    const closes = data.map((d) => Number(d.close));

    return ([
      {
        x: timestamps,
        open: opens,
        high: highs,
        low: lows,
        close: closes,
        type: "candlestick",
        name: `${symbol} Precio`,
      },
    ] as any);
  }, [data, symbol]);

  const layout: any = {
    title: { text: `${title} - ${symbol}` },
    xaxis: {
      title: "Fecha",
      rangeslider: { visible: false },
    },
    yaxis: {
      title: "Precio (USD)",
    },
    hovermode: "x unified",
    margin: { t: 40, r: 20, b: 40, l: 60 },
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No hay datos de precios disponibles</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Plot
        data={chartData}
        layout={layout}
        style={{ width: "100%", height: `${height}px` }}
        config={{ responsive: true, displayModeBar: true }}
      />
    </Card>
  );
};

export default PriceChart;
