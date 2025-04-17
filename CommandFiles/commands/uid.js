// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "gameid",
  description: "Check game senderID",
  author: "Liane",
  version: "1.0.1",
  usage: "{prefix}{name}",
  category: "Utilities",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["uid"],
  icon: "🎮",
  noLevelUI: true,
};

import { defineEntry } from "@cass/define";

export const entry = defineEntry(async ({ input, output }) => {
  return output.attach(
    `${input.detectID ?? input.senderID}`,
    "https://st3.depositphotos.com/4570119/35986/i/450/depositphotos_359861810-stock-photo-guangzhou-city-square-road-architectural.jpg"
  );
});
