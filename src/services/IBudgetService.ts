import ITransaction from "../models/Transaction";
import { ITag } from "../models/Tag";
import { IGoal } from "../models/Goal";

export interface ITransactionQueryOptions {
  from?: Date;
  to?: Date;
}

export default interface IBudgetService {
  // Transaction Related Capabilities
  getTransaction: (id: ITransaction["id"]) => Promise<ITransaction | undefined>;
  getTransactions: (
    queryOptions: ITransactionQueryOptions
  ) => Promise<ITransaction[]>;
  addTransaction: (
    transaction: Exclude<ITransaction, ITransaction["id"]>
  ) => Promise<void>;
  editTransaction: (transaction: ITransaction) => Promise<void>;
  deleteTransaction: (transactionId: ITransaction["id"]) => Promise<void>;

  // Tags
  getTags: () => Promise<ITag[]>;

  // Goals
  getGoals: () => Promise<IGoal[]>;
  addGoal: (goal: IGoal) => Promise<void>;
  editGoal: (goal: IGoal) => Promise<void>;

  // Budget
  getIncome: () => Promise<number>;
  setIncome: (income: number) => Promise<void>;

  subscribe: (cb: () => void) => void;
  unsubscribe: (cb: () => void) => void;
}
