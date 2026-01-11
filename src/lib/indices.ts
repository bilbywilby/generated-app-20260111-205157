/**
 * Defined item baskets for calculating Market Indices.
 */
export const MARKET_BASKETS = {
  Rune: [563, 560, 562, 565, 566, 561, 554, 555, 556, 557], // Law, Death, Chaos, Blood, Soul, Nature, Fire, Water, Air, Earth
  Logs: [1521, 1515, 1517, 1513, 19669, 1519, 1521], // Oak, Yew, Maple, Magic, Redwood, Willow, Oak
  Food: [379, 383, 3144, 385, 391, 7946, 373], // Lobster, Shark, Karambwan, Manta Ray, Anglerfish, Monkfish, Swordfish
  Metals: [453, 451, 447, 449, 444, 440, 442], // Coal, Runite, Mithril, Adamantite, Gold, Iron, Silver
  Herbs: [207, 2481, 209, 211, 213, 215, 217, 219], // Ranarr, Lantadyme, Toadflax, Irit, Avantoe, Kwuarm, Cadantine, Dwarf Weed
  Bossing: [20997, 22486, 27275, 22323, 12817, 13652, 21003], // T-Bow, Scythe, Shadow, Sanguinesti, Elysian, DWH, Elder Maul
  Common: [561, 453, 1515, 383, 207, 231, 2353, 1777], // High liquidity essentials
  HighVol: [561, 554, 555, 556, 453, 2, 229, 314], // Highest trade counts
};
export type BasketCategory = keyof typeof MARKET_BASKETS;