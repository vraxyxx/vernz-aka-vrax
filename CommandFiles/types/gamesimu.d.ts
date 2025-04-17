interface Item {
  name: string;
  icon: string;
  chance: number;
  delay: number;
  priceA: number;
  priceB: number;
}

interface GameSimulatorProps {
  key: string;
  verb?: string;
  verbing?: string;
  pastTense?: string;
  checkIcon?: string;
  initialStorage?: number;
  itemData?: Item[];
  actionEmoji?: string;
  stoData?: { price: number };
}

declare class GameSimulator {
  static instances: Record<string, GameSimulator> = {};
  key: string;
  verb: string;
  verbing: string;
  pastTense: string;
  checkIcon: string;
  actionEmoji: string;
  storage: number;
  stoData?: { price: number };
  itemData: Item[];

  constructor({
    key,
    verb = key.charAt(0).toUpperCase() + key.slice(1),
    verbing = verb + "ing",
    pastTense = verb + "ed",
    checkIcon = "✓",
    initialStorage = 30,
    itemData = [],
    actionEmoji = "🔖",
    stoData,
  }: GameSimulatorProps);

  async simulateAction(context: CommandContext): Promise<void>;
}

export { GameSimulator, Item, GameSimulatorProps };
