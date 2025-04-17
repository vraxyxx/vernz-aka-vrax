// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "yuhanshop",
  description: "A brave lonely dog, until now no one knows where he came.",
  version: "1.0.3",
  author: "Yhan Toycs",
  usage: "{prefix}Yuhanshop",
  category: "Shopping",
  permissions: [0],
  noPrefix: false,
  requirement: "3.0.0",
  icon: "🐶",
};

const highLandShop = {
  key: "yuhanShop",
  itemData: [
    {
      icon: "🥧",
      name: "Pie",
      key: "Pie",
      flavorText: "A normal pie, baked by Yuhan it will heal you 20 HP",
      price: 200,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Pie",
          key: "Pie",
          flavorText: "A normal pie, baked by Yuhan, it will heal you 20 HP.",
          icon: "🥧",
          type: "food",
          heal: 20,
          sellPrice: 100,
        });
      },
    },
    {
      icon: "🪃",
      name: "Boomerang",
      flavorText: "A boomerang crafted by Yuhan. it increases your TP to %12",
      price: 50,
      atk: 2,
      def: 2,
      type: "weapon",
      key: "boomerang",
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Boomerang",
          key: "boomerang",
          flavorText:
            "A boomerang created by Yuhan. it increases your TP to %12",
          icon: "🪃",
          type: "weapon",
          atk: 2,
          def: 2,
          tpBoost: 12,
          sellPrice: 30,
        });
      },
    },
    {
      icon: "🗡️",
      name: "Leeyan Sword",
      flavorText: "A sword crafted by my cousin when he was still alive.",
      key: "leeyanSword",
      price: 5500,
      type: "weapon",
      atk: 20,
      def: 5,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Leeyan Sword",
          key: "leeyanSword",
          flavorText: "A sword created by my cousin when he was still alive.",
          icon: "🗡️",
          type: "weapon",
          atk: 20,
          def: 5,
          sellPrice: 2500,
        });
      },
    },
    {
      icon: "🥎",
      name: "Ball",
      key: "Ball",
      flavorText:
        "This is my toy! I don't know why it's here in my shop. Anyways, YOU CAN'T HAVE IT!",
      price: 10,
      cannotBuy: true,
    },
    {
      icon: "⚜️",
      name: "Yuhan Astrum",
      key: "yuhanAstrum",
      cannotBuy: false,
      flavorText:
        "it's an amulet and It was forged under a lunar eclipse. It carries the whispers of old star prophecies. The etchings on the amulet show the constellations of a civilization that's been lost for a long time, and it's said to guide the person wearing it through dark and light.",
      price: 600900,
      type: "weapon",
      def: 5,
      atk: 15,
      magic: 65,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Yuhan Astrum",
          key: "yuhanAstrum",
          flavorText:
            "it's an amulet and It was forged under a lunar eclipse. It carries the whispers of old star prophecies. The etchings on the amulet show the constellations of a civilization that's been lost for a long time, and it's said to guide the person wearing it through dark and light.",
          icon: "⚜️",
          type: "weapon",
          def: 5,
          atk: 15,
          magic: 65,
          sellPrice: 300000,
        });
      },
    },

    {
      icon: "🧪",
      name: "Celestium Potion",
      key: "celestiumPotion",
      flavorText:
        "A potion from the highlands, created by an unknown witchcrafter. Restores 40 HP to one ally.",
      price: 400,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Celestium Potion",
          key: "celestiumPotion",
          flavorText:
            "A potion from the highlands. Restores 40 HP to one ally.",
          icon: "🧪",
          type: "food",
          heal: 40,
          sellPrice: 200,
        });
      },
    },
  ],
  sellTexts: [
    "🐶 awhh.. I'm sorry I can't buy items for now.",
    "🐶 Thanks for your understanding! woof!",
  ],
  talkTexts: [
    {
      name: "Leeyan's Story",
      responses: [
        "🐶 Me and my cousin are selling a lot of stuffs!",
        "🐶 But one day, our village got attack by a mysterious creature!",
        "🐶 My cousin tried to kill that mysterious creature, but he wasn't successful at all, he died.",
      ],
      icon: "🐩",
    },
    {
      name: "Yuhan's Story",
      responses: [
        "🐶 My story? I travel almost around the world to look for the best ingredient to make a new items to sell!",
        "🐶 Opening this shop was a great decision that I made, we earn money, we help people, and also we make them happy!",
        "🐶 Each item here has a story, waiting to be discovered by those brave enough to explore.",
      ],
      icon: "🐕",
    },
    {
      name: "Favorite Items",
      responses: ["🐶 My favorite item is the BALL!!"],
    },
    {
      name: "Customer Stories",
      responses: [
        "🐺 Ah, customers? I've met travelers who've faced trials and triumphs in the Dark World.",
        "🦇 One adventurer even found a secret passage behind the waterfall, revealing hidden treasures.",
        "🌌 Every customer brings tales of courage and curiosity, enriching the lore of the Dark World.",
      ],
      icon: "📜",
    },
    {
      name: "Future Ventures",
      responses: [
        "😺 I plan to expand my shop, offering even more artifacts and curiosities.",
        "😸 New arrivals will soon grace the shelves, each with its own enchanting tale.",
        "😺 The Dark World is full of surprises, and I'm eager to share them with future visitors.",
      ],
      icon: "🔮",
    },
    {
      name: "Shop Events",
      responses: [
        "🐺 Celebrations in the Dark World are marked with grand feasts and mystical rituals.",
        "🦇 Each season brings unique festivities, from the Dance of Shadows to the Moonlight Market.",
        "🌌 Keep an eye out for special sales and rare artifacts that appear during these events.",
      ],
    },
  ],
  buyTexts: [
    "🐶 Which item catches your eye?",
    "🐶 Ready to embark on your next adventure with one of these treasures?",
    "🐶 Take your pick and uncover its hidden powers!",
  ],
  welcomeTexts: [
    "🐶 Welcome to Shawn's Shop in the Dark World!",
    "🐶 Greetings! Step into the realm of mystery and wonder.",
    "🐶 Ah, a traveler! Come, explore the artifacts of the Dark World.",
    "🐶 Welcome, welcome! Seeker of secrets and bearer of curiosity.",
    "🐶 Enter, brave soul! The Dark World awaits your discovery.",
  ],
  goBackTexts: [
    "🐶 No worries, take your time to decide.",
    "🐶 Feel free to browse, adventurer.",
    "🐶 Take a moment to ponder your choice.",
    "🐶 Don't hesitate to return if you change your mind.",
    "🐶 Explore at your own pace.",
  ],
  askTalkTexts: [
    "🐶 Interested in hearing tales of the Dark World?",
    "🐶Let's delve into the mysteries hidden within these walls.",
    "🐶 What stories intrigue you, traveler?",
    "🐶 I'm all ears for your questions and curiosities.",
    "🐶 Seek knowledge and adventure? You've come to the right place.",
  ],
  thankTexts: [
    "🐶 Thank you for choosing Shawn's Shop!",
    "🐶 May your journey through the Dark World be filled with discoveries!",
    "🐶 Until we meet again, adventurer!",
    "🐶 Your patronage is greatly appreciated!",
    "🐶 Farewell, and may the shadows guide your path.",
  ],
};

export async function entry({ UTShop }) {
  const shop = new UTShop(highLandShop);
  return shop.onPlay();
}
