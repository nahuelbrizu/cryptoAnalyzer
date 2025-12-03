import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { Card } from "@/components/ui/card";

export interface TrendData {
  timestamp: string | Date;
  price: number;
  sma20: number;
  sma50: number;
  sma200: number;
  trend: "uptrend" | "downtrend" | "neutral";
}

interface TrendAnalysisChartProps {
  data: TrendData[];
  symbol: string;
  height?: number;
}

/**
 * Componente que muestra análisis de tendencias con medias móviles
 */
export const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({
  data,
  symbol,
  height = 500,
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const timestamps = data.map((d) =>
      typeof d.timestamp === "string" ? d.timestamp : d.timestamp.toISOString()
    );

    return ([
      {
        x: timestamps,
        y: data.map((d) => Number(d.price)),
        name: `${symbol} Precio`,
        type: "scatter",
        mode: "lines",
        line: { color: "#3b82f6", width: 2 },
      },
      {
        x: timestamps,
        y: data.map((d) => Number(d.sma20)),
        name: "SMA 20",
        type: "scatter",
        mode: "lines",
        line: { color: "#f59e0b", width: 2 },
      },
      {
        x: timestamps,
        y: data.map((d) => Number(d.sma50)),
        name: "SMA 50",
        type: "scatter",
        mode: "lines",
        line: { color: "#10b981", width: 2 },
      },
      {
        x: timestamps,
        y: data.map((d) => Number(d.sma200)),
        name: "SMA 200",
        type: "scatter",
        mode: "lines",
        line: { color: "#ef4444", width: 2 },
      },
    ] as any);
  }, [data, symbol]);

  const layout: any = {
    title: { text: `Análisis de Tendencias - ${symbol}` },
    xaxis: {
      title: "Fecha",
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
        <p className="text-center text-gray-500">No hay datos de tendencias disponibles</p>
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

export default TrendAnalysisChart;
