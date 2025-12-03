import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Zap, AlertCircle, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener lista de criptomonedas
  const { data: cryptoList, isLoading: cryptoLoading } = trpc.crypto.list.useQuery();

  // Obtener top scores
  const { data: topScores } = trpc.analysis.topScores.useQuery();

  // Filtrar criptomonedas según búsqueda
  const filteredCryptos = useMemo(() => {
    if (!cryptoList) return [];
    return cryptoList.filter(
      (crypto) =>
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cryptoList, searchTerm]);

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

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-yellow-600";
    if (score >= 25) return "text-orange-600";
    return "text-red-600";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">{APP_TITLE}</h1>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <span className="text-slate-300">{user?.name}</span>
                <Link href="/portfolio">
                  <Button variant="outline" size="sm">
                    Mi Portafolio
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-300">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-slate-300">
              Análisis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Input
                placeholder="Buscar criptomoneda (ej: Bitcoin, BTC)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
              />
              <Zap className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            </div>

            {/* Top Recommendations */}
            {topScores && topScores.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Top Recomendaciones
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Mejores oportunidades de inversión según análisis técnico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topScores.slice(0, 6).map((score) => (
                      <Link key={score.id} href={`/crypto/${score.cryptocurrencyId}`}>
                        <div className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition cursor-pointer border border-slate-600">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-white font-semibold">Crypto #{score.cryptocurrencyId}</h3>
                              <p className="text-slate-400 text-sm">Score: {Number(score.overallScore || 0).toFixed(1)}</p>
                            </div>
                            <Badge className={getRecommendationColor(score.recommendation)}>
                              {score.recommendation.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-slate-300">
                              Técnico: <span className={getScoreColor(Number(score.technicalScore || 0))}>{Number(score.technicalScore || 0).toFixed(0)}</span>
                            </p>
                            <p className="text-slate-300">
                              Riesgo: <span className="text-orange-500">{Number(score.riskScore || 0).toFixed(0)}</span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cryptocurrencies List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Criptomonedas Disponibles</CardTitle>
                <CardDescription className="text-slate-400">
                  {filteredCryptos.length} criptomonedas encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cryptoLoading ? (
                  <div className="text-slate-400 text-center py-8">Cargando criptomonedas...</div>
                ) : filteredCryptos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Nombre</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Cap. Mercado</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Volumen 24h</th>
                          <th className="text-right py-3 px-4 text-slate-300 font-semibold">Score</th>
                          <th className="text-center py-3 px-4 text-slate-300 font-semibold">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCryptos.slice(0, 20).map((crypto) => (
                          <tr key={crypto.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-white font-medium">{crypto.name}</p>
                                <p className="text-slate-400 text-xs">{crypto.symbol}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-300">
                              ${crypto.marketCap ? Number(crypto.marketCap).toLocaleString() : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-right text-slate-300">
                              ${crypto.volume24h ? Number(crypto.volume24h).toLocaleString() : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {crypto.latestScore ? (
                                <span className={`font-semibold ${getScoreColor(Number(crypto.latestScore.overallScore || 0))}`}>
                                  {Number(crypto.latestScore.overallScore || 0).toFixed(0)}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Link href={`/crypto/${crypto.id}`}>
                                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                  Ver Análisis
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No se encontraron criptomonedas
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Cómo Funciona el Análisis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <div>
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Indicadores Técnicos
                  </h3>
                  <p className="text-sm">
                    Utilizamos RSI, MACD, Bandas de Bollinger y Medias Móviles para identificar tendencias y puntos de entrada/salida óptimos.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Scoring de Inversión
                  </h3>
                  <p className="text-sm">
                    Combinamos análisis técnico, momentum, volatilidad y riesgo para generar un score integral (0-100) y recomendaciones.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Gestión de Riesgo
                  </h3>
                  <p className="text-sm">
                    Evaluamos volatilidad, capitalización de mercado y volumen de trading para identificar activos de mayor riesgo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
