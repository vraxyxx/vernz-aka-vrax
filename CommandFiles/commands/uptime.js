// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "uptime",
  description: "Check Uptime Status.",
  otherNames: ["upt", "up"],
  version: "1.0.0",
  author: "Liane Cagara",
  usage: "{prefix}{name}",
  category: "System",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 5,
  requirement: "3.0.0",
  icon: "🌏",
};
import os from "os";

export const style = {
  title: "Uptime 🌏",
  titleFont: "bold",
  contentFont: "fancy",
};

const { formatTimeDiff, formatBits } = global.utils;

/**
 *
 * @param {CommandContext} param0
 */
export async function entry({ output }) {
  /**
   * @param {number} value
   * @param {string} unit
   */
  function formatTimeUnit(value, unit) {
    return value ? `${value} ${unit}${value > 1 ? "s" : ""}, ` : "";
  }

  const { uptime } = global.Cassidy;
  const { years, months, days, hours, minutes, seconds } =
    formatTimeDiff(uptime);

  const uptimeString = `The bot is running for ${formatTimeUnit(
    years,
    "year"
  )}${formatTimeUnit(months, "month")}${formatTimeUnit(
    days,
    "day"
  )}${formatTimeUnit(hours, "hour")}${formatTimeUnit(
    minutes,
    "minute"
  )}and ${seconds} second${seconds > 1 ? "s" : ""}.`;
  const osInfo = {
    platform: os.platform(), // this is the operating system platform (e.g., "win32", "linux", "darwin")
    type: os.type(), // the operating system name (e.g., "Windows_NT", "Linux", "Darwin")
    release: os.release(), // operating system release version (e.g., "10.0.19041", "4.19.0-16-amd64")
    uptime: os.uptime(), // The system uptime in seconds, is this different than process.uptime!?
    hostname: os.hostname(), // obviously, the hostname of the operating system
    arch: os.arch(), // The CPU architecture (e.g., "x64", "arm", "ia32") as defined by gogol
    totalMemory: formatBits(os.totalmem()), // Total system memory in bytes
    freeMemory: formatBits(os.freemem()), // Free system memory in bytes
    cpus: os.cpus().length, // Number of CPU cores..
    usedMemory: formatBits(os.totalmem() - os.freemem()), // I realized I need this too.
  };
  // os.uptime is a better choice than process.uptime if your bost restarts mostly lmao
  const resultText = `**Platform**: ${osInfo.platform}
**Type**: ${osInfo.type}
**Release**: ${osInfo.release}
**Hostname**: ${osInfo.hostname}
**Architecture**: ${osInfo.arch}
**Memory**: ${osInfo.usedMemory}/${osInfo.totalMemory} (Free: ${osInfo.freeMemory})
**CPU Cores**: ${osInfo.cpus}
**Uptime**: ${uptimeString}`;
  output.reply(resultText);
}
