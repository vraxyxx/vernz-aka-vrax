import { formatIP } from "../../webSystem.js";
import { censor } from "fca-liane-utils";
const { stringArrayProxy } = global.utils;
import {
  InputProps,
  ReactObj,
  ReactSystem,
  RepliesObj,
  ReplySystem,
  StandardReactArg,
  StandardReplyArg,
  InpProperty,
} from "input-cassidy";
import UserStatsManager from "../../handlers/database/handleStat";
import OutputProps, { OutputResult } from "output-cassidy";
import { inspect } from "node:util";

export class InputClass extends String implements InputProps {
  public messageID?: string = null;
  public xQ?: any = null;
  public isPage?: boolean = false;
  public strictPrefix?: boolean = false;
  public body: string = "";
  public senderID: string = null;
  public userID: string = null;
  public type: string = null;
  public threadID: string = null;
  public author: string = null;
  public reaction: string = null;
  public password?: string = null;
  public messageReply?: InputClass = null;
  public mentions: { [key: string]: string } = null;
  public attachments: any[] = null;
  public timestamp: number = null;
  public isGroup: boolean = null;
  public participantIDs?: string[] = null;
  public isWeb: boolean = false;
  public isWss: boolean = false;
  public arguments: string[] & { original: string[] } = null;
  public args: string[] & { original: string[] } = null;
  public argPipe: string[] = null;
  public argPipeArgs: string[][] = null;
  public argArrow: string[] = null;
  public argArrowArgs: string[][] = null;
  public wordCount: number = 0;
  public property: InpProperty = {};
  public propertyArray: string[] = [];
  public charCount: number = 0;
  public allCharCount: number = 0;
  public links: string[] | null = null;
  public mentionNames: string[] | null = null;
  public numbers: string[] | null = null;
  public words: string[] = null;
  public text: string = "";
  public sid: string = null;
  public tid: string = null;
  public replier?: InputClass = null;
  public hasMentions: boolean = false;
  public firstMention: { name: string; [key: string]: any } | null = null;
  public isThread: boolean = false;
  public detectUID?: string = null;
  public detectID?: string = null;
  public censor: (text: string) => string;

  public webQ?: string = null;
  public defStyle?: any = null;
  public style?: any = null;
  public isFacebook?: boolean = false;
  public originalBody?: string = null;
  #__context: CommandContext;

  #__api: any;
  #__threadsDB: UserStatsManager;
  public ReplySystem: ReplySystem;
  public ReactSystem: ReactSystem;

