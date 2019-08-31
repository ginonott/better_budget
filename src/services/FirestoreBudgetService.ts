import { ITransactionQueryOptions } from "./IBudgetService";
import firebase from "firebase";
import "firebase/firestore";
import ITransaction from "../models/Transaction";
import LocalStorageBudgetService from "./LocalStorageBudgetService";
import { ITag } from "../models/Tag";

interface ITransactionCache {
  [queryOptionsHash: string]: {
    lastUpdated: Date;
  };
}

export class FirestoreBudgetService extends LocalStorageBudgetService {
  private db: firebase.firestore.Firestore;

  constructor() {
    super("fbCache");

    firebase.initializeApp({
      apiKey: "AIzaSyCjc9HQrmJs2JSLfK1YhrwofwRQMc8bBNY",
      authDomain: "betterbudget-244ff.firebaseapp.com",
      projectId: "betterbudget-244ff"
    });

    this.db = firebase.firestore();
  }

  private async dataToTransaction(
    snapshot: any,
    tags: ITag[]
  ): Promise<ITransaction> {
    const fbTransactions = snapshot.data();

    // try to convert to new tags
    let tag: ITag;

    let transaction = {
      id: snapshot.id,
      cost: fbTransactions.cost,
      purchasedOn:
        (fbTransactions.purchasedOn && fbTransactions.purchasedOn.toDate()) ||
        fbTransactions.date.toDate(),
      description: fbTransactions.description,
      name: fbTransactions.name
    };

    if (fbTransactions.tag) {
      tag = fbTransactions.tag;
    } else {
      // MIGRATION CODE
      // try to find a matching tag in the "tags" property
      const oldTag =
        (fbTransactions.tags && (fbTransactions.tags[0] as string)) || "";

      const matchingTag = tags.filter(
        t => t.label.toLowerCase() === oldTag.toLowerCase()
      )[0];

      tag = matchingTag || tags.find(t => t.id === "0");
    }

    return {
      ...transaction,
      tag
    };
  }

  async getTransaction(id: ITransaction["id"]) {
    const snapshot = await this.db
      .collection("transactions")
      .doc(`${id}`)
      .get();

    if (!snapshot.exists) {
      throw new Error("No transaction with ID " + id);
    }

    const tags = await this.getTags();

    return this.dataToTransaction(snapshot, tags);
  }

  async getTransactions(queryOptions: ITransactionQueryOptions) {
    let collection = this.db.collection("transactions");
    let query = collection.orderBy("purchasedOn", "desc");

    if (queryOptions.from) {
      query = collection.where("purchasedOn", ">=", queryOptions.from);
    }

    if (queryOptions.to) {
      query = query.where("purchasedOn", "<=", queryOptions.to);
    }

    const snapshots = await query.get();

    const tags = await this.getTags();

    const transactions: ITransaction[] = [];
    snapshots.forEach(async snapshot => {
      transactions.push(await this.dataToTransaction(snapshot, tags));
    });

    return transactions;
  }

  async addTransaction(transaction: ITransaction) {
    delete transaction.id;

    await this.db
      .collection("transactions")
      .doc()
      .set({
        ...transaction,
        date: transaction.purchasedOn
      });

    this.notify();
  }

  async editTransaction(transaction: ITransaction) {
    if (!transaction.id || !transaction.name) {
      console.error("invalid transaction", transaction);
      return;
    }

    const t: ITransaction = {
      cost: transaction.cost || 0,
      description: transaction.description || "",
      id: transaction.id,
      name: transaction.name,
      purchasedOn: transaction.purchasedOn,
      tag: transaction.tag
    };

    await this.db
      .collection("transactions")
      .doc(`${transaction.id}`)
      .set({
        ...t
      });

    this.notify();
  }

  async deleteTransaction(transactionId: ITransaction["id"]) {
    await this.db
      .collection("transactions")
      .doc(`${transactionId}`)
      .delete();

    this.notify();
  }

  async getTags() {
    return this.db
      .collection("tags")
      .get()
      .then(querySnapshot => {
        const tags: ITag[] = [];
        querySnapshot.forEach(doc => {
          tags.push({
            id: doc.id,
            label: doc.data().label
          });
        });

        return tags;
      });
  }

  async setTag(tag: ITag) {
    return this.db
      .collection("tags")
      .doc(tag.id)
      .set(tag);
  }

  async getGoals() {
    return [];
  }

  async addGoal() {}

  async editGoal() {}

  async getIncome() {
    const budget = await this.db
      .collection("budgets")
      .doc("default")
      .get();

    return budget.data()!.income;
  }

  async setIncome() {}

  subscribe(cb: () => void) {
    this.subscribers = [...this.subscribers, cb];
  }

  unsubscribe(cb: () => void) {
    this.subscribers = this.subscribers.filter(s => s !== cb);
  }
}
