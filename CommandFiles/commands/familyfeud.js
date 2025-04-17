// @ts-check
import fs from "fs";
import stringSimilarity from "string-similarity";
import { translate } from "@vitalets/google-translate-api";
import { clamp, UNIRedux } from "@cassidy/unispectra";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "familyfeud",
  author: "Liane Cagara",
  version: "1.0.0",
  waitingTime: 5,
  description: "Family Feud style game!",
  category: "Puzzle Games",
  usage: "{prefix}{name}",
  otherNames: ["ff", "feud"],
  requirement: "3.0.0",
  icon: "🔎",
};

const logo = `🔎 [ **FAMILY FEUD** ] 🔍\n${UNIRedux.standardLine}\n`;

function getRandomQuestion() {
  const data = JSON.parse(
    fs.readFileSync(__dirname + "/json/familyfeud.json", "utf8")
  );
  const index = Math.floor(Math.random() * data.length);
  return data[index];
}

function generateTable(answers) {
  let table = "\n🔍 **Family Feud Answers** 🔍\n\n";
  const total = answers
    .filter((answer) => answer.guessed)
    .reduce((total, answer) => total + answer.points, 0);
  table += `***Total*** [ **${total}** ]\n\n`;
  table += "Answers:\n";
  answers.forEach((answer) => {
    if (answer.guessed) {
      table += `✅ ${answer.answer} - ${answer.points} points\n`;
    } else {
      table += `❓ ${answer.answer.length} letters\n`;
    }
  });

  return table;
}
/**
 *
 * @param {CommandContext & { repObj: Record<string, any>}} ctx
 */
export async function reply({
  input,
  output,

  repObj: receive,
  money: moneyH,
  detectID,
  Collectibles,
  CassEXP,
}) {
  try {
    const logo = "🔎 [ **FAMILY FEUD** ] 🔍\n";
    output.prepend = logo;

    if (typeof receive !== "object" || !receive) return;
    receive.mid = detectID;
    if (input.senderID !== receive.author) {
      return output.reply(`❌ This is not your game!`);
    }

    let userAnswer = input.words.join(" ").trim().toLowerCase();

    let userData = await moneyH.get(input.senderID);

    const cassEXP = new CassEXP(userData.cassEXP);
    let lastFeudGame = userData.lastFeudGame;
    let money = userData.money || 0;
    let name = userData.name;
    let strikes = userData.strikes || 0;

    let { question, answers } = lastFeudGame;
    const collectibles = new Collectibles(userData.collectibles ?? []);

    answers = answers.map((i, j) => {
      i.index = j;
      return i;
    });

    const matches = answers.map((answer, index) => ({
      ...answer,
      similarity: stringSimilarity.compareTwoStrings(
        answer.answer.toLowerCase(),
        userAnswer
      ),
      index: index,
    }));
    matches.sort((a, b) => b.similarity - a.similarity);

    let correctAnswer = matches[0].similarity > 0.7 ? matches[0] : null;

    if (!correctAnswer) {
      try {
        const translated = await translate(userAnswer, { to: "en" });
        userAnswer = translated.text.toLowerCase();

        correctAnswer = answers.find(
          (answer) =>
            stringSimilarity.compareTwoStrings(
              answer.answer.toLowerCase(),
              userAnswer
            ) > 0.7
        );
      } catch (error) {
        console.error("Translation error:", error);
      }
    }

    if (correctAnswer && !answers[correctAnswer.index]?.guessed) {
      money += correctAnswer.points;
      answers[correctAnswer.index].guessed = true;

      const allGuessed = answers.every((answer) => answer.guessed);

      if (allGuessed) {
        collectibles.raise("feudTickets", answers.length);
        cassEXP.expControls.raise(20);
        await moneyH.set(input.senderID, {
          ...userData,
          cassEXP: cassEXP.raw(),
          collectibles: Array.from(collectibles),
          lastFeudGame: null,
          strikes: 0,
          ffStamp: Date.now(),
        });
        input.delReply(String(detectID));
        const allPoints = answers.reduce(
          (total, answer) => total + answer.points,
          0
        );

        return output.reply(
          `🏆 | Well done ${
            name?.split(" ")[0]
          }! You've guessed all answers and earned **${allPoints} points** that's added to your balance!\nYou also won 20 EXP! And 🎫 **${
            answers.length
          }**.\n\n${generateTable(answers)}`
        );
      } else {
        const replyMessage = `✅ | Correct ${name?.split(" ")[0]}! "${
          correctAnswer.answer
        }" was worth **${
          correctAnswer.points
        } points** that was added to your balance!\n\nKeep guessing! (Reply more!)\n\nQuestion: ${question}\n\n${generateTable(
          answers
        )}`;
        const xp = clamp(1, correctAnswer.points / 20, 10);
        cassEXP.expControls.raise(xp);
        await moneyH.set(input.senderID, {
          ...userData,
          money,
          cassEXP: cassEXP.raw(),
          lastFeudGame: {
            ...lastFeudGame,
            answers,
          },
          strikes,
          ffStamp: Date.now(),
        });

        const newReply = await output.reply(replyMessage);
        input.delReply(String(detectID));

        input.setReply(newReply.messageID, {
          key: "familyfeud",
          author: input.senderID,
          mid: newReply.messageID,
        });
      }
    } else {
      strikes += 1;

      if (strikes >= 10) {
        await moneyH.set(input.senderID, {
          ...userData,
          money,
          lastFeudGame: null,
          strikes: 0,
          ffStamp: Date.now(),
        });
        input.delReply(String(detectID));

        return output.reply(
          `[ ${"❌ ".repeat(strikes).trim()} ]\n\nSorry ${
            name?.split(" ")[0]
          }, you've received ten strikes! Better luck next time.\n\nQuestion: ${question}\n\n${generateTable(
            answers
          )}`
        );
      } else {
        await moneyH.set(input.senderID, {
          ...userData,
          money,
          lastFeudGame: {
            ...lastFeudGame,
          },
          strikes,
          ffStamp: Date.now(),
        });
        const replyMessage = `[ ${"❌ "
          .repeat(strikes)
          .trim()} ]\n\nSorry, but the survey says "${userAnswer}" is not the correct answer. Please try again! (Reply more!)\n\nQuestion: ${question}\n\n${generateTable(
          answers
        )}`;

        const newReply = await output.reply(replyMessage);
        input.delReply(String(detectID));

        input.setReply(newReply.messageID, {
          key: "familyfeud",
          author: input.senderID,
          mid: newReply.messageID,
        });
      }
    }
  } catch (error) {
    output.error(error);
  }
}

