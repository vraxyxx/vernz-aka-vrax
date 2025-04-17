// @ts-check
import {
  fontMarkups,
  isAdminCommand,
  removeCommandAliases,
  toTitleCase,
  UNIRedux,
  UNISpectra,
} from "@cassidy/unispectra";
import { ShopClass } from "@cass-plugins/shopV2";

export const meta: CassidySpectra.CommandMeta = {
  name: "menu",
  author: "Liane Cagara",
  description:
    "Acts as a central hub, like a Start Menu, providing users with an overview of available commands, their functionalities, and access to specific command details. Helps users quickly navigate the bot's features.",
  version: "2.5.0",
  usage: "{prefix}{name} [commandName]",
  category: "System",
  permissions: [0],
  requirement: "3.0.0",
  icon: "🧰",
  otherNames: ["start", "help"],
};

export const style = {
  title: Cassidy.logo,
  titleFont: "none",
  contentFont: "fancy",
};

export async function entry({
  input,
  output,
  commands: ogc,
  prefix,
  commandName,
  money,
}: CommandContext) {
  const commands = removeCommandAliases(ogc);
  const args = input.arguments;
  const { logo: icon } = global.Cassidy;
  const { shopInv, money: userMoney } = await money.queryItem(
    input.senderID,
    "shopInv",
    "money"
  );
  const shop = new ShopClass(shopInv);

  if (args.length > 0 && isNaN(parseInt(args[0]))) {
    const commandName = args[0];
    const command = ogc[commandName];

    if (command) {
      const {
        name,
        description,
        otherNames = [],
        usage,
        category = "None",
        permissions = [],
        waitingTime = 5,
        author = "Unknown",
        shopPrice = 0,
        icon: cmdIcon = "📄",
        version = "N/A",
        requirement = "N/A",
      } = command.meta;
      const status = shop.isUnlocked(name)
        ? "✅ Unlocked"
        : shop.canPurchase(name, userMoney)
        ? "💰 Buyable"
        : "🔒 Locked";

      output.reply(`
╭─── ${cmdIcon} **${toTitleCase(name)}** ───
│   📜 **Name**:
│   ${UNISpectra.charm} ${name}
│ 
│   💬 **Description**: 
│   ${UNISpectra.charm} ${description}
│ 
│   📝 **Aliases**: 
│   ${UNISpectra.charm} ${otherNames.length ? otherNames.join(", ") : "None"}
│ 
│   🛠️ **Usage**:
│   ${UNISpectra.charm} ${usage
        .replace(/{prefix}/g, prefix)
        .replace(/{name}/g, name)}
│ 
│   📁 **Category**:
│   ${UNISpectra.charm} ${category}
│ 
│   🔐 **Permissions**:
│   ${UNISpectra.charm} ${
        permissions.length ? permissions.join(", ") : "None required"
      }
│ 
│   ⏳ **Cooldown**:
│   ${UNISpectra.charm} ${waitingTime} 
│ 
│   ✍️ **Author**: 
│   ${UNISpectra.charm} ${author}
│ 
│   💸 **Price**:
│   ${UNISpectra.charm} ${shopPrice ? `$${shopPrice} ${status}` : "⚡ Free"}
│ 
│   🖼️ **Icon**:
│   ${UNISpectra.charm} ${cmdIcon}
│ 
│   📌 **Version**:
│   ${UNISpectra.charm} ${version}
│ 
│   🛡️ **Requirement**:
│   ${UNISpectra.charm} ${requirement}
╰────────────────`);
    } else {
      output.reply(
        `${icon}\n\n❌ Oops! **${commandName}** isn't a valid command. Try another!`
      );
    }
    return;
  }

  const categorizedCommands = Object.values(commands).reduce(
    (categories, command) => {
      const category = command.meta.category || "Miscellaneous";
      if (!categories[category]) categories[category] = [];
      categories[category].push(command);
      return categories;
    },
    {}
  );

  const sortedCategories = Object.keys(categorizedCommands).sort((a, b) => {
    const aContainsGame = a.toLowerCase().includes("game");
    const bContainsGame = b.toLowerCase().includes("game");

    if (aContainsGame && bContainsGame) {
      return a.localeCompare(b);
    }

    if (aContainsGame) {
      return -1;
    }
    if (bContainsGame) {
      return 1;
    }

    return a.localeCompare(b);
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  let currentPage = parseInt(args[0]) || 1;

  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  const pageCategories = sortedCategories.slice(startIndex, endIndex);

  let result = `**Page ${currentPage} of ${totalPages}** 📄\n`;
  let preff = "│ ";

  pageCategories.forEach((category) => {
    result += `\n╭─────────────❍\n${preff} ${UNISpectra.arrow} ***${category}*** 📁\n${preff}\n`;
    categorizedCommands[category].forEach((command) => {
      const {
        name,
        description,
        icon,
        otherNames,
        shopPrice = 0,
      } = command.meta;
      const statusIcon = isAdminCommand(command)
        ? "👑"
        : shop.isUnlocked(name)
        ? icon || "📄"
        : shop.canPurchase(name, userMoney)
        ? "🔐"
        : "🔒";
      // result += `${preff}  ${statusIcon} ${prefix}**${toTitleCase(name)}**${
      //   shopPrice
      //     ? ` - $**${shopPrice}** ${
      //         shop.canPurchase(name, userMoney)
      //           ? shop.isUnlocked(name)
      //             ? "✅"
      //             : "💰"
      //           : "❌"
      //       }`
      //     : ""
      // } ${UNIRedux.charm}\n${preff}   ${
      //   UNIRedux.charm
      // } ${fontMarkups.fancy_italic(
      //   "Description"
      // )}: ${description} 💬\n${preff}   ${
      //   UNIRedux.charm
      // } ${fontMarkups.fancy_italic("Aliases")}: ${
      //   otherNames?.join(", ") || "None 📝"
      // }\n${preff}\n`;
      let isAllowed =
        (!shopPrice || shop.isUnlocked(name)) &&
        (!isAdminCommand(command) || input.isAdmin);
      result += `${preff}  ${statusIcon} ${prefix}${
        isAllowed ? `**${toTitleCase(name)}**` : `${toTitleCase(name)}`
      }${
        shopPrice
          ? ` - $${shopPrice} ${
              shop.isUnlocked(name)
                ? "✅"
                : shop.canPurchase(name, userMoney)
                ? "💰"
                : "❌"
            }`
          : ""
      }\n`;
    });
    result += `╰─────────────❍\n`;
  });
  result = result.trim();

  result += `\n\n${UNISpectra.arrow} ***Explore*** more commands!\n`;
  result += `${UNISpectra.arrow} View another page: **${prefix}${commandName} <page>**\n`;
  result += `${UNISpectra.arrow} Next page: **${prefix}${commandName} ${
    currentPage + 1
  }**\n`;
  result += `${UNISpectra.arrow} Command details: **${prefix}${commandName} <command>**\n`;

  return output.reply(
    `🔍 | **Available Commands** 🧰\n\n${result}${UNISpectra.charm} Developed by @**Liane Cagara** 🎀`
  );
}
