import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { Card } from "@/components/ui/card";

export interface VolumeData {
  timestamp: string | Date;
  volume: number;
  close: number;
}

interface VolumeChartProps {
  data: VolumeData[];
  symbol: string;
  height?: number;
}

/**
 * Componente que muestra el volumen de trading
 */
export const VolumeChart: React.FC<VolumeChartProps> = ({
  data,
  symbol,
  height = 300,
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
        y: data.map((d) => Number(d.volume)),
        name: "Volumen",
        type: "bar",
        marker: {
          color: data.map((d) => {
            const close = Number(d.close);
            return close > 0 ? "#10b981" : "#ef4444";
          }),
        },
      },
    ] as any);
  }, [data]);

  const layout: any = {
    title: { text: `Volumen de Trading - ${symbol}` },
    xaxis: {
      title: "Fecha",
    },
    yaxis: {
      title: "Volumen (USD)",
    },
    hovermode: "x unified",
    margin: { t: 40, r: 20, b: 40, l: 60 },
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No hay datos de volumen disponibles</p>
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

export default VolumeChart;
