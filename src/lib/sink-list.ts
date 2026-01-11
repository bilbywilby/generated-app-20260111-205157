/**
 * Authoritative list of items subject to the Grand Exchange 'Item Sink' mechanism.
 * Jagex uses a percentage of GE tax to purchase and delete these items from the game.
 */
export interface SinkMetadata {
  id: number;
  name: string;
  category: 'Weapon' | 'Armour' | 'Accessory' | 'Misc';
}
export const ITEM_SINK_MAPPING: Record<number, SinkMetadata> = {
  // Melee Weapons
  20997: { id: 20997, name: 'Twisted bow', category: 'Weapon' },
  22486: { id: 22486, name: 'Scythe of vitur', category: 'Weapon' },
  21003: { id: 21003, name: 'Elder maul', category: 'Weapon' },
  21006: { id: 21006, name: 'Kodai wand', category: 'Weapon' },
  21015: { id: 21015, name: 'Dinh\'s bulwark', category: 'Weapon' },
  20784: { id: 20784, name: 'Dragon claws', category: 'Weapon' },
  13652: { id: 13652, name: 'Dragon warhammer', category: 'Weapon' },
  22324: { id: 22324, name: 'Ghrazi rapier', category: 'Weapon' },
  22323: { id: 22323, name: 'Sanguinesti staff', category: 'Weapon' },
  25865: { id: 25865, name: 'Osmumten\'s fang', category: 'Weapon' },
  27275: { id: 27275, name: 'Tumeken\'s shadow', category: 'Weapon' },
  // Armour
  21018: { id: 21018, name: 'Ancestral hat', category: 'Armour' },
  21021: { id: 21021, name: 'Ancestral robe top', category: 'Armour' },
  21024: { id: 21024, name: 'Ancestral robe bottom', category: 'Armour' },
  11832: { id: 11832, name: 'Bandos chestplate', category: 'Armour' },
  11834: { id: 11834, name: 'Bandos tassets', category: 'Armour' },
  11836: { id: 11836, name: 'Bandos boots', category: 'Armour' },
  11826: { id: 11826, name: 'Armadyl helmet', category: 'Armour' },
  11828: { id: 11828, name: 'Armadyl chestplate', category: 'Armour' },
  11830: { id: 11830, name: 'Armadyl chainskirt', category: 'Armour' },
  22326: { id: 22326, name: 'Justiciar faceguard', category: 'Armour' },
  22327: { id: 22327, name: 'Justiciar chestguard', category: 'Armour' },
  22328: { id: 22328, name: 'Justiciar legguards', category: 'Armour' },
  13239: { id: 13239, name: 'Primordial boots', category: 'Armour' },
  13237: { id: 13237, name: 'Pegasian boots', category: 'Armour' },
  13235: { id: 13235, name: 'Eternal boots', category: 'Armour' },
  // Accessories & Misc
  19553: { id: 19553, name: 'Amulet of torture', category: 'Accessory' },
  19547: { id: 19547, name: 'Anguish necklace', category: 'Accessory' },
  19544: { id: 19544, name: 'Tormented bracelet', category: 'Accessory' },
  19550: { id: 19550, name: 'Ring of suffering', category: 'Accessory' },
  12817: { id: 12817, name: 'Elysian spirit shield', category: 'Armour' },
  12821: { id: 12821, name: 'Spectral spirit shield', category: 'Armour' },
  12825: { id: 12825, name: 'Arcane spirit shield', category: 'Armour' },
  11802: { id: 11802, name: 'Armadyl godsword', category: 'Weapon' },
  11804: { id: 11804, name: 'Bandos godsword', category: 'Weapon' },
  11806: { id: 11806, name: 'Saradomin godsword', category: 'Weapon' },
  11808: { id: 11808, name: 'Zamorak godsword', category: 'Weapon' },
};
export function getSinkDescription(id: number): string {
  const item = ITEM_SINK_MAPPING[id];
  if (!item) return "";
  return `This ${item.category.toLowerCase()} is actively regulated by the Jagex Item Sink mechanism to ensure market scarcity and price stability.`;
}