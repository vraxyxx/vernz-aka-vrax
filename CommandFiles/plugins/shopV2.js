export const meta = {
  name: "shop-rework",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "This operates as easier way of managing shops!",
  supported: "^1.0.0",
  order: 2,
  type: "plugin",
  expect: ["ShopClass"],
};

export class ShopClass {
  constructor(shopInv = {}) {
    this.shopInv = shopInv;
  }

  loadInv(userID) {
    return this.shopInv;
  }

  saveInv(inv, userID) {
    this.shopInv = inv;
  }

  lock(commandName, userID) {
    commandName = String(commandName).toLowerCase();
    if (commandName in this.shopInv) {
      delete this.shopInv[commandName];
    }
  }

  unlock(commandName, userID) {
    commandName = String(commandName).toLowerCase();
    this.getPrice(commandName) !== 0
      ? (this.shopInv[commandName] = true)
      : null;
  }

  isUnlocked(commandName) {
    commandName = String(commandName).toLowerCase();
    return commandName in this.shopInv || this.getPrice(commandName) === 0;
  }

  getPrice(commandName) {
    commandName = String(commandName).toLowerCase();
    const { meta = {} } =
      Object.values(global.Cassidy.commands).find(
        (i) =>
          i.meta.name === commandName ||
          String(i.meta.name).toLowerCase() ===
            String(commandName).toLowerCase()
      ) ?? {};
    return meta.shopPrice || 0;
  }

  canPurchase(commandName, money) {
    commandName = String(commandName).toLowerCase();
    const price = this.getPrice(commandName);
    return price !== 0 && money >= price;
  }

  purchase(commandName, money) {
    commandName = String(commandName).toLowerCase();
    const price = this.getPrice(commandName);
    if (price === 0 || money < price) return { success: false, cost: price };
    this.shopInv[commandName] = true;
    money -= price;
    return { success: true, cost: price, remainingMoney: money };
  }

  getItems() {
    const result = Object.entries(global.Cassidy.commands)
      .filter(([_, { meta }]) => meta?.shopPrice)
      .reduce((acc, [key, { meta }]) => {
        acc[meta.name] = { meta, key };
        return acc;
      }, {});

    const sortedKeys = Object.keys(result)
      .filter((i) => result[i].meta.shopPrice)
      .sort((a, b) => {
        return result[a].meta.shopPrice - result[b].meta.shopPrice;
      });
    const finalResult = {};
    for (const key of sortedKeys) {
      finalResult[key] = global.Cassidy.commands[result[key].key];
    }

    finalResult[Symbol.iterator] = function* () {
      yield* Object.values(finalResult);
    };
    return finalResult;
  }

  raw() {
    return { ...this.shopInv };
  }

  async inventory(userID) {
    return Object.keys(this.shopInv);
  }
}

export async function use(obj) {
  obj.ShopClass = ShopClass;

  obj.next();
}
