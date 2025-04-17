export const meta = {
  name: "logsBot",
  author: "MRKIMSTERS & Liane Cagara 🎀",
  description:
    "Logs events when the bot is added to or removed from groups, notifying only admins.",
  version: "1.4",
  supported: "^1.0.0",
  type: "plugin",
  category: "events",
  after: ["output", "input"],
  order: 100,
};

const { Cassidy } = global;

/**
 *
 * @param {CommandContext} obj
 * @returns
 */
export async function use(obj) {
  const { next, api, event, output } = obj;

  if (event.isWeb) {
    return obj.next();
  }

  try {
    if (
      (event.logMessageType === "log:subscribe" &&
        event.logMessageData.addedParticipants.some(
          (item) => item.userFbId === api.getCurrentUserID()
        )) ||
      (event.logMessageType === "log:unsubscribe" &&
        event.logMessageData.leftParticipantFbId === api.getCurrentUserID())
    ) {
      if (event.author === api.getCurrentUserID()) return;

      const time = new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      let threadName = "Unknown Group";
      let messageLog = "";

      if (event.logMessageType === "log:subscribe") {
        threadName =
          (await api.getThreadInfo(event.threadID))?.threadName || threadName;
        const authorName = await api
          .getUserInfo(event.author)
          .then((data) => data[event.author]?.name || "Unknown User");
        messageLog += `\n\n✅\n***Event***: Bot has been added to a new group\n- ***Added by***: ${authorName}`;
      }

      if (event.logMessageType === "log:unsubscribe") {
        threadName =
          (await api.getThreadInfo(event.threadID))?.threadName || threadName;
        const authorName = await api
          .getUserInfo(event.author)
          .then((data) => data[event.author]?.name || "Unknown User");
        messageLog += `\n❌\n***Event***: Bot has been removed from a group\n- ***Removed by***: ${authorName}`;
      }

      messageLog += `\n- ***User ID***: ${event.author}\n- ***Group***: ${threadName}\n- ***Group ID***: ${event.threadID}\n- ***Time***: ${time}`;

      const { ADMINBOT = [], MODERATORBOT = [] } = Cassidy?.config || {};
      const staffs = [...ADMINBOT, MODERATORBOT];
      if (!staffs || !Array.isArray(staffs) || staffs.length === 0) {
        return console.warn("No admins configured to receive logs.");
      }

      for (const adminID of ADMINBOT) {
        if (isNaN(adminID)) {
          continue;
        }
        await output.sendStyled(
          messageLog,
          {
            title: "Thread Logs 🔍",
            titleFont: "bold",
            contentFont: "fancy",
          },
          adminID
        );
      }
    }
  } catch (error) {
    console.error("Error in logsBot:", error);
  }
  next();
}
