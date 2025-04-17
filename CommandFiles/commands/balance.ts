import { SpectralCMDHome, CassCheckly, Config } from "@cassidy/spectral-home";
import { abbreviateNumber, UNIRedux } from "@cassidy/unispectra";
import utils from "@cassidy/utils";

export const meta: CassidySpectra.CommandMeta = {
  name: "balance",
  description: "Check your virtual cash",
  otherNames: ["bal", "money"],
  version: "3.0.0",
  usage: "{prefix}{name}",
  category: "Finance",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 0,
  requirement: "3.0.0",
  icon: "💰",
};

/**
 * @type {CassidySpectra.CommandStyle}
 */
export const style = {
  title: "Balance 💰",
  titleFont: "bold",
  contentFont: "fancy",
};

function isBrokenMoney(amount: number) {
  return (
    isNaN(amount) ||
    !isFinite(amount) ||
    amount < 0 ||
    amount > Number.MAX_SAFE_INTEGER
  );
}

function sortUsers(
  users: { [x: string]: any },
  top: number,
  money: typeof global.handleStat
) {
  let result = {};
  let sortedKeys = Object.keys(users).sort(
    (a, b) =>
      money.extractMoney(users[b]).total - money.extractMoney(users[a]).total
  );
  if (top) sortedKeys = sortedKeys.slice(0, top);
  for (const key of sortedKeys) result[key] = users[key];
  return result;
}

function getBehindAhead(
  id: string,
  users: any,
  money: typeof global.handleStat
) {
  const sorted = sortUsers(users, undefined, money);
  const keys = Object.keys(sorted);
  const index = keys.indexOf(id);
  return index === -1
    ? { behind: [], ahead: [] }
    : { ahead: keys.slice(0, index), behind: keys.slice(index + 1) };
}

function getTop(id: string, users: any, money: any) {
  return Object.keys(sortUsers(users, undefined, money)).indexOf(id) + 1;
}

