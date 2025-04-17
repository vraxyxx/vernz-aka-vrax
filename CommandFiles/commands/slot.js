// @ts-check
const fruits = ["🍒", "🍎", "🍓", "🍌", "🍊", "🍇", "🍐", "🍋"];

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "slot",
  description: "Play the slot machine game",
  author: "Liane Cagara",
  version: "1.1.9",
  usage: "{prefix}{name} <bet>",
  category: "Gambling Games",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 30,
  shopPrice: 1000,
  requirement: "3.0.0",
  icon: "🍒",
};
const { randArrValue } = global.utils;

const highRollPass = {
  name: "HighRoll Pass",
  key: "highRollPass",
  flavorText:
    "A pass won by achieving a 7-win streak in slots. This pass allows you to place slot bets over 100000, unlocking bigger wins and higher stakes. Remember, with great risk comes great reward. Surprisingly easy to toss away like a normal item!",
  icon: "🃏",
  sellPrice: 2500000,
  type: "armor",
  def: 15,
};
global.items.push(highRollPass);

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
export async function entry({
  input,
  output,
  money,
  icon,
  cancelCooldown,
  Inventory,
}) {
  const [bet] = input.arguments.map((i) => Number(i));
  const senderID = input.senderID;
  let {
    money: playerMoney,
    slotWins = 0,
    slotLooses = 0,
    winStreak = 0,
    inventory: ri,
    slotLuck = false,
  } = await money.getItem(senderID);
  if (slotLuck) {
    cancelCooldown();
  }
  const inventory = new Inventory(ri);
  const top = `𝖲𝗅𝗈𝗍 𝖱𝖾𝗌𝗎𝗅𝗍 | •~•`;
  const bottom = `𝗬𝗼𝘂 𝘄𝗼𝗻: x$
𝗬𝗼𝘂 𝗹𝗼𝘀𝘁: y$`;
  let isBad = slotWins - slotLooses < 0;

  if (!bet || isNaN(bet) || bet <= 0 || bet > playerMoney) {
    output.reply(
      `${icon}\n\nInvalid bet amount. Your current balance is ${playerMoney}$.

**Total ${isBad ? `Looses` : `Wins`}:** ${Math.abs(slotWins - slotLooses)}$`
    );
    cancelCooldown();
    return;
  }
  let hasPass = inventory.has(highRollPass.key);
  if (!hasPass && bet > global.Cassidy.highRoll) {
    return output.reply(
      `${icon}\n\nYou need a **HighRoll Pass** 🃏 to place bets over ${global.Cassidy.highRoll}$`
    );
  }
  if (bet > playerMoney * 0.75) {
    return output.reply(
      `${icon}\n\nYou cannot bet more than 75% of your balance.`
    );
  }
  let result;
  let same = 0;
  const multipliers = {
    0: 0,
    1: 2,
    2: 3,
  };
  do {
    result = [randArrValue(fruits), randArrValue(fruits), randArrValue(fruits)];

    for (let i = 0; i < result.length; i++) {
      const currFruit = result[i];
      const hasMatchingFruit = result
        .slice(i + 1)
        .some((fruit) => fruit === currFruit);
      if (hasMatchingFruit) {
        same++;
      }
    }
  } while (slotLuck && same === 0 && bet % 2 !== 0);
  const multiplier = multipliers[same];
  let isWinPass = false;
  if (same) {
    winStreak++;
    if (
      !inventory.has(highRollPass.key) &&
      inventory.has("cardBook") &&
      winStreak >= 7
    ) {
      inventory.addOne(highRollPass);
      inventory.deleteOne("cardBook");
      isWinPass = true;
    }
  } else if (winStreak > 0) {
    winStreak--;
  }
  const won = bet * multiplier;
  const lost = !same ? bet : 0;
  slotWins += Number(same ? won : 0);
  slotLooses += Number(same ? 0 : lost);
  isBad = slotWins - slotLooses < 0;

  output.reply(`${icon}

${top}

{ ${result.join(" , ")} }

${bottom.replace(/x/, String(won)).replace(/y/, String(lost))}

**Total ${isBad ? `Looses` : `Wins`}:** ${Math.abs(slotWins - slotLooses)}$
**Win Streak:** ${winStreak}${winStreak > 7 ? "" : "/7"}${
    isWinPass ? "\n🃏 You won a **HighRoll** pass!" : ""
  }`);
  await money.setItem(senderID, {
    money: playerMoney + won - lost,
    slotWins,
    slotLooses,
    winStreak,
    inventory: Array.from(inventory),
  });
}

/*𝖲𝗅𝗈𝗍 𝖱𝖾𝗌𝗎𝗅𝗍 | •~•

{ 🍊 , 🍓 , 🍇 }

𝗬𝗼𝘂 𝘄𝗼𝗻: 0$
𝗬𝗼𝘂 𝗹𝗼𝘀𝘁: 5000$*/
