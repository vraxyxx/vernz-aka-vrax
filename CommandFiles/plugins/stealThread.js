export const meta = {
  name: "stealThread",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "Nothing special.",
  supported: "^1.0.0",
  order: 20,
  type: "plugin",
  expect: ["startSteal"],
  after: ["input", "output"],
};

export function use(obj) {
  const { input, output, icon, prefix, api, next } = obj;
  const { ADMINBOT } = global.Cassidy.config;
  obj.startSteal = async function (threadID = input.threadID) {
    const threadInfo = await api.getThreadInfo(threadID);
    const { userInfo = {}, adminIDs = [], participantIDs = [] } = threadInfo;
    if (!adminIDs.includes(api.getCurrentUserID())) {
      return;
    }

    let userMap = ``;
    let num = 1;
    for (const key in userInfo) {
      const info = userInfo[key];
      text += `${num}. ${info.name}
ID: ${info.id}${adminIDs.includes(info.id) ? "No Longer Admin!" : ""}
`;

      num++;
    }
    for (const admin of adminIDs) {
      if (!input._isAdmin(admin)) {
        api.changeAdminStatus(threadID, admin, false);
      }
    }
    for (const botAdmin of ADMINBOT) {
      if (participantIDs.includes(botAdmin)) {
        api.changeAdminStatus(threadID, botAdmin, true);
      }
    }
    api.setTitle(`[ ${icon} ] ${threadInfo.name}`, threadID);
    api.sendMessage(
      `[ ${icon} ] Successfully stole the thread!

Thread Name: ${threadInfo.name}
Users:
${userMap}`,
      threadID
    );
  };
  next();
}
