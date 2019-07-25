import IBudgetService, { ITransactionQueryOptions } from "./IBudgetService";
import ITransaction from "../models/ITransaction";
import { ITag } from "../models/ITag";
import { isBefore, isAfter } from "date-fns";

export default class MemoryBudgetService implements IBudgetService {
  public transactions: ITransaction[] = [];
  public tags: ITag[] = [
    {
      id: 0,
      label: "Groceries"
    },
    {
      id: 1,
      label: "Bills"
    }
  ];

  subscribers: Array<() => void> = [];

  notify() {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  }

  async addTransaction(transaction: Exclude<ITransaction, ITransaction["id"]>) {
    this.transactions.push({
      ...transaction,
      id: Number.parseInt(`${Date.now()}${Math.floor(Math.random() * 4)}`)
    });
    this.notify();
  }

  async deleteTransaction(transactionId: ITransaction["id"]) {
    this.transactions = this.transactions.filter(t => t.id !== transactionId);
  }

  async editTransaction(
    transaction: Partial<ITransaction> & ITransaction["id"]
  ) {
    this.transactions = this.transactions.map(t =>
      t.id === transaction.id
        ? {
            ...t,
            transaction
          }
        : t
    );
  }

  async getTransactions(queryOptions: ITransactionQueryOptions) {
    return this.transactions
      .filter(
        t => queryOptions.from && isBefore(queryOptions.from, t.purchasedOn)
      )
      .filter(t => queryOptions.to && isAfter(queryOptions.to, t.purchasedOn));
  }

  async getTags() {
    return this.tags;
  }

  subscribe(cb: () => void) {
    this.subscribers.push(cb);
  }

  unsubscribe(cb: () => void) {
    this.subscribers = this.subscribers.filter(subscriber => subscriber !== cb);
  }
}
