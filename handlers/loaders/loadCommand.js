/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
  DO NOT MODIFY.
*/

global.loadSymbols ??= new Map();

export const SymLock = new Map();

import { cassWatchJob } from "./casswatch.js";
import fs from "fs/promises";
let isPresetLoaded = false;
export async function loadAllPresets() {
  isPresetLoaded = true;
  const fs = require("fs").promises;
  const files = (await fs.readdir("CommandFiles/stylePresets")).filter((i) =>
    i.endsWith(".json")
  );
  global.logger(`Loading presets`);
  for (const file of files) {
    try {
      const data = await fs.readFile(
        `CommandFiles/stylePresets/${file}`,
        "utf8"
      );
      const json = JSON.parse(data);
      global.Cassidy.presets.set(file, json);
    } catch (error) {
      global.logger(`Cannot load preset: ${file}, ${error}`, "preset");
    }
  }
  let r = {};
  for (const value of global.Cassidy.presets) {
    try {
      Object.assign(r, value);
    } catch (error) {}
  }
  return r;
}

const defaultMeta = {
  name: "",
  description: "No Description",
  otherNames: [],
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "Unconfigured",
  permissions: [0, 1, 2],
  noPrefix: false,
  waitingTime: 5,
  ext_plugins: {},
};

import {
  checkCompatibility,
  getNeanMartPlugin,
  packageInstallerErr,
  isValidVersion,
  deprecationWarning,
} from "./util.js";
import { emojiEnd } from "../../CommandFiles/modules/unisym.js";

