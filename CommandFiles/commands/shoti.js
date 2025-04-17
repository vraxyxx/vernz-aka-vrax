// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "shoti",
  description: "Send a random Shoti video",
  author: "0xVoid",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "Media",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["shoti_"],
  icon: "😋",
};

import Shoti from "shoti";

const shoti = new Shoti("$shoti-b04f8c279e");

/**
 *
 * @param {CommandContext} ctx
 */
export async function entry({ output }) {
  try {
    const data = await shoti.getShoti({ type: "video" });
    if ("error" in data) {
      return output.wentWrong();
    }

    const message =
      `**Country**: ${data.region ?? "N/A"}\n` +
      `**Instagram**: ${data.user.instagram ?? "N/A"}\n` +
      `**Nickname**: ${data.user.nickname ?? "N/A"}\n` +
      `**Signature**: ${data.user.signature ?? "N/A"}\n` +
      `**Twitter**: ${data.user.twitter ?? "N/A"}\n` +
      `**Username**: ${data.user.username ?? "N/A"}`;

    await output.attach(message, data.content);
  } catch (err) {
    await output.reply({
      body: `Failed to fetch Shoti video: ${err.message || err}`,
    });
  }
}

export const style = {
  title: "Random Shoti Video",
  titleFont: "bold",
  contentFont: "fancy",
};