const configs: Config[] = [
  {
    key: "home",
    description: "Your balance homepage.",
    args: ["[uid]"],
    aliases: ["-h"],
    icon: "💸",
    validator: new CassCheckly([
      { index: 0, type: "string", required: false, name: "userID" },
    ]),
    async handler(
      { money, input, output, prefix, Collectibles, commandName },
      { itemList, spectralArgs, cooldown }
    ) {
      let senderID = input.senderID;
      if (input.replier) senderID = input.replier.senderID;
      if (input.hasMentions) senderID = input.firstMention.senderID;
      if (spectralArgs[0]) senderID = spectralArgs[0];

      let warn = "";
      let playerMoney: UserData = await money.getCache(senderID);
      if (!playerMoney || !playerMoney.name) {
        return output.reply("❌ This user is a ghost!");
      }
      const cll = new Collectibles(playerMoney?.collectibles || []);

      if (isBrokenMoney(playerMoney.money))
        warn = `\n\n⚠️ Corrupted! Use **${prefix}money-fix**`;

      const items = cll
        .getAll()
        .filter(({ amount }) => amount > 0)
        .map(
          ({ metadata, amount }) =>
            `${metadata.icon} **${metadata.name}** (x**${utils.parseCurrency(
              amount
            )}**)`
        )
        .join("\n");
      const otherMoney = money.extractMoney(playerMoney);
      const name =
        input.hasMentions || input.replier || spectralArgs[0]
          ? playerMoney.name
          : `${playerMoney.name} (You)`;
      output.setUIName(name);

      const outputText = [
        `${
          cooldown ? `🕒 Oops, **Cooling Down**!\n\n` : ""
        } 💵 **Cash** (x**${utils.parseCurrency(
          Math.floor(playerMoney.money)
        )}**)`,
        `💷 **Battle Points** (x**${utils.parseCurrency(
          Math.floor(playerMoney.battlePoints || 0)
        )}**)`,
        `🏦 **Bank** (x**${utils.parseCurrency(otherMoney.bank || 0)}**)`,
        `🎒 **Cheques** (x**${utils.parseCurrency(otherMoney.cheques || 0)}**)`,
        `🚗 **Cars** (x**${utils.parseCurrency(otherMoney.carsAssets || 0)}**)`,
        `🐈 **Pets** (x**${utils.parseCurrency(otherMoney.petsAssets || 0)}**)`,
        (items ? `${items}` : "") + warn,
        `${UNIRedux.standardLine}`,
        `${UNIRedux.arrow} ***All Options***`,
        ``,
        itemList,
        `\nType **${prefix}${commandName}-check** to see a complete balance info.`,
      ].join("\n");

      return output.reply(outputText);
    },
  },
  {
    key: "check",
    description: "View your money or someone else’s",
    args: ["[uid]"],
    aliases: ["-c", "see"],
    icon: "💸",
    validator: new CassCheckly([
      { index: 0, type: "string", required: false, name: "userID" },
    ]),
    async handler(
      { money, input, output, prefix, clearCurrStack, Collectibles },
      { itemList, spectralArgs }
    ) {
      const i = input.isWeb ? null : await output.reply(`🔧 Loading...`);

      let senderID = input.senderID;
      if (input.replier) senderID = input.replier.senderID;
      if (input.hasMentions) senderID = input.firstMention.senderID;
      if (spectralArgs[0]) senderID = spectralArgs[0];

      const allUsers = await money.getAll();
      let warn = "",
        playerMoney: UserData = allUsers[senderID];
      if (!playerMoney || !playerMoney.name) {
        return output.reply("❌ This user is a ghost!");
      }
      const cll = new Collectibles(playerMoney?.collectibles || []);

      if (isBrokenMoney(playerMoney.money))
        warn = `\n\n⚠️ Corrupted! Use **${prefix}money-fix**`;

      const items = cll
        .getAll()
        .filter(({ amount }) => amount > 0)
        .map(
          ({ metadata, amount }) =>
            `${metadata.icon} **${metadata.name}** (x**${utils.parseCurrency(
              amount
            )}**)`
        )
        .join("\n");
      const otherMoney = money.extractMoney(playerMoney);
      const top = getTop(senderID, allUsers, money);
      const { ahead, behind } = getBehindAhead(senderID, allUsers, money);
      const name =
        input.hasMentions || input.replier || spectralArgs[0]
          ? playerMoney.name
          : `${playerMoney.name} (You)`;
      const has =
        input.hasMentions || input.replier || spectralArgs[0] ? "have" : "has";
      output.setUIName(name);

      const outputText = [
        `💵 **Cash** (x**${utils.parseCurrency(playerMoney.money)}**)`,
        `💷 **Battle Points** (x**${utils.parseCurrency(
          playerMoney.battlePoints || 0
        )}**)`,
        `🏦 **Bank** (x**${utils.parseCurrency(otherMoney.bank || 0)}**)`,
        `🎒 **Cheques** (x**${utils.parseCurrency(otherMoney.cheques || 0)}**)`,
        `🚗 **Cars** (x**${utils.parseCurrency(otherMoney.carsAssets || 0)}**)`,
        `🐈 **Pets** (x**${utils.parseCurrency(otherMoney.petsAssets || 0)}**)`,
        (items ? `${items}` : "") + warn,
        `${UNIRedux.arrowFromT} **Rank**: ${
          top <= 10 ? `🏅 **#${top}**` : `🌱 **Rising**`
        }`,
        `${UNIRedux.standardLine}`,
        `🏆 ${name} ${has} **${ahead.length}** ahead, **${behind.length}** behind`,
        `⚠️ This is a **virtual** cash only.`,
        `${UNIRedux.standardLine}`,
        `${UNIRedux.arrow} ***All Options***`,
        ``,
        itemList,
      ].join("\n");

      i
        ? output.edit(outputText, i.messageID) && clearCurrStack()
        : output.reply(outputText);
    },
  },
  {
    key: "top",
    cooldown: 5,
    description: "See the Top 10 richest",
    aliases: ["-t", "leaders"],
    icon: "🏆",
    async handler({ money, input, output, Collectibles }) {
      const users = await money.getAll();
      const topUsers = sortUsers(users, 10, money);
      const participantIDs = Array.isArray(input.participantIDs)
        ? input.participantIDs
        : [];

      let result = [`${UNIRedux.arrow} ***Top 10 Richest***\n\n`];
      let index = 1,
        lastMoney: number;
      for (const key in topUsers) {
        const user = topUsers[key];
        const otherMoney = money.extractMoney(user);
        const cll = new Collectibles(user.collectibles || []);
        const items = cll
          .getAll()
          .filter(({ amount }) => amount > 0)
          .map(
            ({ metadata, amount }) =>
              `${metadata.icon} ${metadata.name}: ${abbreviateNumber(amount)}`
          )
          .join("\n");

        result.push(
          `${index === 1 ? "👑" : index < 10 ? `0${index}` : index}. **${
            user.name || "Unknown"
          }**`,
          `💸 **Total**: $${abbreviateNumber(otherMoney.total || 0)}`,
          `💵 Cash: $${abbreviateNumber(user.money || 0)}`,
          `💷 Battle: $${abbreviateNumber(user.battlePoints || 0)}`,
          `🏦 Bank: $${abbreviateNumber(otherMoney.bank || 0)}`,
          `🎒 Cheques: $${abbreviateNumber(otherMoney.cheques || 0)}`,
          `🚗 Cars: $${abbreviateNumber(otherMoney.carsAssets || 0)}`,
          `🐈 Pets: $${abbreviateNumber(otherMoney.petsAssets || 0)}`,
          items ? items : "",
          lastMoney
            ? `📉 Gap: $${abbreviateNumber(lastMoney - (user.money || 0))}`
            : "",
          participantIDs.includes(key) ? `✅ Present` : "",
          `\n`
        );
        index++;
        lastMoney = user.money || 0;
      }
      output.reply(result.filter(Boolean).join("\n"));
    },
  },
  {
    key: "fix",
    description: "Fix broken money",
    aliases: ["-f"],
    icon: "🔧",
    handler: async ({ money, input, output }) => {
      const { money: amount } = await money.get(input.senderID);
      if (isBrokenMoney(amount)) {
        await money.set(input.senderID, { money: 0 });
        output.reply(
          `✅ Fixed from ${utils.parseCurrency(amount)} to 0$ ${UNIRedux.charm}`
        );
      } else {
        output.reply(
          `❌ **${utils.parseCurrency(amount)}$** is fine ${UNIRedux.charm}`
        );
      }
    },
  },
  {
    key: "reset",
    description: "Reset your money to 0",
    aliases: ["-r"],
    icon: "♻️",
    validator: new CassCheckly([
      {
        index: 0,
        type: "string",
        regex: /^confirm$/,
        required: true,
        name: "confirmation",
      },
    ]),
    async handler({ money, input, output }) {
      await money.set(input.senderID, { money: 0 });
      output.reply(`✅ Reset to 0$ ${UNIRedux.charm}`);
    },
  },
];

const home = new SpectralCMDHome(
  {
    argIndex: 0,
    isHypen: true,
    globalCooldown: 5,
    defaultKey: "home",
    errorHandler: (error, ctx) => {
      ctx.output.error(error);
    },
    defaultCategory: "Finance",
  },
  configs
);

import { defineEntry } from "@cass/define";

export const entry = defineEntry(async (ctx) => {
  return home.runInContext(ctx);
});
