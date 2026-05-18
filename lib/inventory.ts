/**
 * Convierte una cantidad a unidad base.
 *
 * Ejemplo:
 * 2 cajas * 12 = 24 unidades
 */
export function convertToBase(quantity: number, quantityInBase: number) {
  return quantity * quantityInBase;
}

/**
 * Calcula costo promedio ponderado.
 *
 * Fórmula:
 * ((stockActual * costoAnterior) + (cantidadNueva * costoNuevo))
 * / (stockActual + cantidadNueva)
 */
export function calculateWeightedAverageCost({
  currentStock,
  currentAverageCost,
  incomingQuantity,
  incomingCost,
}: {
  currentStock: number;
  currentAverageCost: number;
  incomingQuantity: number;
  incomingCost: number;
}) {
  const totalCurrentValue = currentStock * currentAverageCost;
  const totalIncomingValue = incomingQuantity * incomingCost;

  const newStock = currentStock + incomingQuantity;

  if (newStock <= 0) {
    return 0;
  }

  return (totalCurrentValue + totalIncomingValue) / newStock;
}

export function calculateInventoryValue(stock: number, avgCost: number) {
  return stock * avgCost;
}
