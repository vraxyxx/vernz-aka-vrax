// @ts-check
import axios from "axios";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "tempmail",
  author: "Hazeey | AkhiroDEV",
  description: "Generate a tempmail",
  usage: "tempmail gen",
  version: "1.0.1",
  params: [["gen", "inbox"]],
  shopPrice: 100,
  requirement: "3.0.0",
  icon: "📩",
  category: "Utilities",
};

/**
 *
 * @param {CommandContext} param0
 */
export async function entry({ api, event }) {
  const args = event.body.split(/\s+/);
  args.shift();

  if (args[0] === "gen") {
    try {
      const response = await axios.get(
        "https://haze-temp-getter-e8bcc9ade589.herokuapp.com/get"
      );
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        let emails = responseData.map((obj) => "➤ " + obj.email).join("\n\n");
        api.sendMessage(
          `📩 𝐓𝐞𝐦𝐩𝐌𝐚𝐢𝐥\n\n✄┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n✉️ 𝙴𝚖𝚊𝚒𝚕𝚜:\n\n${emails}\n\n✄┈┈┈┈┈┈┈┈┈┈┈┈┈┈`,
          event.threadID,
          event.messageID
        );
      } else {
        api.sendMessage(
          "🚫 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚏𝚘𝚛𝚖𝚊𝚝",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error("🚫 𝙴𝚛𝚛𝚘𝚛", error);
      api.sendMessage(
        "🚫 𝙴𝚛𝚛𝚘𝚛 𝚘𝚌𝚌𝚞𝚛𝚎𝚍 𝚠𝚑𝚒𝚕𝚎 𝚏𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚎𝚖𝚊𝚒𝚕𝚜.",
        event.threadID,
        event.messageID
      );
    }
  } else if (args[0]?.toLowerCase() === "inbox" && args.length === 2) {
    const email = args[1];
    try {
      const response = await axios.get(
        `https://haze-temp-getter-e8bcc9ade589.herokuapp.com/get/${email}`
      );
      const inboxMessages = response.data;
      let formattedMessages = inboxMessages
        .map(
          (message) =>
            `👤 𝙵𝚛𝚘𝚖: ${message.from}\n📬 𝚂𝚞𝚋𝚓𝚎𝚌𝚝: ${message.subject}\n\n✄┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n💌 𝙼𝚊𝚒𝚕:\n\n${message.body}\n✄┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n𝙳𝚊𝚝𝚎: ${message.date}`
        )
        .join("\n\n");
      api.sendMessage(
        `📩 𝐈𝐧𝐛𝐨𝐱 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬 \n\n${formattedMessages}`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error("🚫 𝙴𝚛𝚛𝚘𝚛", error);
      api.sendMessage("🚫 𝙰𝚗 𝚎𝚛𝚛𝚘𝚛 𝚘𝚌𝚌𝚞𝚛𝚎𝚍.", event.threadID, event.messageID);
    }
  } else {
  }
}