/**
 *
 * @param {CommandContext} ctx
 */
export async function entry({
  input,
  output,
  prefix,
  money: moneyH,
  Inventory,
}) {
  output.prepend = logo;

  if (input.arguments[0] == "guide") {
    return output.reply(`𝗢𝘃𝗲𝗿𝘃𝗶𝗲𝘄
Test your knowledge and try to guess the most popular answers in our Family Feud game!

𝗛𝗼𝘄 𝘁𝗼 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝘁𝗲:
1. Type ${prefix}familyfeud to start the game.
2. Guess the most popular answers to the survey question.
3. Answer by typing your response.

𝗖𝗼𝗻𝗱𝗶𝘁𝗶𝗼𝗻𝘀:
- You can guess multiple times until you get it right or receive three strikes.
- Points are awarded based on the popularity of the answer.

𝗥𝗲𝘄𝗮𝗿𝗱𝘀:
- Correct answers earn you points.

𝗦𝗽𝗲𝗰𝗶𝗮𝗹 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀:
- If you guess wrong, you'll receive a fun response. Keep trying!
- Humorous responses add to the fun of the game.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲 𝗨𝘀𝗮𝗴𝗲:
- Input: ${prefix}familyfeud
- Question: Name something you bring to a picnic.

- Answer: food

𝗦𝗰𝗼𝗿𝗶𝗻𝗴:
- Each correct answer earns you points based on its popularity.
- Three strikes and the game ends.

𝗔𝗰𝗵𝗶𝗲𝘃𝗲𝗺𝗲𝗻𝘁𝘀:
- Track your Family Feud wins and points earned in your profile.

𝗘𝗻𝗷𝗼𝘆 𝘁𝗵𝗲 𝗙𝗮𝗺𝗶𝗹𝘆 𝗙𝗲𝘂𝗱 𝗚𝗮𝗺𝗲 𝗮𝗻𝗱 𝗛𝗮𝘃𝗲 𝗙𝘂𝗻! 👪🌟

---
`);
  }

  let {
    lastFeudGame,
    name,
    ffRunStamp,
    ffStamp = Date.now() - 10 * 60 * 1000,
    inventory: inv = [],
  } = await moneyH.get(input.senderID);
  const inventory = new Inventory(inv);
  let isPendantUsed = false;
  limitCheck: {
    if (ffRunStamp && Date.now() - ffRunStamp < 10 * 60 * 1000) {
      if (inventory.has("timePendant")) {
        isPendantUsed = true;
        inventory.deleteOne("timePendant");
        break limitCheck;
      }

      const txt = `❌ | The game is still running! Please finish the game or just wait 10 minutes.`;

      await output.reply(txt);
      return;
    }
    const elapsedTime = Date.now() - ffStamp;
    if (elapsedTime < 10 * 60 * 1000) {
      if (inventory.has("timePendant")) {
        isPendantUsed = true;
        inventory.deleteOne("timePendant");
        break limitCheck;
      }

      const txt = `🕜 | You can use this command again in ${Math.ceil(
        (10 * 60 * 1000 - elapsedTime) / 60 / 1000
      )} minutes.`;

      await output.reply(txt);
      return;
    }
  }
  await moneyH.setItem(input.senderID, {
    ffRunStamp: Date.now(),
    inventory: inventory.raw(),
  });
  if (!name) {
    return output.reply(
      `❌ | Please use the command ${prefix}identity-setname first.`
    );
  }
  if (!lastFeudGame || input.property["refresh"]) {
    lastFeudGame = getRandomQuestion();
    lastFeudGame.answers = lastFeudGame.answers.map((answer) => ({
      ...answer,
      guessed: false,
    }));
    lastFeudGame.timeStamp = Date.now();
    await moneyH.set(input.senderID, {
      lastFeudGame,
    });
  }

  const str = `👪 Question: **${
    lastFeudGame.question
  }**\n\nType your answer below (reply). You can type '${prefix}familyfeud guide' if you need help.\n${generateTable(
    lastFeudGame.answers
  )}`;

  const info = await output.reply(str);
  input.setReply(info.messageID, {
    key: "familyfeud",
    author: input.senderID,
    mid: info.messageID,
  });
}