  constructor(obj: CommandContext) {
    const { replies, reacts } = global.Cassidy;
    super(String(obj.event?.body || ""));
    Object.assign(this, obj.event);
    this.#__api = obj.api;
    this.#__threadsDB = obj.threadsDB;
    this.censor = censor;

    this.processEvent(obj.event, obj.command?.meta?.autoCensor ?? false);

    this.#__context = obj;
    const self = this;

    this.ReplySystem = {
      set<T extends StandardReplyArg>(
        detectID: string,
        repObj: T
      ): RepliesObj<T> {
        if (!self.#__context.commandName && !repObj.key && !repObj.callback) {
          throw new Error("No command detected");
        }
        if (!detectID) {
          return;
        }
        let key = repObj.key || self.#__context.commandName;
        if (
          !self.#__context.commands[key] &&
          !self.#__context.commands[key.toLowerCase()] &&
          !repObj.callback
        ) {
          return;
        }
        global.currData =
          self.#__context.commands[key] ||
          self.#__context.commands[key.toLowerCase()];
        replies[detectID] = {
          repObj,
          commandKey: key,
          detectID,
        };
        return replies[detectID] as RepliesObj<T>;
      },
      delete<T extends StandardReplyArg>(detectID: string): RepliesObj<T> {
        if (!detectID) {
          throw new Error("Invalid Detect ID");
        }
        if (!replies[detectID]) {
          return null;
        }
        const backup = replies[detectID];
        delete replies[detectID];
        return backup as RepliesObj<T>;
      },
      get<T extends StandardReplyArg>(detectID: string): RepliesObj<T> {
        if (!detectID) {
          throw new Error("Invalid Detect ID");
        }
        if (!replies[detectID]) {
          return null;
        }
        return replies[detectID] as RepliesObj<T>;
      },
    };

    this.ReactSystem = {
      set<T extends StandardReactArg>(
        detectID: string,
        reactObj: T
      ): ReactObj<T> {
        if (
          !self.#__context.commandName &&
          !reactObj.key &&
          !reactObj.callback
        ) {
          throw new Error("No command detected");
        }
        if (!detectID) {
          throw new Error("Invalid Detect ID");
        }
        let key = reactObj.key || self.#__context.commandName;
        if (
          !self.#__context.commands[key] &&
          !self.#__context.commands[key.toLowerCase()]
        ) {
          throw new Error("Command not found.");
        }
        global.currData =
          self.#__context.commands[key] ||
          self.#__context.commands[key.toLowerCase()];
        reacts[detectID] = {
          reactObj,
          commandKey: key,
          detectID,
        };
        return reacts[detectID] as ReactObj<T>;
      },
      delete<T extends StandardReactArg>(detectID: string): ReactObj<T> {
        if (!detectID) {
          throw new Error("Invalid Detect ID");
        }
        if (!reacts[detectID]) {
          return null;
        }
        const backup = reacts[detectID];
        delete reacts[detectID];
        return backup as ReactObj<T>;
      },
      get<T extends StandardReactArg>(detectID: string): ReactObj<T> {
        if (!detectID) {
          throw new Error("Invalid Detect ID");
        }
        if (!reacts[detectID]) {
          return null;
        }
        return reacts[detectID] as ReactObj<T>;
      },
    };

    for (const method of Reflect.ownKeys(InputClass.prototype)) {
      const m = this[method];
      try {
        if (typeof m === "function") {
          this[method] = (m as Function).bind(this);
        }
      } catch (error) {}
    }
  }

  public get setReply() {
    return this.ReplySystem.set;
  }
  public get delReply() {
    return this.ReplySystem.delete;
  }
  public get getReply() {
    return this.ReplySystem.get;
  }
  public get setReact() {
    return this.ReactSystem.set;
  }
  public get delReact() {
    return this.ReactSystem.delete;
  }
  public get getReact() {
    return this.ReactSystem.get;
  }

  public attachToContext(ctx: CommandContext = this.#__context) {
    ctx.input = this;
    ctx.censor = censor;
    ctx.replySystem = this.ReplySystem;
    ctx.reactSystem = this.ReactSystem;
    ctx.args = this.arguments;
    ctx.InputClass = InputClass;
  }

