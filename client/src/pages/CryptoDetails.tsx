import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, AlertCircle, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useState } from "react";
import PriceChart from "@/components/PriceChart";
import TechnicalIndicatorsChart from "@/components/TechnicalIndicatorsChart";
import TrendAnalysisChart from "@/components/TrendAnalysisChart";
import VolumeChart from "@/components/VolumeChart";

export default function CryptoDetails() {
  const { symbol } = useParams<{ symbol: string }>();
  const { user, isAuthenticated } = useAuth();
  const [alertPrice, setAlertPrice] = useState("");
  const [alertType, setAlertType] = useState<"above" | "below">("above");

  // Obtener detalles de la criptomoneda
  const { data: details, isLoading } = trpc.crypto.details.useQuery(
    { symbol: symbol || "" },
    { enabled: !!symbol }
  );

  // Crear alerta
  const createAlertMutation = trpc.alerts.create.useMutation({
    onSuccess: () => {
      setAlertPrice("");
      alert("Alerta creada exitosamente");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleCreateAlert = () => {
    if (!alertPrice || !details) return;

    createAlertMutation.mutate({
      cryptocurrencyId: details.id,
      targetPrice: alertPrice,
      alertType,
    });
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "strong_buy":
        return "bg-green-500 text-white";
      case "buy":
        return "bg-green-400 text-white";
      case "hold":
        return "bg-yellow-500 text-white";
      case "sell":
        return "bg-orange-500 text-white";
      case "strong_sell":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Cargando detalles...</div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Link href="/">
          <Button variant="ghost" className="text-blue-400 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="text-white text-center">Criptomoneda no encontrada</div>
      </div>
    );
  }

  const score = details.latestScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" className="text-blue-400 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{details.name}</h1>
              <p className="text-slate-400">{details.symbol}</p>
            </div>
            {score && (
              <Badge className={getRecommendationColor(score.recommendation)}>
                {score.recommendation.replace("_", " ").toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Capitalización</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                ${details.marketCap ? Number(details.marketCap).toLocaleString() : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Volumen 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                ${details.volume24h ? Number(details.volume24h).toLocaleString() : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Dominancia</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {details.dominance ? Number(details.dominance).toFixed(2) : "N/A"}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Score General</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">
                {score ? Number(score.overallScore || 0).toFixed(0) : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="indicators" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="indicators" className="text-slate-300">
              Indicadores
            </TabsTrigger>
            <TabsTrigger value="scores" className="text-slate-300">
              Scores
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-slate-300">
              Alertas
            </TabsTrigger>
          </TabsList>

          {/* Indicators Tab */}
          <TabsContent value="indicators">
            <div className="space-y-6">
              {/* Gráficos Interactivos */}
              {details.priceHistory && details.priceHistory.length > 0 && (
                <>
                  <PriceChart
                    data={details.priceHistory.map((p: any) => ({
                      timestamp: p.timestamp,
                      open: Number(p.open),
                      high: Number(p.high),
                      low: Number(p.low),
                      close: Number(p.close),
                      volume: Number(p.volume),
                    }))}
                    symbol={details.symbol}
                    title="Historial de Precios"
                  />
                  <VolumeChart
                    data={details.priceHistory.map((p: any) => ({
                      timestamp: p.timestamp,
                      volume: Number(p.volume),
                      close: Number(p.close),
                    }))}
                    symbol={details.symbol}
                  />
                  <TrendAnalysisChart
                    data={details.priceHistory.map((p: any) => ({
                      timestamp: p.timestamp,
                      price: Number(p.close),
                      sma20: details.indicators?.sma20 ? Number(details.indicators.sma20) : 0,
                      sma50: details.indicators?.sma50 ? Number(details.indicators.sma50) : 0,
                      sma200: details.indicators?.sma200 ? Number(details.indicators.sma200) : 0,
                      trend: "neutral" as const,
                    }))}
                    symbol={details.symbol}
                  />
                </>
              )}
            </div>

            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Indicadores Técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                {details.indicators ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-semibold mb-3">RSI (14)</h3>
                      <div className="bg-slate-700 rounded p-4">
                        <p className="text-2xl font-bold text-blue-400">
                          {Number(details.indicators.rsi14 || 0).toFixed(2)}
                        </p>
                        <p className="text-slate-400 text-sm mt-2">
                          {Number(details.indicators.rsi14 || 0) > 70
                            ? "⚠️ Sobrecompra"
                            : Number(details.indicators.rsi14 || 0) < 30
                            ? "✅ Sobreventa"
                            : "Neutral"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-3">MACD</h3>
                      <div className="bg-slate-700 rounded p-4">
                        <p className="text-sm text-slate-300">
                          Valor: <span className="text-blue-400 font-mono">{Number(details.indicators.macdValue || 0).toFixed(6)}</span>
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          Señal: <span className="text-blue-400 font-mono">{Number(details.indicators.macdSignal || 0).toFixed(6)}</span>
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          Histograma: <span className="text-blue-400 font-mono">{Number(details.indicators.macdHistogram || 0).toFixed(6)}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-3">Medias Móviles</h3>
                      <div className="bg-slate-700 rounded p-4 space-y-2">
                        <p className="text-sm text-slate-300">
                          SMA20: <span className="text-green-400 font-mono">${Number(details.indicators.sma20 || 0).toFixed(8)}</span>
                        </p>
                        <p className="text-sm text-slate-300">
                          SMA50: <span className="text-yellow-400 font-mono">${Number(details.indicators.sma50 || 0).toFixed(8)}</span>
                        </p>
                        <p className="text-sm text-slate-300">
                          SMA200: <span className="text-orange-400 font-mono">${Number(details.indicators.sma200 || 0).toFixed(8)}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-3">Bandas de Bollinger</h3>
                      <div className="bg-slate-700 rounded p-4 space-y-2">
                        <p className="text-sm text-slate-300">
                          Superior: <span className="text-red-400 font-mono">${Number(details.indicators.bollingerUpper || 0).toFixed(8)}</span>
                        </p>
                        <p className="text-sm text-slate-300">
                          Media: <span className="text-blue-400 font-mono">${Number(details.indicators.bollingerMiddle || 0).toFixed(8)}</span>
                        </p>
                        <p className="text-sm text-slate-300">
                          Inferior: <span className="text-green-400 font-mono">${Number(details.indicators.bollingerLower || 0).toFixed(8)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">No hay indicadores disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scores Tab */}
          <TabsContent value="scores">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Scores de Inversión</CardTitle>
              </CardHeader>
              <CardContent>
                {score ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-700 rounded p-4">
                        <p className="text-slate-300 text-sm mb-2">Score Técnico</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-blue-400">
                            {Number(score.technicalScore || 0).toFixed(0)}
                          </span>
                          <span className="text-slate-400">/100</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded h-2 mt-3">
                          <div
                            className="bg-blue-500 h-full rounded"
                            style={{ width: `${Number(score.technicalScore || 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded p-4">
                        <p className="text-slate-300 text-sm mb-2">Score de Momentum</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-green-400">
                            {Number(score.momentumScore || 0).toFixed(0)}
                          </span>
                          <span className="text-slate-400">/100</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded h-2 mt-3">
                          <div
                            className="bg-green-500 h-full rounded"
                            style={{ width: `${Number(score.momentumScore || 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded p-4">
                        <p className="text-slate-300 text-sm mb-2">Score de Volatilidad</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-yellow-400">
                            {Number(score.volatilityScore || 0).toFixed(0)}
                          </span>
                          <span className="text-slate-400">/100</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded h-2 mt-3">
                          <div
                            className="bg-yellow-500 h-full rounded"
                            style={{ width: `${Number(score.volatilityScore || 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded p-4">
                        <p className="text-slate-300 text-sm mb-2">Score de Riesgo</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-red-400">
                            {Number(score.riskScore || 0).toFixed(0)}
                          </span>
                          <span className="text-slate-400">/100</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded h-2 mt-3">
                          <div
                            className="bg-red-500 h-full rounded"
                            style={{ width: `${Number(score.riskScore || 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>


                  </div>
                ) : (
                  <p className="text-slate-400">No hay scores disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            {isAuthenticated ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Crear Alerta de Precio</CardTitle>
                  <CardDescription className="text-slate-400">
                    Recibe notificaciones cuando el precio alcance tu objetivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Precio Objetivo
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={alertPrice}
                        onChange={(e) => setAlertPrice(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                        step="0.00000001"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Tipo de Alerta
                      </label>
                      <select
                        value={alertType}
                        onChange={(e) => setAlertType(e.target.value as "above" | "below")}
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                      >
                        <option value="above">Cuando suba a</option>
                        <option value="below">Cuando baje a</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={handleCreateAlert}
                        disabled={!alertPrice || createAlertMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {createAlertMutation.isPending ? "Creando..." : "Crear Alerta"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-slate-300">Inicia sesión para crear alertas de precio</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