export async function loadCommand(
  fileName,
  commands,
  isObj = false,
  force = false,
  transpileOnly = false
) {
  const { import: importModule } = global;
  try {
    if (!isPresetLoaded || force) {
      loadAllPresets();
    }
    let command;
    try {
      if (isObj) {
        command = fileName;
        fileName = command.meta?.name || "";
      } else {
        command = importModule(`CommandFiles/commands/${fileName}`);
      }
    } catch (error) {
      const foo = await packageInstallerErr(error);
      if (foo) {
        console.log(foo);
        return loadCommand(fileName, commands, isObj, true);
      }
      try {
        if (isObj) {
          throw error;
        } else {
          /*command = await import(`../../CommandFiles/commands/${fileName}?version=${Date.now()}`);*/
          throw error;
        }
      } catch (error) {
        throw error;
      }
    }
    //console.log(command);
    const { pack } = command;
    if (pack) {
      for (const cmd in command.pack) {
        const commandPack = command.pack[cmd];
        loadCommand(commandPack, commands, true);
      }
      return;
    }
    command.meta = { ...defaultMeta, ...(command.meta ?? {}) };
    const { meta, entry, duringLoad, noPrefix, reply, onError, onCooldown } =
      command;
    const verRegex = /,?\s*version:\s*"([^"]*)"\s*,/;
    const fileCOntent = await fs.readFile(
      `CommandFiles/commands/${fileName}`,
      "utf-8"
    );
    const version = fileCOntent.match(verRegex)?.[1];
    if (!version || !isValidVersion(version)) {
      throw new Error(`Invalid version found in ${fileName}, got: ${version}`);
    }
    if (typeof entry !== "function" && typeof entry !== "object") {
      throw new Error(
        `'{root}.entry' function should be a function or an object, recieved ${entry?.toString()}`
      );
    }
    if (noPrefix && typeof noPrefix !== "function") {
      throw new Error(
        `'{root}.noPrefix' should be undefined, null, or function, recieved ${noPrefix?.toString()}`
      );
    }
    if (reply && typeof reply !== "function") {
      throw new Error(
        `'{root}.reply' should be undefined, null, or function, recieved ${noPrefix?.toString()}`
      );
    }
    if (!meta || !meta.name) {
      throw new Error(`'{root}.meta' is invalid!`);
    }
    const { allPlugins = {} } = global;

    if (
      !checkCompatibility(meta.requirement || "^1.0.0", global.package.version)
    ) {
      throw new Error(
        `Command ${fileName} requires a newer version of Cassidy. Your current Cassidy is ${global.package.version}, please update to ${meta.requirement}`
      );
    }
    deprecationWarning(meta.requirement);
    if (typeof meta.ext_plugins === "object" && meta.ext_plugins) {
      for (const plugin in meta.ext_plugins) {
        if (!allPlugins[plugin]) {
          try {
            await getNeanMartPlugin(plugin);
            return await loadCommand(fileName, commands, isObj, force);
          } catch (error) {}

          throw new Error(
            `Command '${fileName}' requires plugin '${plugin}' (${meta.ext_plugins[plugin]}), but it is not installed!`
          );
        }
        if (
          !checkCompatibility(
            meta.ext_plugins[plugin],
            allPlugins[plugin]?.meta?.supported
          )
        ) {
          throw new Error(
            `Command '${fileName}' requires plugin '${plugin}' to be updated, but your current version is ${allPlugins[plugin]?.meta?.supported}, please update to ${meta.ext_plugins[plugin]}`
          );
        }
      }
    }
    if (transpileOnly) {
      return command;
    }
    if (typeof duringLoad == "function") {
      (async () => {
        try {
          await duringLoad();
        } catch (err) {
          console.error(err);
        }
      })();
    }
    if (typeof meta.name !== "string") {
      throw new Error(
        `'{root}.meta.name' should be a string, recieved ${typeof meta.name}`
      );
    }
    if (meta.name.includes(" ")) {
      throw new Error(
        `'{root}.meta.name' shouldn't have spaces, recieved '${meta.name}'`
      );
    }
    if (!Array.isArray(meta.otherNames)) {
      meta.otherNames = [meta.otherNames];
    }
    meta.name = meta.name.toLowerCase();
    if (commands[meta.name] && !force) {
      throw new Error(
        `Command '${meta.name}' already exists: '${
          commands[meta.name]?.meta.name
        }', '${commands[meta.name]?.otherNames?.join("")}`
      );
    }
    if (typeof command.load === "function") {
      try {
        await command.load();
      } catch (error) {
        console.log(error);
      }
    }
    command.filePath = `CommandFiles/commands/${fileName}`;
    command.fileName = fileName;
    await cassWatchJob({ commandData: command, fileName, version });

    assignCommand(meta.name, command, commands);
    if (Array.isArray(meta.otherNames)) {
      meta.otherNames.forEach((name) => {
        if (commands[name] && !force) {
          throw new Error(
            `Command '${name}' already exists: '${
              commands[name]?.meta.name
            }', '${commands[name]?.otherNames?.join("")}'`
          );
        }
        assignCommand(name, command, commands);
      });
    }
    if (typeof command.style?.title === "string") {
      emojiEnd(command.style.title);
    }
    global.logger(
      `Loaded command ${meta.name}@${version} ${
        Array.isArray(meta.otherNames)
          ? `and aliases ${meta.otherNames.join(", ")}!`
          : "!"
      }`,
      fileName
    );
  } catch (error) {
    global.logger(
      `Failed to load command '${fileName}'! Error: ${error.message}`,
      fileName
    );
    console.log(error);
    return error;
  }
}

export function assignCommand(name, command, commands) {
  const ssyx = Symbol(name);
  SymLock["set"](name, ssyx);
  const { entry } = command;
  commands[name] = {
    ...command,
    meta: { ...defaultMeta, ...command.meta },
    entry(ctx) {
      return ctx?.output.wentWrong();
    },
  };
  commands[name].entry.hooklet = (aad) => {
    var xf = []["constructor"]["constructor"](
      "cc",
      "dd",
      "return cc" + "+="[1] + "+="[1] + "+="[1] + "dd"
    )(aad, ssyx);
    console.log("AAD:", aad);
    while (![xf].map(() => 0).concat([1])[+!xf]) {
      throw SymLock;
    }
    return entry;
  };
}