  private processEvent(event: Partial<InputProps>, autoCensor: boolean): void {
    try {
      this.senderID = event.senderID;
      this.threadID = event.threadID;
      this.type = event.type;
      this.author = event.author;
      this.reaction = event.reaction;
      this.messageID = event.messageID;
      this.password = event.password;
      this.mentions = event.mentions ?? {};
      this.attachments = event.attachments ?? [];
      this.timestamp = event.timestamp;
      this.isGroup = event.isGroup;
      this.participantIDs = event.participantIDs;
      if ("userID" in event && typeof event.userID === "string") {
        this.userID = event.userID;
      }

      this.originalBody = event.body ?? "";

      this.body = event.body ?? "";

      const { forceWebUID = false } = global.Cassidy.config;
      if (forceWebUID) {
        this.__formatWebUIDs();
      }

      if (autoCensor) {
        this.body = censor(this.body);
      }

      this.__processMentions();

      this.__parseInput();

      this.sid = this.senderID;
      this.tid = this.threadID;
      this.hasMentions = Object.keys(this.mentions).length > 0;
      this.firstMention = this.hasMentions
        ? {
            name: Object.keys(this.mentions)[0].replace("@", ""),
          }
        : null;
      this.isThread = this.senderID !== this.threadID;
      this.detectUID = this.__getDetectUID();
      this.detectID = this.detectUID;
      this.text = this.body;

      if (event.messageReply) {
        this.replier = new InputClass({
          ...this.#__context,
          event: event.messageReply,
        });
        this.messageReply = this.replier;
      }
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }

  private __formatWebUIDs(): void {
    if (!this.senderID.startsWith("web:")) {
      this.senderID = formatIP(`custom_${this.senderID}`);
    }
    if (this.messageReply && !this.messageReply.senderID.startsWith("web:")) {
      this.messageReply.senderID = formatIP(
        `custom_${this.messageReply.senderID}`
      );
    }
    if (Array.isArray(this.participantIDs)) {
      this.participantIDs = this.participantIDs.map((id) =>
        id.startsWith("web:") ? id : formatIP(`custom_${id}`)
      );
    }
  }

  private __processMentions(): void {
    if (this.mentions && Object.keys(this.mentions).length > 0) {
      for (const uid in this.mentions) {
        this.body = this.body.replace(this.mentions[uid], uid);
      }
    }
    this.body = this.body
      .replace(/\[uid\]/gi, this.senderID)
      .replace(/\[thisid\]/gi, this.messageReply?.senderID ?? this.senderID);
  }

  private __parseInput(): void {
    const body = this.body;

    const args6 = body
      .split(" ")
      .filter((i) => !!i)
      .slice(1);
    this.arguments = stringArrayProxy(args6);
    this.arguments.original = stringArrayProxy(
      this.originalBody!.split(" ")
        .filter((i) => !!i)
        .slice(1)
    );
    this.args = this.arguments;

    this.argPipe = stringArrayProxy(
      this.arguments
        .join(" ")
        .split("|")
        .map((i) => i.trim())
    );
    this.argPipeArgs = this.argPipe.map((item) =>
      item.split(" ").filter((i) => !!i)
    );
    this.argArrow = stringArrayProxy(
      this.arguments
        .join(" ")
        .split("=>")
        .map((i) => i.trim())
    );
    this.argArrowArgs = this.argArrow.map((item) =>
      item.split(" ").filter((i) => !!i)
    );

    this.words = stringArrayProxy(body.split(" ").filter((i) => !!i));
    this.wordCount = this.words.length;
    this.charCount = body.split("").filter((i) => !!i).length;
    this.allCharCount = body.length;

    this.links = body.match(/(https?:\/\/[^\s]+)/g);
    this.mentionNames = body.match(/@[^\s]+/g);
    this.numbers = body.match(/\d+/g);
  }

  private __getDetectUID(): string | undefined {
    if (this.hasMentions) {
      return Object.keys(this.mentions)[0];
    }
    if (this.messageReply) {
      return this.messageReply.senderID;
    }
    return undefined;
  }

  public splitBody(splitter: string, str: string = this.body): string[] {
    return str
      .replaceAll(`\\${splitter}`, "x69_input")
      .split(splitter)
      .map((i) => i.trim())
      .map((i) => i.replaceAll("x69_input", splitter))
      .filter(Boolean);
  }

  public splitArgs(splitter: string, arr: string[] = this.arguments): string[] {
    return arr
      .join(" ")
      .replaceAll(`\\${splitter}`, "x69_input")
      .split(splitter)
      .map((i) => i.trim())
      .map((i) => i.replaceAll("x69_input", splitter))
      .filter(Boolean);
  }

  public test(reg: string | RegExp): boolean {
    const regex = typeof reg === "string" ? new RegExp(reg, "i") : reg;
    return regex.test(this.body);
  }

  public get isAdmin(): boolean {
    const { ADMINBOT, WEB_PASSWORD } = global.Cassidy?.config ?? {};
    const webPassword = process.env.WEB_PASSWORD ?? WEB_PASSWORD;
    return this.password === webPassword || ADMINBOT?.includes(this.senderID);
  }

  public get isModerator(): boolean {
    const { ADMINBOT, MODERATORBOT } = global.Cassidy?.config ?? {};
    return (
      MODERATORBOT?.includes(this.senderID) &&
      !ADMINBOT?.includes(this.senderID)
    );
  }

  public _isAdmin(uid: string): boolean {
    return uid === this.senderID
      ? this.isAdmin
      : global.Cassidy?.config?.ADMINBOT?.includes(uid);
  }

  public _isModerator(uid: string): boolean {
    const { ADMINBOT, MODERATORBOT } = global.Cassidy?.config ?? {};
    return MODERATORBOT?.includes(uid) && !ADMINBOT?.includes(uid);
  }

  public async userInfo(): Promise<UserData["userMeta"] | undefined> {
    await this.#__context.usersDB.ensureUserInfo(this.senderID);
    const data = await this.#__context.usersDB.queryItem(
      this.senderID,
      "userMeta"
    );
    return data.userMeta;
  }

