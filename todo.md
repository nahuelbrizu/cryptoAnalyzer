# Crypto Investment Analyzer - TODO

## Core Features
- [x] Integración con API de datos de criptomonedas (CoinMarketCap o similar)
- [x] Obtención de datos históricos y en tiempo real
- [x] Almacenamiento de datos de criptomonedas en base de datos
- [x] Algoritmos de análisis técnico (RSI, MACD, Bandas de Bollinger, SMA)
- [x] Algoritmo de scoring de inversión (evaluación de riesgo/recompensa)
- [x] Sistema de recomendaciones personalizadas

## Frontend
- [x] Dashboard principal con lista de criptomonedas
- [ ] Gráficos de precios históricos
- [x] Indicadores técnicos visuales
- [x] Tabla de análisis comparativo
- [x] Panel de recomendaciones
- [x] Filtros y búsqueda de criptomonedas
- [x] Sistema de alertas de precio

## Backend
- [x] Procedimiento para obtener lista de criptomonedas
- [x] Procedimiento para obtener datos históricos
- [x] Procedimiento para calcular indicadores técnicos
- [x] Procedimiento para generar scoring de inversión
- [x] Procedimiento para obtener recomendaciones
- [ ] Scheduler para actualizar datos periódicamente

## Testing
- [x] Tests para algoritmos de análisis técnico
- [ ] Tests para procedimientos de tRPC
- [ ] Tests para cálculo de scoring

## Deployment
- [x] Checkpoint inicial
- [ ] Publicación de la aplicación

## Próximas Mejoras
- [ ] Integración real con API CoinMarketCap
- [ ] Gráficos interactivos con Chart.js o Plotly
- [ ] Notificaciones en tiempo real
- [ ] Exportar portafolio a PDF
- [ ] Análisis histórico de decisiones


## Integración CoinMarketCap (Completado)
- [x] Obtener y configurar API key de CoinMarketCap
- [x] Crear servicio de sincronización con CoinMarketCap API
- [x] Implementar procedimiento para obtener lista de criptomonedas
- [x] Implementar procedimiento para obtener datos históricos
- [x] Crear scheduler para actualizar datos periódicamente
- [x] Implementar cálculo automático de indicadores técnicos
- [x] Implementar cálculo automático de scores de inversión
- [x] Validar y probar sincronización de datos


## Gráficos Interactivos con Plotly (Completado)
- [x] Instalar dependencias de Plotly (react-plotly.js)
- [x] Crear componente de gráfico de precios OHLC
- [x] Crear componente de gráfico de indicadores técnicos
- [x] Crear componente de gráfico de análisis de tendencias
- [x] Crear componente de gráfico de volumen
- [x] Integrar gráficos en página de detalles de criptomoneda
- [x] Implementar actualización automática de gráficos
- [x] Probar gráficos interactivos
