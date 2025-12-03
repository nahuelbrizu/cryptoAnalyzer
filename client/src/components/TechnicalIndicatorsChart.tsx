import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { Card } from "@/components/ui/card";

export interface IndicatorData {
  timestamp: string | Date;
  rsi14: number;
  macdValue: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  sma200: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  price: number;
}

interface TechnicalIndicatorsChartProps {
  data: IndicatorData[];
  symbol: string;
  height?: number;
}

/**
 * Componente que muestra indicadores técnicos: RSI, MACD y Bandas de Bollinger
 */
export const TechnicalIndicatorsChart: React.FC<TechnicalIndicatorsChartProps> = ({
  data,
  symbol,
  height = 600,
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const timestamps = data.map((d) =>
      typeof d.timestamp === "string" ? d.timestamp : d.timestamp.toISOString()
    );

    return ([
      // Precio con Bandas de Bollinger
      // Precio con Bandas de Bollinger
      {
        x: timestamps,
        y: data.map((d) => Number(d.price)),
        name: `${symbol} Precio`,
        type: "scatter",
        mode: "lines",
        line: { color: "#3b82f6", width: 2 },
        yaxis: "y1",
      },
      {
        x: timestamps,
        y: data.map((d) => Number(d.bollingerUpper)),
        name: "Banda Superior",
        type: "scatter",
        mode: "lines",
        line: { color: "#ef4444", width: 1, dash: "dash" },
        yaxis: "y1",
      },
      {
        x: timestamps,
        y: data.map((d) => Number(d.bollingerMiddle)),
        name: "SMA 20",
        type: "scatter",
        mode: "lines",
        line: { color: "#f59e0b", width: 1 },
        yaxis: "y1",
      },
      {
        x: timestamps,
        y: data.map((d) => Number(d.bollingerLower)),
        name: "Banda Inferior",
        type: "scatter",
        mode: "lines",
        line: { color: "#10b981", width: 1, dash: "dash" },
        yaxis: "y1",
      },
      // RSI
      {
        x: timestamps,
        y: data.map((d) => Number(d.rsi14)),
        name: "RSI (14)",
        type: "scatter",
        mode: "lines",
        line: { color: "#8b5cf6", width: 2 },
        yaxis: "y2",
      },
      // MACD
      {
        x: timestamps,
        y: data.map((d) => Number(d.macdValue)),
        name: "MACD",
        type: "scatter",
        mode: "lines",
        line: { color: "#06b6d4", width: 2 },
        yaxis: "y3",
      },
      {
        x: timestamps,
        y: data.map((d) => Number(d.macdSignal)),
        name: "Señal MACD",
        type: "scatter",
        mode: "lines",
        line: { color: "#ec4899", width: 1, dash: "dash" },
        yaxis: "y3",
      },
    ] as any);
  }, [data, symbol]);

  const layout: any = {
    title: { text: `Indicadores Técnicos - ${symbol}` },
    xaxis: {
      title: "Fecha",
      domain: [0, 1],
    },
    yaxis: {
      title: "Precio (USD)",
      domain: [0.55, 1],
    },
    yaxis2: {
      title: "RSI",
      domain: [0.3, 0.5],
      range: [0, 100],
    },
    yaxis3: {
      title: "MACD",
      domain: [0, 0.25],
    },
    hovermode: "x unified",
    margin: { t: 40, r: 20, b: 40, l: 60 },
  } as any;

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No hay datos de indicadores disponibles</p>
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

export default TechnicalIndicatorsChart;
