import { useBudgetService } from "../components/BudgetServiceProvider";
import { ITransactionQueryOptions } from "../services/IBudgetService";
import ITransaction from "../models/Transaction";
import { useState, useCallback, useEffect } from "react";
import { useSubscribe } from "./useSubscribe";

export function useTransactions(queryOptions: ITransactionQueryOptions) {
  const budgetService = useBudgetService();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const ts = useSubscribe(
    budgetService.subscribe.bind(budgetService),
    budgetService.unsubscribe.bind(budgetService)
  );

  const getTransactions = useCallback(() => {
    budgetService.getTransactions(queryOptions).then(setTransactions);
  }, [queryOptions, ts]);

  useEffect(() => {
    getTransactions();
  }, [ts]);

  return transactions;
}