  public async isThreadAdmin(uid: string, refresh = false): Promise<boolean> {
    if (refresh) {
      await this.#__threadsDB.saveThreadInfo(this.threadID, this.#__api);
    } else {
      await this.#__threadsDB.ensureThreadInfo(this.threadID, this.#__api);
    }
    const { threadInfo } = await this.#__threadsDB.getItem(this.threadID);
    return Boolean(
      threadInfo && threadInfo.adminIDs.some((i: any) => i.id === uid)
    );
  }

  public attachSystemsToOutput(output: OutputProps) {
    const obj = this.#__context;
    const { replies } = global.Cassidy;
    const input = this;
    if (!output) {
      throw new Error("Output is missing!");
    }
    output.waitForReaction = async (body, callback) => {
      return new Promise(async (resolve, reject) => {
        const reactSystem = this.ReactSystem;
        const i = await obj.output.reply(body);

        reactSystem.set(i.messageID, {
          // @ts-ignore
          callback:
            callback ||
            // @ts-ignore
            (async ({ input, repObj: { resolve } }) => {
              resolve(input);
            }),
          resolve,
          reject,
          self: i,
          author: input.senderID,
        });
      });
    };
    obj.output.addReactionListener = async (mid, callback) => {
      return new Promise(async (resolve, reject) => {
        const reactSystem = this.ReactSystem;

        reactSystem.set(mid, {
          // @ts-ignore
          callback:
            callback ||
            // @ts-ignore
            (async ({ input, repObj: { resolve } }) => {
              resolve(input);
            }),
          resolve,
          reject,
        });
      });
    };
    obj.output.quickWaitReact = async (body, options = {}) => {
      if (input.isWeb) {
        return input;
      }

      const outcome = await output.waitForReaction(
        body + `\n\n𝘛𝘩𝘪𝘴 𝘮𝘦𝘴𝘴𝘢𝘨𝘦 𝘦𝘹𝘱𝘦𝘤𝘵𝘴 𝘢 𝘳𝘦𝘢𝘤𝘵𝘪𝘰𝘯.`,
        async ({ input, reactObj }) => {
          const { self, resolve } = reactObj as {
            self: OutputResult;
            resolve: (value: any) => void;
          };
          if (
            options.authorOnly &&
            // @ts-ignore
            input.userID !== (options.author || reactObj.author)
          ) {
            console.log(
              // @ts-ignore
              `${self.messageID} not author for ${input.userID} !== ${reactObj.author}`
            );
            return;
          }
          if (options.emoji && options.emoji !== input.reaction) {
            console.log(
              `${self.messageID} not emoji for ${options.emoji} !== ${input.reaction}`
            );
            return;
          }
          if (options.edit) {
            await obj.output.edit(options.edit, self.messageID);
          }
          // @ts-ignore
          input.self = self;
          resolve(input);
        }
      );
      return outcome;
    };

    obj.output.addReplyListener = async (mid, callback) => {
      if (typeof callback !== "function") {
        callback = (ctx) => {
          // @ts-ignore
          return ctx.repObj.resolve(ctx);
        };
      }
      console.log(`New Reply listener for ${mid}`, callback.toString());
      return new Promise(async (resolve, reject) => {
        this.ReplySystem.set(mid, {
          // @ts-ignore
          callback,
          resolve,
          reject,
        });
        const keys = Object.keys(replies);
        if (!keys.includes(mid)) {
          throw new Error("Unknown Issue: " + mid);
        } else {
          console.log(keys);
        }
      });
    };
    obj.output.waitForReply = async (body, callback) => {
      return new Promise(async (resolve, reject) => {
        const replySystem = this.ReplySystem;

        const i = await obj.output.reply({ body, referenceQ: obj.input.webQ });
        async function something(context, ...args) {
          console.log(`input.webQ: ${input.webQ}, new; ${context.input.webQ}`);
          input.webQ = context.input.webQ;
          const func =
            callback ||
            (async ({ input, repObj: { resolve } }) => {
              // @ts-ignore
              resolve(input);
            });
          // @ts-ignore
          return await func(context, ...args);
        }
        replySystem.set(i.messageID, {
          callback: something,
          resolve,
          reject,
          author: input.senderID,
          self: i,
        });
      });
    };
  }

