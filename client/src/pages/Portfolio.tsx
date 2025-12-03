import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function Portfolio() {
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  // Obtener portafolio del usuario
  const { data: portfolio, isLoading } = trpc.portfolio.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Obtener lista de criptomonedas para el selector
  const { data: cryptoList } = trpc.crypto.list.useQuery();

  const [selectedCryptoId, setSelectedCryptoId] = useState<number | null>(null);

  // Agregar item al portafolio
  const addItemMutation = trpc.portfolio.upsert.useMutation({
    onSuccess: () => {
      setQuantity("");
      setBuyPrice("");
      setSelectedCryptoId(null);
      setShowAddForm(false);
      alert("Item agregado al portafolio");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleAddItem = () => {
    if (!selectedCryptoId || !quantity || !buyPrice) {
      alert("Por favor completa todos los campos");
      return;
    }

    addItemMutation.mutate({
      cryptocurrencyId: selectedCryptoId,
      quantity,
      averageBuyPrice: buyPrice,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Link href="/">
          <Button variant="ghost" className="text-blue-400 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="text-white text-center">Por favor inicia sesión para ver tu portafolio</div>
      </div>
    );
  }

  const totalValue = portfolio?.reduce((sum, item) => {
    const currentPrice = item.latestScore ? 1 : 0; // Placeholder
    return sum + Number(item.quantity) * currentPrice;
  }, 0) || 0;

  const totalInvested = portfolio?.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.averageBuyPrice);
  }, 0) || 0;

  const gain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

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
          <h1 className="text-3xl font-bold text-white">Mi Portafolio</h1>
          <p className="text-slate-400">{user?.name}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Valor Total</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Invertido</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Ganancia/Pérdida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                  ${gain.toFixed(2)}
                </p>
                {gain >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className={`text-sm mt-1 ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                {gainPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Item Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Criptomoneda
          </Button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Agregar Criptomoneda al Portafolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Criptomoneda
                </label>
                <select
                  value={selectedCryptoId || ""}
                  onChange={(e) => setSelectedCryptoId(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="">Selecciona una criptomoneda</option>
                  {cryptoList?.map((crypto) => (
                    <option key={crypto.id} value={crypto.id}>
                      {crypto.name} ({crypto.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Cantidad
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00000000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    step="0.00000001"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Precio Promedio de Compra
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    step="0.00000001"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddItem}
                  disabled={addItemMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addItemMutation.isPending ? "Agregando..." : "Agregar"}
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Items */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Mis Inversiones</CardTitle>
            <CardDescription className="text-slate-400">
              {portfolio?.length || 0} criptomonedas en el portafolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-slate-400 text-center py-8">Cargando portafolio...</div>
            ) : portfolio && portfolio.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Criptomoneda</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Cantidad</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Precio Compra</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Inversión Total</th>
                      <th className="text-right py-3 px-4 text-slate-300 font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item) => {
                      const invested = Number(item.quantity) * Number(item.averageBuyPrice);
                      return (
                        <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                          <td className="py-3 px-4">
                            <p className="text-white font-medium">Crypto #{item.cryptocurrencyId}</p>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            {Number(item.quantity).toFixed(8)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            ${Number(item.averageBuyPrice).toFixed(8)}
                          </td>
                          <td className="py-3 px-4 text-right text-white font-semibold">
                            ${invested.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {item.latestScore ? (
                              <span className="text-green-400 font-semibold">
                                {Number(item.latestScore.overallScore || 0).toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-400 text-center py-8">
                No tienes criptomonedas en tu portafolio. ¡Agrega una!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
