import fs from "fs";
import axios from "axios";
import { PasteClient } from "pastebin-api";
const { compareCode } = global.utils;
import path from "path";

export const meta: CassidySpectra.CommandMeta = {
  name: "system",
  author: "Liane Cagara 🎀",
  noPrefix: false,
  version: "1.7.3",
  description: "Manage system files and modules (original ver)",
  usage: "system [command]",
  permissions: [2],
  botAdmin: true,
  allowModerators: true,
  waitingTime: 1,
  requirement: "3.0.0",
  icon: "💽",
  category: "System",
};

interface Errors {
  [key: string]: Error | object;
}

export class style {
  title = {
    text_font: "bold",
    content: "System Control 💽",
    line_bottom: "default",
  };
  content = {
    text_font: "none",
    content: null,
  };
}

export async function entry({
  output: box,
  api,
  input,
  AutoEdit,
}: CommandContext): Promise<boolean> {
  let args = input.arguments;

  const system = ``;

  const {
    loadAllCommands: loadAll,
    loadPlugins,
    loadCommand,
    commands,
  }: {
    loadAllCommands: (callback?: any) => Promise<Errors | boolean>;
    loadPlugins: (
      arg: any,
      force: boolean,
      callback?: any
    ) => Promise<Errors | boolean>;
    commands: any;
    loadCommand: (
      fileName: string,
      commands?: any,
      isObj?: boolean,
      force?: boolean,
      transpileOnly?: boolean
    ) => Promise<any>;
  } = global.Cassidy as any;
  const {
    fileStrings,
    fileVersions,
  }: {
    fileStrings: Map<string, string>;
    fileVersions: Map<string, string[]>;
  } = global.CassWatch;
  const commandsPath: string = "CommandFiles/commands";
  async function handleRefreshFiles(ffs: string[] = []): Promise<any> {
    let i: any;
    const fsp = fs.promises;
    const files: string[] = (await fsp.readdir(commandsPath)).filter(
      (i) => i.endsWith(".js") || i.endsWith(".ts")
    );
    const currentFileStrings: Map<string, string> = new Map();
    const errors: Errors = {};
    for (const key of files) {
      try {
        const filePath: string = path.join(commandsPath, key);
        if (!fs.existsSync(filePath)) {
          continue;
        }
        const fileContent: string = await fsp.readFile(filePath, "utf-8");
        currentFileStrings.set(key, fileContent);
      } catch (error) {
        console.error(error);
        errors[key] = error;
      }
    }
    let willReloads: string[] = [];
    for (const key of fileStrings.keys()) {
      if (!fs.existsSync(path.join(commandsPath, key))) {
        continue;
      }
      const a = fileStrings.get(key);
      const b = currentFileStrings.get(key);
      if (a !== b || !a) {
        willReloads.push(key);
      }
    }
    const x2 = ffs.length > 0 ? ffs : args;
    for (const key of x2) {
      if (currentFileStrings.has(key) && !willReloads.includes(key)) {
        willReloads.push(key);
      }
    }
    const reloadsSum: string = (
      await Promise.all(
        willReloads.map(async (x) => {
          const latestVers = fileVersions.get(x);
          //const fileA = fileStrings.get(x) ?? currentFileStrings.get(x);
          //const fileB = currentFileStrings.get(x);
          //const { diffString, status } = await compareCode(fileB, fileA);
          let txt =
            `✦ ` +
            x +
            `@${latestVers ? latestVers[latestVers.length - 1] : "unknown"}`;
          if (args.includes(x)) {
            txt += ` [requested]`;
          } else {
            txt += ` [changed]`;
          }
          //txt += `\n${status === "added" ? diffString : "No Changes."}`;
          return txt;
        })
      )
    ).join("\n");
    if (!input.isWeb) {
      const z: any = await box.quickWaitReact(
        willReloads.length > 0
          ? `✅ We have detected ${willReloads.length} files that will be reloaded.

${reloadsSum}

React with 👍 to continue.`
          : `✅ There's nothing to reload!`,
        {
          authorOnly: true,
          emoji: "👍",
        }
      );
      i = z.self;
    }
    if (willReloads.length <= 0) {
      if (input.isWeb) {
        return box.reply(`✅ There's nothing to reload!`);
      }
      return;
    }
    if (i) {
      await box.edit(`🔃 | Reloading edited commands...`, i.messageID);
    }
    for (const key of willReloads) {
      try {
        const rKey = __dirname + "/" + key;
        if (!require.cache[rKey]) {
          //throw new Error("Missing cache for: " + rKey);
        } else {
          delete require.cache[rKey];
        }
        const error = await loadCommand(key, commands, false, true);
        if (error) {
          throw error;
        }
        fileStrings.set(key, currentFileStrings.get(key));
        /*if (backupCache === require.cache[rKey]) {
          throw new Error("Failed Clearing cache for: " + rKey);
        }*/
      } catch (error: any) {
        errors[key] = error;
        console.error(error); //lmao rip console
      }
    }
    let response = "";
    if (Object.keys(errors).length > 0) {
      const errs = errors;
      let res: string = `❌ | Failed to reload ${
        errs && typeof errs === "object" ? Object.keys(errs).length : 0
      } modules:\n\n`;
      await new Promise<void>((r) => setTimeout(r, 1000));
      let num: number = 1;
      for (const x of Object.entries(errs)) {
        const [file, error]: [string, any] = x;
        res += `${num}. ${file}\n--> ${error}\nSTACK: ${error.stack}\n\n`;
        num++;
      }
      response = res;
    } else {
      response = `🟢 | Loaded ${willReloads.length} modules.`;
    }
    if (i) {
      await new Promise<void>((r) => setTimeout(r, 1000));
      await box.edit(response, i.messageID);
    } else {
      await box.reply(response);
    }
  }

  function handleNotAdmin(): boolean {
    if (!input.isAdmin) {
      box.reply(`❌ | You need to be an admin to use this risky operation.`);
      return true;
    } else {
      return false;
    }
  }
  async function handleLoad(): Promise<boolean> {
    let i: any;
    if (handleNotAdmin()) {
      return false;
    }
    if (!input.isWeb) {
      const z: any = await box.quickWaitReact(
        `⚠️ | **Warning**:
Do not run this command in a server with lower resources, especially free tier in Render.com.

**Possible Dangers:**
- Your server might reach the memory limit, and will cause Bad Gateway Error (502)
- It will take more than 40 Minutes before the server is fully loaded, after the 502 error caused by reaching the memory limit.
- Obviously, your bot might not respond.

Consider using **system load** instead if you want to reload edited/installed command files (excluding plugins).

By sending a 👍 reaction, you are aware of the potential problems that might occur.`,
        {
          authorOnly: true,
          emoji: "👍",
        }
      );
      i = z.self;
      //await box.edit(`⚙️ | Getting started..`, i.messageID);
    } else {
      await box.reply(`⚠️ | You cannot reload a system on web.`);
      return false;
    }
    let auto: any = new AutoEdit(Infinity);
    // auto.messageID = i.messageID;
    await new Promise<void>((r) => setTimeout(r, 1000));
    if (i) {
      await box.edit(`🔃 | Reloading all commands...`, i.messageID);
    }
    const errs1: Errors | boolean = await loadAll(
      async (error: any, fileName: string) => {
        if (error) {
          auto = await auto.do(`❌ ${fileName}`);
        } else {
          auto = await auto.do(`✅ ${fileName}`);
        }
      }
    );
    await new Promise<void>((r) => setTimeout(r, 1000));
    console.log(`Commands loaded.`);
    if (i) {
      await box.edit(`🔃 | Reloading all plugins...`, i.messageID);
    }
    auto.do(`✅ | Commands Loaded!`);
    auto = new AutoEdit(Infinity);
    const errs2: Errors | boolean = await loadPlugins(
      global.Cassidy.plugins as any,
      true,
      async (error: any, fileName: string) => {
        if (error) {
          auto = await auto.do(`❌ ${fileName}`);
        } else {
          auto = await auto.do(`✅ ${fileName}`);
        }
      }
    );
    auto.do(`✅ | Plugins Loaded!`);

    console.log(`Plugins loaded`);
    const errs: Errors | boolean = {
      ...(errs1 as Errors),
      ...(errs2 as Errors),
    };
    let res: string = `❌ | Failed to reload ${
      errs && typeof errs === "object" ? Object.keys(errs).length : 0
    } modules and plugins:\n\n`;
    await new Promise<void>((r) => setTimeout(r, 1000));
    let num: number = 1;
    if (errs && Object.keys(errs).length > 0) {
      for (const x of Object.entries(errs)) {
        const [file, error]: [string, any] = x;
        res += `${num}. ${file}\n--> ${error}\nSTACK: ${error.stack}\n\n`;
        num++;
      }
      if (i) {
        await box.edit(res, i.messageID);
      } else {
        await box.reply(res);
      }
      return false;
    }
    await new Promise<void>((r) => setTimeout(r, 1000));
    if (i) {
      await box.edit(`📥 | Saving changes...`, i.messageID);
    }
    /*await new Promise<void>((r) => setTimeout(r, 1000));
    await box.edit(`📥 | Almost there...`, i.messageID);*/
    const { commands, plugins }: any = global.Cassidy as any;
    const commandsLength: number = [...new Set(Object.keys(commands))].length;
    const pluginsLength: number = [...new Set(Object.keys(plugins))].length;
    const str = `🟢 | Loaded All ${commandsLength} commands and ${pluginsLength} plugins!`;

    await new Promise<void>((r) => setTimeout(r, 1000));
    if (false) {
      await box.edit(str, i.messageID);
    } else {
      await box.reply(str);
    }
    return true;
  }

  async function deleteFile(fileName: string): Promise<boolean> {
    if (fileName === "system.ts") {
      await box.reply(`❌ | You cannot delete this file.`);
      return false;
    }
    const filePath: string = `CommandFiles/commands/${fileName}`;
    let trashPath: string = `CommandFiles/commands/trash/${fileName}`;

    if (!fs.existsSync(filePath)) {
      await box.reply(`❌ | File "${fileName}" does not exist.`);
      return false;
    }
    const backup: string = fs.readFileSync(filePath, "utf-8");

    await box.quickWaitReact(
      `⚠️ Are you sure you want to move "${fileName}" to trash?`,
      {
        edit: `✅ Moving to trash...`,
        authorOnly: true,
      }
    );
    let num = 0;
    while (fs.existsSync(trashPath)) {
      num++;
      trashPath = `CommandFiles/commands/trash/${num}_${fileName}`;
    }
    fs.writeFileSync(trashPath, backup);
    fs.unlinkSync(filePath);
    const commandKeys = Object.keys(commands).filter(
      (key) => commands[key].fileName === fileName
    );
    setTimeout(() => {
      if (commandKeys.length > 0) {
        for (const keys of commandKeys) {
          delete commands[keys];
        }
      }
    }, 5000);
    await box.reply(
      `✅ | File "${fileName}" has been moved to trash, and will be unloaded after 5 seconds..`
    );
    return true;
  }
  async function recoverTrash(
    trashName: string,
    fileName?: string
  ): Promise<boolean> {
    fileName ??= trashName;
    const trashPath: string = `CommandFiles/commands/trash/${trashName}`;
    const newPath: string = `CommandFiles/commands/${fileName ?? trashName}`;
    if (fs.existsSync(newPath)) {
      box.reply(
        `❌ | File "${newPath}" already exists in the command files, you must delete/trash it first.`
      );
      return false;
    }
    if (!fs.existsSync(trashPath)) {
      box.reply(`❌ | File "${trashPath}" does not exist in the trash.`);
      return false;
    }
    await box.quickWaitReact(
      `⚠️ Do you want to recover the trash file "${trashPath}" replacing "${newPath}" in command files?`,
      {
        edit: `✅ | File "${fileName}" has been recovered from trash.`,
        authorOnly: true,
      }
    );

    const backup: string = fs.readFileSync(trashPath, "utf-8");
    fs.writeFileSync(newPath, backup);
    await handleRefreshFiles([fileName]);
    //await box.reply(`✅ | File "${fileName}" has been recovered from trash.`);
    return true;
  }

  async function sendFile(fileName: string): Promise<boolean> {
    if (handleNotAdmin()) {
      return false;
    }

    const filePath: string = `CommandFiles/commands/${fileName}`;

    if (!fs.existsSync(filePath)) {
      await box.reply(`❌ | File "${fileName}" does not exist.`);
      return false;
    }

    await box.quickWaitReact(`⚠️ Do you want to send "${fileName}"?`, {
      edit: `✅ Sending...`,
      authorOnly: true,
    });
    const fileContent: string =
      `// ${filePath}\n\n` + fs.readFileSync(filePath, "utf-8");

    await api.sendMessage(fileContent, input.threadID);
    return true;
  }

  async function uploadToPastebin(fileName: string): Promise<boolean> {
    if (handleNotAdmin()) {
      return false;
    }

    const filePath: string = `CommandFiles/commands/${fileName}`;

    if (!fs.existsSync(filePath)) {
      await box.reply(`❌ | File "${fileName}" does not exist.`);
      return false;
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");

    try {
      const client = new PasteClient("R02n6-lNPJqKQCd5VtL4bKPjuK6ARhHb");
      const url = await client.createPaste({
        code: fileContent,
        expireDate: "N" as any,
        format: "javascript",
        name: fileName,
        publicity: 1,
      });
      await box.reply({
        body: `✅ | Uploaded "${fileName}" to Pastebin: ${url.replaceAll(
          "pastebin.com/",
          "pastebin.com/raw/"
        )}`,
        noStyle: true,
      });
      return true;
    } catch (error) {
      console.error("Failed to upload to Pastebin:", error);
      await box.reply(`❌ | Failed to upload "${fileName}" to Pastebin.`);
      return false;
    }
  }

  if (args[0] === "reload") {
    if (handleNotAdmin()) {
      return false;
    }

    return await handleLoad();
  } else if (args[0] === "install" && args[1] && args[2]) {
    if (handleNotAdmin()) {
      return false;
    }

    if (!args[1].endsWith(".js") && !args[1].endsWith(".ts")) {
      await box.reply(`❌ | Only .js or .ts file extensions were allowed!`);
      return false;
    }

    const fileName: string = args[1];
    const filePath: string = `CommandFiles/commands/${fileName}`;
    let code: string = args.slice(2).join(" ");

    if (args[2].startsWith(`https://`) || args[2].startsWith(`http://`)) {
      try {
        const response = await axios.get(args[2]);
        code = response.data;
      } catch (err) {
        await box.reply(`❌ | Failed to download the file from the given URL.`);
        return false;
      }
    }

    if (fs.existsSync(filePath)) {
      const orig = fs.readFileSync(filePath, "utf-8");
      const { status, diffString } = await compareCode(code, orig);
      await box.quickWaitReact(
        `⚠️ The file ${fileName} already exists, please react with any emoji to proceed.(Your files will be automatically added to trash.)${
          status === "added" ? `\n\n💻 **Cassidy Diff**\n\n${diffString}` : ""
        }`,
        {
          edit: `✅ Proceeding...`,
          authorOnly: true,
        }
      );
      let trashPath = `CommandFiles/commands/trash/replace_${fileName}`;
      let num: number = 0;
      while (fs.existsSync(trashPath)) {
        num++;
        trashPath = `CommandFiles/commands/trash/${num}_replace_${fileName}`;
      }
      fs.writeFileSync(trashPath, orig);
    }

    fs.writeFileSync(filePath, code);
    /*await box.reply(`✅ | Successfully installed ${fileName}!

at ${filePath}`);*/
    await handleRefreshFiles([fileName]);
    return true;
  } else if (args[0] === "trash") {
    if (args[1] === "list") {
      const files: string[] = fs.readdirSync("CommandFiles/commands/trash");
      await box.reply(`${system}
${files.length} file${files.length > 1 ? "s" : ""} found.

${files.join("\n")}`);
      return true;
    } else if (args[1] === "recover" && args[2]) {
      return await recoverTrash(args[2], args[3] || null);
    }
    if (!args[1]) {
      await box.reply(
        `❌ | Please specify the filename you want to move to trash.`
      );
      return false;
    }
    return await deleteFile(args[1]);
  } else if (args[0] === "file") {
    if (handleNotAdmin()) {
      return false;
    }

    if (!args[1]) {
      await box.reply(`❌ | Please specify the filename to send.`);
      return false;
    }
    return await sendFile(args[1]);
  } else if (args[0] === "bin") {
    if (handleNotAdmin()) {
      return false;
    }

    if (!args[1]) {
      await box.reply(
        `❌ | Please specify the filename to upload to Pastebin.`
      );
      return false;
    }
    return await uploadToPastebin(args[1]);
  } else if (args[0] === "list") {
    const files: string[] = fs.readdirSync("CommandFiles/commands");
    await box.reply(`${system}
${files.length} file${files.length > 1 ? "s" : ""} found.

${files.join("\n")}`);
  } else if (args[0] === "load") {
    args.shift();
    await handleRefreshFiles();
    return true;
  } else {
    await box.reply(`${system}
👑 reload (deprecated)
🛡️ load <...filenames>
👑 install <filename> <link|code>
🛡️ trash <filename|'list'|'recover' [trashfile] [newfile]>
👑 file <filename>
👑 bin <filename>
🛡️ list`);
    return false;
  }
}
