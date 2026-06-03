const CONVERSIONS = {
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
 * Converts quantity in fromUnit to base unit quantity
 * @param {number} quantity 
 * @param {string} fromUnit 
 * @returns {number}
 */
function toBaseQuantity(quantity, fromUnit) {
  if (!CONVERSIONS[fromUnit]) {
    throw new Error(`Unknown unit: ${fromUnit}`);
  }
  return quantity * CONVERSIONS[fromUnit].toBase;
}

/**
 * Converts base quantity to display unit
 * @param {number} baseQuantity 
 * @param {string} toUnit 
 * @returns {number}
 */
function fromBaseQuantity(baseQuantity, toUnit) {
  if (!CONVERSIONS[toUnit]) {
    throw new Error(`Unknown unit: ${toUnit}`);
  }
  return baseQuantity / CONVERSIONS[toUnit].toBase;
}

/**
 * Given price per base unit, returns price per targetUnit
 * @param {number} basePricePerUnit 
 * @param {string} targetUnit 
 * @returns {number}
 */
function getPricePerUnit(basePricePerUnit, targetUnit) {
  if (!CONVERSIONS[targetUnit]) {
    throw new Error(`Unknown unit: ${targetUnit}`);
  }
  return basePricePerUnit * CONVERSIONS[targetUnit].toBase;
}

/**
 * Given a base_unit, returns array of units the seller can ORDER in
 * @param {string} baseUnit 
 * @returns {string[]}
 */
function getCompatibleUnits(baseUnit) {
  if (baseUnit === 'g') return ['g', 'kg'];
  if (baseUnit === 'mL') return ['mL', 'L'];
  if (baseUnit === 'item') return ['item'];
  return [baseUnit];
}

/**
 * Calculates line total returning base quantity, unit price, and line total with 6 decimal precision
 * @param {number} orderedQty 
 * @param {string} orderedUnit 
 * @param {number} basePricePerUnit 
 * @returns {{baseQuantity: number, unitPrice: number, lineTotal: number}}
 */
function calculateLineTotal(orderedQty, orderedUnit, basePricePerUnit) {
  const baseQuantity = toBaseQuantity(orderedQty, orderedUnit);
  const unitPrice = getPricePerUnit(basePricePerUnit, orderedUnit);
  const lineTotal = orderedQty * unitPrice;

  return {
    baseQuantity: Number(baseQuantity.toFixed(6)),
    unitPrice: Number(unitPrice.toFixed(6)),
    lineTotal: Number(lineTotal.toFixed(6))
  };
}

module.exports = {
  CONVERSIONS,
  toBaseQuantity,
  fromBaseQuantity,
  getPricePerUnit,
  getCompatibleUnits,
  calculateLineTotal
};
