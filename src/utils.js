/*
 * Utility functions
 */

/**
 * Calculates uniform distribution
 * @param Array of min/max values
 * @returns {number} In range [min,max]
 */
export function uniform(minmax: Array) {
  return minmax[0] +
    Math.random() * (minmax[1] - minmax[0]);
}

export function l(msg) {
  console.info(msg);
}