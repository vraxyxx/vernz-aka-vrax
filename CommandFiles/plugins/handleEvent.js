export const meta = {
  name: "handleEvent",
  author: "Liane Cagara",
  description: "Self explanatory.",
  version: "1.0.1",
  supported: "^1.0.0",
  type: "plugin",
  order: 900,
  after: ["replySystem", "reactSystem"],
};

/**
 *
 * @param {CommandContext} obj
 */
export async function use(obj) {
  try {
    let done = [];
    const { commands } = obj;
    // console.log("Starting to process commands:", commands);
    for (const key in commands) {
      try {
        const command = commands[key];
        // console.log("Processing command:", command.meta.name);
        if (done.includes(command.meta.name)) {
          // console.log("Command already processed:", command.meta.name);
          continue;
        }
        done.push(command.meta.name);
        if (typeof command.event !== "function") {
          // console.log("Command event is not a function:", command.meta.name);
          continue;
        }
        const { meta } = command;
        if (
          meta.eventType &&
          Array.isArray(meta.eventType) &&
          !meta.eventType.includes(obj.event.type)
        ) {
          // console.log("Event type not supported (array):", obj.event.type);
          continue;
        }
        if (
          meta.eventType &&
          typeof meta.eventType === "string" &&
          meta.eventType !== obj.event.type
        ) {
          // console.log("Event type not supported (string):", obj.event.type);
          continue;
        }

        console.log("Executing command event:", command.meta.name);
        await command.event(obj);
      } catch (error) {
        console.log("Error processing command:", error);
        obj.output.error(error);
      }
    }
  } catch (error) {
    console.log("Error in use function:", error);
  } finally {
    console.log("Finished processing commands.");
    obj.next();
  }
}
