// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "garden",
  description: "Grow plants and harvest fresh crops!",
  version: "2.0.0",
  author: "MrkimstersDev",
  usage: "{prefix}garden",
  category: "Idle Accumulation Games",
  permissions: [0],
  noPrefix: "both",
  otherNames: ["planting"],
  shopPrice: 150,
  requirement: "2.0.0",
  icon: "🌿",
};

export const style = {
  title: "Gardening 🌿",
  contentFont: "fancy",
  titleFont: "bold",
};

const plants = [
  {
    name: "Sunflower",
    priceA: 2,
    priceB: 5,
    delay: 1,
    icon: "🌻",
    chance: 0.3,
  },
  {
    name: "Lavender",
    priceA: 5,
    priceB: 12,
    delay: 1.5,
    icon: "💜",
    chance: 0.25,
  },
  {
    name: "Blue Rose",
    priceA: 20,
    priceB: 50,
    delay: 3,
    icon: "🌹",
    chance: 0.15,
  },
  {
    name: "Golden Apple Tree",
    priceA: 1000,
    priceB: 3000,
    delay: 60,
    icon: "🍏",
    chance: 0.05,
  },
];

const garden = {
  key: "grow",
  verb: "garden",
  verbing: "gardening",
  pastTense: "gardened",
  checkIcon: "✓",
  initialStorage: 30,
  itemData: plants,
  actionEmoji: "🌱",
  stoData: {
    price: 1000,
  },
};

export async function entry({ GameSimulator }) {
  const simu = new GameSimulator(garden);
  await simu.simulateAction();
}
