// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "gift",
  description: "Claim your gift every hours.",
  version: "1.0.0",
  author: "Liane Cagara",
  category: "Rewards",
  permissions: [0],
  waitingTime: 1,
  noPrefix: false,
  requirement: "3.0.0",
  icon: "🎁",
  requiredLevel: 3,
};

export const style = {
  title: "Free Gift 💗",
  titleFont: "bold",
  contentFont: "fancy",
};

const diaCost = 2;
const { parseCurrency: pCy } = global.utils;
const { invLimit } = global.Cassidy;

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
async function handlePaid({
  input,
  output,
  money,
  Inventory,
  generateGift,
  Collectibles,
  langParser,
}) {
  const getLang = langParser.createGetLang(langs);
  let { inventory: rawInv = [], collectibles: rawCll = [] } = await money.get(
    input.senderID
  );
  if (String(input.words[0]).toLowerCase() !== "buy") {
    return;
  }
  if (rawInv.length >= invLimit) {
    return output.reply(getLang("tooManyItems"));
  }
  const inventory = new Inventory(rawInv);
  const collectibles = new Collectibles(rawCll);
  if (!collectibles.hasAmount("gems", diaCost)) {
    if (input.isAdmin && input.words[1] === "cheat") {
    } else {
      return output.reply(getLang("notEnoughGems"));
    }
  }
  const giftItem = generateGift();
  Object.assign(giftItem, {
    key: "fortuneEnv",
    name: "Fortune Envelope",
    icon: "🧧",
    flavorText:
      "A token of luck and prosperity, sealed with good wishes and ancient blessings, that might grant you something. It's not guaranteed, but you can use it with the inventory command, if you know how.",
    type: "treasure",
    treasureKey: "generic_exclude=>curse",
    cannotSend: true,
    cannotToss: true,
    cannotTrade: true,
    sellPrice: 20000,
  });
  inventory.addOne(giftItem);
  collectibles.raise("gems", -diaCost);
  await money.set(input.senderID, {
    inventory: Array.from(inventory),
    collectibles: Array.from(collectibles),
  });
  return output.reply(
    getLang(
      "boughtGift",
      giftItem.icon,
      giftItem.name,
      String(pCy(collectibles.getAmount("gems"))),
      String(diaCost)
    )
  );
}

export const langs = {
  en: {
    tooManyItems: "❌ You're carrying too many items!",
    notEnoughGems: "❌ You don't have enough gems to purchase it.",
    boughtGift:
      "✅ You bought a **%1 %2**! Check your inventory to see it.\n\n💎 **%3** (-%4)",
    alreadyClaimed:
      "⏳ You've already claimed your free gift. Please wait for %1 hours, %2 minutes, and %3 seconds before claiming again.\nReply **buy** to purchase a fortune **envelope** for %4💎\n\n**💎 %5**",
    claimedGift:
      "🎁 You've claimed your free gift! Check your inventory and come back later for more.",
  },
  tl: {
    tooManyItems: "❌ OMG, your items are like, sobrang dami na, girl!",
    notEnoughGems: "❌ Wala kang enough gems, so sad naman!",
    boughtGift:
      "✅ You bought a **%1 %2**, so fab! Check mo your inventory na.\n\n💎 **%3** (-%4)",
    alreadyClaimed:
      "⏳ Na-claim mo na your free gift, besh! Wait ka lang ng %1 hours, %2 minutes, and %3 seconds before you can claim ulit.\nJust reply **buy** if you wanna get a fortune **envelope** for %4💎\n\n**💎 %5**",
    claimedGift:
      "🎁 Yes, na-claim mo na your free gift! So cute, check your inventory and come back later ha, so fun!",
  },
};

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
export async function entry({
  input,
  output,
  money,
  Inventory,
  generateGift,
  Collectibles,
  langParser,
}) {
  const getLang = langParser.createGetLang(langs);
  let {
    inventory: rawInv = [],
    lastGiftClaim,
    collectibles: rawCll = [],
  } = await money.getItem(input.senderID);
  if (rawInv.length >= invLimit) {
    return output.reply(getLang("tooManyItems"));
  }
  const inventory = new Inventory(rawInv);
  const collectibles = new Collectibles(rawCll);
  const currentTime = Date.now();
  const msWait = 20 * 60 * 1000;

  let canClaim = false;

  if (!lastGiftClaim) {
    canClaim = true;
  } else {
    const timeElapsed = currentTime - lastGiftClaim;
    if (timeElapsed >= msWait) {
      canClaim = true;
    } else if (input.isAdmin && input.arguments[0] === "cheat") {
      canClaim = true;
    } else {
      const timeRemaining = msWait - timeElapsed;
      const hoursRemaining = Math.floor(
        (timeRemaining / (1000 * 60 * 60)) % 24
      );
      const minutesRemaining = Math.floor((timeRemaining / (1000 * 60)) % 60);
      const secondsRemaining = Math.floor((timeRemaining / 1000) % 60);

      const info = await output.reply(
        getLang(
          "alreadyClaimed",
          String(hoursRemaining),
          minutesRemaining,
          secondsRemaining,
          diaCost,
          pCy(collectibles.getAmount("gems"))
        )
      );
      input.setReply(info.messageID, {
        callback: handlePaid,
        key: "gift",
      });
      return;
    }
  }

  if (canClaim) {
    const giftItem = generateGift();
    giftItem.cannotSend = true;
    inventory.addOne(giftItem);

    await money.setItem(input.senderID, {
      inventory: Array.from(inventory),
      lastGiftClaim: currentTime,
    });

    return output.reply(getLang("claimedGift"));
  }
}
