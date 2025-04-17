// const pageObject = {
//   object: "page",
//   entry: [
//     {
//       time: ,
//       id: "",
//       messaging: [
//         {
//           sender: { id: "" },
//           recipient: { id: "" },
//           timestamp: 1741508398163,
//           message: {
//             mid: "m_Tg9sZpJJW81uLfqDuEoWF5Q8lp_O9nzvFABhZGXb2gWfkSbAf6mMX1XOWYH9bU4bLMqPvAYPhLU8D-0XQokvqw",
//             text: "+",
//           },
//         },
//       ],
//     },
//   ],
// };
// {
//   "object": "page",
//   "entry": [
//     {
//       "time": 1741510345762,
//       "id": "516746941531643",
//       "messaging": [
//         {
//           "sender": {
//             "id": "29089347883997073"
//           },
//           "recipient": {
//             "id": "516746941531643"
//           },
//           "timestamp": 1741510337765,
//           "message": {
//             "mid": "m_ldDGcj2W5w5Mct2FRtOZ9FAFXFMEf7sh9Xp86Eu1Y6D7u7FNsU4_nd722UMJzQ8JDA2TFNqppL9tSW1F9l_g2w",
//             "text": "+"
//           }
//         }
//       ]
//     }
//   ]
// }

/**
 * @typedef {Object} IncomingEvent
 * @property {string} object - The object type (e.g., "page")
 * @property {Entry[]} entry - Array of entry objects
 */

/**
 * @typedef {Object} Entry
 * @property {number} time - Timestamp of the entry
 * @property {string} id - Identifier for the page
 * @property {Messaging[]} messaging - Array of messaging objects
 */

/**
 * @typedef {Object} Messaging
 * @property {Sender} sender - Sender information
 * @property {Recipient} recipient - Recipient information
 * @property {number} timestamp - Timestamp of the message
 * @property {Message} message - Message details
 */

/**
 * @typedef {Object} Sender
 * @property {string} id - Sender's unique identifier
 */

/**
 * @typedef {Object} Recipient
 * @property {string} id - Recipient's unique identifier
 */

/**
 * @typedef {Object} Message
 * @property {string} mid - Message identifier
 * @property {string} text - Message content
 * @property {ReplyTo} [reply_to] - Optional reply-to message information
 */

/**
 * @typedef {Object} ReplyTo
 * @property {string} mid - Message ID being replied to
 */

/**
 *
 * @param {Entry} indivEntry
 * @returns
 */
export function convertEvent(indivEntry) {
  const pageEvent = indivEntry;
  const messaging = pageEvent?.messaging || [];

  const message = messaging[0];
  const reaction = message?.reaction || null;

  const event = {
    pageObject: indivEntry,
    type: reaction
      ? "message_reaction"
      : message.message.reply_to
      ? "message_reply"
      : "message",
    senderID: reaction ? message.recipient?.id || "" : message.sender?.id || "",
    timestamp: pageEvent.time || pageEvent.timestamp || null,
    body: reaction ? "" : message.message.text || "",
    userID: reaction ? message.sender?.id || null : null,
    messageID: reaction ? reaction.mid || "" : message.message.mid || "",
    isPage: true,
    ...(message.message.reply_to
      ? {
          messageReply: {
            messageID: message.message.reply_to.mid || "",
            body: "",
          },
        }
      : {}),
    isWeb: false,
    fromWebhook: true,
    reaction: reaction?.action === "react" ? reaction.emoji || "" : "",
  };
  event.threadID = event.senderID;

  return event;
}
// this thing is also made by Liane Cagara for the sake of consistent structure
