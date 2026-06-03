export const CONVERSIONS = {
  // Weight — base unit is GRAMS (g)
  g:  { dimension: 'weight', toBase: 1 },
  kg: { dimension: 'weight', toBase: 1000 },

  // Volume — base unit is MILLILITERS (mL)
  mL: { dimension: 'volume', toBase: 1 },
  L:  { dimension: 'volume', toBase: 1000 },

  // Count — base unit is ITEM
  item: { dimension: 'count', toBase: 1 },
};

/**
 * Given a base_unit, returns array of units the seller can ORDER in
 * @param {string} baseUnit 
 * @returns {string[]}
 */
export function getCompatibleUnits(baseUnit) {
  if (baseUnit === 'g') return ['g', 'kg'];
  if (baseUnit === 'mL') return ['mL', 'L'];
  if (baseUnit === 'item') return ['item'];
  return [baseUnit];
}

/**
 * Given price per base unit, returns price per targetUnit
 * @param {number} basePricePerUnit 
 * @param {string} targetUnit 
 * @returns {number}
 */
export function getPricePerUnit(basePricePerUnit, targetUnit) {
  if (!CONVERSIONS[targetUnit]) {
    throw new Error(`Unknown unit: ${targetUnit}`);
  }
  return basePricePerUnit * CONVERSIONS[targetUnit].toBase;
}

/**
 * Calculates line total, unit price and base quantity
 * @param {number} orderedQuantity 
 * @param {string} orderedUnit 
 * @param {number} basePricePerUnit 
 * @returns {{baseQuantity: number, unitPrice: number, lineTotal: number}}
 */
export function calculateLineTotal(orderedQuantity, orderedUnit, basePricePerUnit) {
  const price = getPricePerUnit(basePricePerUnit, orderedUnit);
  const conversionFactor = CONVERSIONS[orderedUnit].toBase;
  const baseQuantity = orderedQuantity * conversionFactor;
  const lineTotal = orderedQuantity * price;
  return {
    baseQuantity,
    unitPrice: price,
    lineTotal
  };
}
