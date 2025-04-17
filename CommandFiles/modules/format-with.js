/**
 * Formats the string by replacing numbered placeholders (%1, %2, etc.) with corresponding values.
 * Placeholders are 1-based and must exactly match the position of the replacer.
 * Unmatched placeholders remain unchanged. Replacers can be strings or functions.
 * @param {string} str - Target string
 * @param {...(string|((position: number) => any))} replacers - The values or functions to replace placeholders with (%1 uses first replacer, %2 uses second, etc.)
 * @returns {string} The formatted string with placeholders replaced where applicable
 * @example
 * "Hello %1, welcome to %2!".formatWith("John", "Earth") // Returns "Hello John, welcome to Earth!"
 * "test%1 and %2test".formatWith(n => n * 2, "b") // Returns "test2 and btest"
 * "Test %123 %12 %1".formatWith("a", "b", "c") // Returns "Test %123 %12 a"
 */
module.exports = function format(str, ...replacers) {
  let result = str;
  for (let i = replacers.length; i >= 1; i--) {
    const placeholder = `%${i}`;
    const replacer = replacers[i - 1];
    if (replacer !== undefined) {
      let replacement;
      if (typeof replacer === "function") {
        replacement = String(replacer(i));
      } else {
        replacement = String(replacer);
      }
      result = result.replaceAll(placeholder, replacement);
    }
  }
  return result;
};
