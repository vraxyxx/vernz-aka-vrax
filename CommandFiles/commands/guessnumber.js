// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "numberguess",
  otherNames: ["guessnumber", "numguess", "guessnum"],
  description: "Guess the randomly generated number!",
  author: "Liane",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "Puzzle Games",
  permissions: [0],
  cooldown: 10,
  noPrefix: false,
  requirement: "3.0.0",
  icon: "📝",
};
const prize = 70;
export const style = {
  title: "Number Guessing Game 📝",
  titleFont: "bold",
  contentFont: "fancy",
};

const MAX_ATTEMPTS = 5;
const MIN_RANGE = 1;
const MAX_RANGE = 20;

/**
 *
 * @param {CommandContext} ctx
 */
export async function entry({ input, output, commandName }) {
  const gameState = {
    secretNumber:
      Math.floor(Math.random() * (MAX_RANGE - MIN_RANGE + 1)) + MIN_RANGE,
    attempts: 0,
    author: input.senderID,
    key: commandName,
  };

  const i = await output.reply(
    `I've picked a number between ${MIN_RANGE} and ${MAX_RANGE}. You have ${MAX_ATTEMPTS} attempts to guess it.

Reply with your answer.`
  );
  input.setReply(i.messageID, gameState);
}

/**
 *
 * @param {CommandContext & { repObj: { secretNumber: number; attempts: number; author: string; key: string; }; detectID: string }} ctx
 * @returns
 */
export async function reply({ input, output, repObj, detectID, money }) {
  const { body, senderID } = input;
  const gameState = repObj;

  if (senderID !== gameState.author) {
    await output.reply("You can't participate in someone else's game!");
    return;
  }
  input.delReply(detectID);
  if (gameState.attempts >= MAX_ATTEMPTS) {
    await output.reply(
      `Sorry, you've used all ${MAX_ATTEMPTS} attempts. The correct number was ${gameState.secretNumber}.`
    );
    return;
  }

  const guess = parseInt(body);

  if (isNaN(guess)) {
    const i = await output.reply("Please enter a valid number.");
    input.setReply(i.messageID, gameState);
    return;
  }

  gameState.attempts++;

  if (guess === gameState.secretNumber) {
    const { money: cash } = await money.get(gameState.author);
    await money.set(gameState.author, { money: cash + prize });
    await output.reply(
      `Congratulations! You guessed the number ${gameState.secretNumber} in ${gameState.attempts} attempts!

You 𝘄𝗼𝗻!
Earned 0 𝗘𝗫𝗣 and ${prize} 𝗚𝗢𝗟𝗗`
    );
    return;
  }

  if (guess < gameState.secretNumber) {
    const i =
      await output.reply(`Too low! Try guessing a higher number than ${guess}.
Attempts: ${gameState.attempts}/${MAX_ATTEMPTS}

Reply again.`);
    input.setReply(i.messageID, gameState);
  } else if (guess > gameState.secretNumber) {
    const i =
      await output.reply(`Too high! Try guessing a lower number than ${guess}.
Attempts: ${gameState.attempts}/${MAX_ATTEMPTS}

Reply again.`);
    input.setReply(i.messageID, gameState);
  }
}