  public async detectAndProcessReplies() {
    try {
      const input = this;
      const { commands } = this.#__context;
      const obj = this.#__context;
      const { replies } = global.Cassidy;

      if (input.replier && replies[input.replier.messageID]) {
        const { repObj, commandKey, detectID } =
          replies[input.replier.messageID];
        console.log("ReplySystem", replies[input.replier.messageID]);
        const { callback } = repObj;
        const command: Partial<CassidySpectra.CassidyCommand> =
          (commands[commandKey] || commands[commandKey.toLowerCase()]) ?? {};

        obj.repCommand = command;
        const targetFunc = callback || command.reply;
        if (typeof targetFunc === "function") {
          try {
            await targetFunc({
              ...obj,
              repObj,
              detectID,
              commandName: commandKey,
              command,
            });
          } catch (error) {
            obj.output.error(error);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async detectAndProcessReactions() {
    try {
      const input = this;
      const { commands } = this.#__context;
      const obj = this.#__context;
      const { reacts } = global.Cassidy;
      if (input.type == "message_reaction" && reacts[input.messageID]) {
        console.log(`Handling reaction for ${input.messageID}`);
        const { reactObj, commandKey, detectID } = reacts[input.messageID];
        const { callback } = reactObj;
        const command: Partial<CassidySpectra.CassidyCommand> =
          commands[commandKey] || commands[commandKey.toLowerCase()] || {};
        obj.reactCommand = command;
        const targetFunc = callback || command.reaction;
        if (typeof targetFunc === "function") {
          try {
            await targetFunc({
              ...obj,
              reactObj,
              detectID,
              commandName: commandKey,
              command,
            });
          } catch (error) {
            obj.output.error(error);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public is(): string;
  public is(type: string): boolean;
  public is(...types: string[]): boolean;

  public is(...args: string[]) {
    if (args.length === 0) {
      return this.type;
    }
    return args.includes(this.type);
  }

  hasWordOR(...words: string[]): boolean {
    if (!this.isMessage()) {
      return false;
    }
    return words.some((word) => this.body.includes(word));
  }

  get has() {
    return this.hasOR;
  }

  get hasWord() {
    return this.hasWordOR;
  }

  isMessage() {
    return this.is("message", "message_reply");
  }

  hasOR(...chars: string[]): boolean {
    if (!this.isMessage()) {
      return false;
    }
    return chars.some((char) => this.body.includes(char));
  }

  hasWordAND(...words: string[]): boolean {
    if (!this.isMessage()) {
      return false;
    }
    return words.every((word) => this.body.includes(word));
  }

  hasAND(...chars: string[]): boolean {
    if (!this.isMessage()) {
      return false;
    }
    return chars.every((char) => this.body.includes(char));
  }

  starts(...chars: string[]): boolean {
    if (!this.isMessage()) {
      return false;
    }
    return chars.some((char) => this.body.startsWith(char));
  }

  ends(...chars: string[]): boolean {
    if (!this.isMessage()) {
      return false;
    }
    return chars.some((char) => this.body.endsWith(char));
  }

  equal(...strs: string[]): boolean {
    if (!this.isMessage()) {
      return false;
    }
    return strs.some((i) => i === this.body);
  }

  lower(): InputClass {
    if (!this.isMessage()) {
      return this.clone();
    }
    return new InputClass({
      ...this.#__context,
      event: {
        ...this.#__context.event,
        body: String(this.#__context.event.body).toLowerCase(),
      },
    });
  }

  clone() {
    return new InputClass(this.#__context);
  }

  toJSON() {
    let ignored = ["ReplySystem", "ReactSystem"];
    return Object.fromEntries(
      Object.entries(this)
        .filter((i) => typeof i[1] !== "function")
        .filter((i) => !ignored.includes(i[0]))
    );
  }

  [inspect.custom]() {
    return inspect(this.toJSON(), {
      depth: 1,
    });
  }

  [Symbol.toStringTag]() {
    return InputClass.name;
  }
}

export default InputClass;
