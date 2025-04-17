// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "unsend",
  otherNames: ["uns"],
  version: "1.1.0",
  author: "NTKhang // converted By MrkimstersDev",
  permissions: [0],
  category: "Utilities",
  description: "Unsend bot's message",
  usage: "Reply to the bot's message and call the command",
};

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
export async function entry({ output, input, api, replySystem }) {
  if (!input.replier || input.replier.senderID !== api.getCurrentUserID()) {
    return output.reply("❌ Please reply to a bot's message.");
  }
  if (replySystem.get(input.replier.messageID)) {
    return output.reply(
      "❌ This message has reply listener, you cannot unsend it."
    );
  }

  try {
    await output.unsend(input.replier.messageID);
  } catch (error) {
    await output.reply("❌ Failed to unsend the message. Please try again.");
  }
}
