import MemoryBudgetService from "./MemoryBudgetService";
import ITransaction from "../models/Transaction";
import { ITag } from "../models/Tag";

interface ISavedBudgetState {
  transactions: ITransaction[];
  tags: ITag[];
}

export default class LocalStorageBudgetService extends MemoryBudgetService {
  private KEY = "budgetAppV3.1";

  constructor(key?: string) {
    super();

    if (key) {
      this.KEY = key;
    }

    this.hydrate();
  }

  private hydrate() {
    const possibleJson = localStorage.getItem(this.KEY);

    if (possibleJson) {
      const savedState = JSON.parse(possibleJson) as ISavedBudgetState;

      this.transactions = savedState.transactions.map(t => ({
        ...t,
        purchasedOn: new Date(t.purchasedOn)
      }));
      this.tags = savedState.tags;
    }
  }

  private persist() {
    const savedState: ISavedBudgetState = {
      transactions: this.transactions,
      tags: this.tags
    };

    localStorage.setItem(this.KEY, JSON.stringify(savedState));
  }

  notify() {
    super.notify();

    this.persist();
  }
}
