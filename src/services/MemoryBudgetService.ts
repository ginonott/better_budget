import IBudgetService, { ITransactionQueryOptions } from "./IBudgetService";
import ITransaction from "../models/Transaction";
import { ITag } from "../models/Tag";
import { isBefore, isAfter } from "date-fns";
import { IGoal } from "../models/Goal";

function getId() {
  return `${Date.now()}-${Math.floor(Math.random() * 4)}`;
}

export default class MemoryBudgetService implements IBudgetService {
  public transactions: ITransaction[] = [];

  public tags: ITag[] = [
    {
      id: "0",
      label: "Groceries"
    },
    {
      id: "1",
      label: "Bills"
    }
  ];

  public goals: IGoal[] = [];

  public income = 0;

  subscribers: Array<() => void> = [];

  notify() {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  }

  async addTransaction(transaction: Exclude<ITransaction, ITransaction["id"]>) {
    this.transactions.push({
      ...transaction,
      id: getId()
    });
    this.notify();
  }

  async deleteTransaction(transactionId: ITransaction["id"]) {
    this.transactions = this.transactions.filter(t => t.id !== transactionId);
    this.notify();
  }

  async editTransaction(transaction: ITransaction) {
    this.transactions = this.transactions.map(t =>
      t.id === transaction.id
        ? {
            ...t,
            ...transaction
          }
        : t
    );
    this.notify();
  }

  async getTransactions(queryOptions: ITransactionQueryOptions) {
    return this.transactions
      .filter(
        t => queryOptions.from && isBefore(queryOptions.from, t.purchasedOn)
      )
      .filter(t => queryOptions.to && isAfter(queryOptions.to, t.purchasedOn));
  }

  async getTransaction(id: ITransaction["id"]) {
    return this.transactions.find(t => t.id === id);
  }

  async getTags() {
    return this.tags;
  }

  async getGoals() {
    return this.goals;
  }

  async addGoal(goal: IGoal) {
    this.goals = [
      ...this.goals,
      {
        ...goal,
        id: getId()
      }
    ];
  }

  async editGoal(goal: IGoal) {
    this.goals = this.goals.map(g =>
      g.id === goal.id
        ? {
            ...g,
            ...goal
          }
        : g
    );
  }

  async getIncome() {
    return this.income;
  }

  async setIncome(income: number) {
    this.income = income;
  }

  subscribe(cb: () => void) {
    this.subscribers.push(cb);
  }

  unsubscribe(cb: () => void) {
    this.subscribers = this.subscribers.filter(subscriber => subscriber !== cb);
  }
}
