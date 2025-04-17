import {
  getCommandByFileName,
  getLatestCommands,
  isAdminCommand,
  ObjectX,
  removeCommandAliases,
  UNIRedux,
} from "@cassidy/unispectra";

export const meta = {
  name: "prefix",
  author: "Liane Cagara",
  version: "2.5.0",
  description: "Nothing special.",
  supported: "^2.5.0",
  order: 4,
  type: "plugin",
  after: ["input", "output"],
};

export async function use(obj) {
  const {
    input,
    output,
    icon,
    prefix,
    popularCMD,
    recentCMD,
    prefixes,
    commands: origCommands,
    commandName,
  } = obj;
  if (
    input.text?.toLowerCase() === "prefix" ||
    input.text?.toLowerCase() === "cassidy" ||
    input.text.trim() === prefix ||
    prefixes.some((prefix) => input.text.trim() === prefix)
  ) {
    const commands = ObjectX.filter(
      removeCommandAliases(origCommands),
      (command) => {
        return Boolean(input.isAdmin) ? true : !isAdminCommand(command);
      }
    );

    // const latestCommands = await getLatestCommands(
    //   process.cwd() + "/CommandFiles/commands"
    // );
    const randomCommands = Object.keys(
      ObjectX.slice(
        ObjectX.toSorted(commands, (a, b) => Math.random() - 0.5),
        0,
        10
      )
    );
    const populars = Object.entries(popularCMD)
      .sort((a, b) => b[1] > a[1])
      .map((i) => i[0]);

    // const cutLatest = latestCommands
    //   .slice(0, 10)
    //   .map((i) => getCommandByFileName(i, commands)?.meta?.name)
    //   .filter(Boolean);

    // console.log(cutLatest);

    const myRecent = recentCMD[input.senderID] ?? [];
    output.reply(`${global.Cassidy.logo}
${UNIRedux.standardLine}
✨ | **System Prefix:** [ ${prefix} ]
🌠 | **Other Prefixes:** [ ${prefixes.slice(1).join(", ")} ]
${UNIRedux.standardLine}
📅 | **Random Commands**:

${
  randomCommands.length > 0
    ? randomCommands.map((i) => `${UNIRedux.disc} ${prefix}${i}`).join("\n")
    : `No random commands.`
}
${UNIRedux.standardLine}
🔥 | **Popular Commands**:

${
  populars.length > 0
    ? populars
        .toReversed()
        .slice(0, 10)
        .map((i) => `${UNIRedux.disc} ${prefix}${i}`)
        .join("\n")
    : `No popular commands.`
}
${UNIRedux.standardLine}
🕒 | **Recent Commands**:

${
  myRecent.length > 0
    ? myRecent
        .toReversed()
        .slice(0, 10)
        .map((i) => `${UNIRedux.disc} ${prefix}${i}`)
        .join("\n")
    : `No recent commands.`
}
${UNIRedux.standardLine}
Use '**${prefix}start**' to list available commands and some concept guides.`);
  } else {
    obj.next();
  }
}
