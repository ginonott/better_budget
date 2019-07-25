import ITransaction from "../models/ITransaction";
import { ITag } from "../models/ITag";

export interface ITransactionQueryOptions {
  from?: Date;
  to?: Date;
}

export default interface IBudgetService {
  getTransactions: (
    queryOptions: ITransactionQueryOptions
  ) => Promise<ITransaction[]>;
  addTransaction: (
    transaction: Exclude<ITransaction, ITransaction["id"]>
  ) => Promise<void>;
  editTransaction: (
    transaction: Partial<ITransaction> & ITransaction["id"]
  ) => Promise<void>;
  deleteTransaction: (transactionId: ITransaction["id"]) => Promise<void>;
  getTags: () => Promise<ITag[]>;

  subscribe: (cb: () => void) => void;
  unsubscribe: (cb: () => void) => void;
}
