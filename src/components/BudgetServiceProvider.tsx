import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import IBudgetService, {
  ITransactionQueryOptions
} from "../services/IBudgetService";
import ITransaction from "../models/Transaction";
import { ITag } from "../models/Tag";

interface IBudgetServiceProviderProps {
  budgetService: IBudgetService;
}

export const BudgetServiceContext = createContext<IBudgetService>(
  (null as unknown) as IBudgetService
);

export const BudgetServiceProvider: FunctionComponent<
  IBudgetServiceProviderProps
> = ({ budgetService, children }) => {
  return (
    <BudgetServiceContext.Provider value={budgetService}>
      {children}
    </BudgetServiceContext.Provider>
  );
};

interface IBudgetServiceSubscriberProps {
  queryOptions?: ITransactionQueryOptions;
  children: (budget: {
    transactions: ITransaction[];
    tags: ITag[];
    income: number;
  }) => ReactNode;
}

export const BudgetServiceSubscriber: FunctionComponent<
  IBudgetServiceSubscriberProps
> = ({ children, queryOptions = null }) => {
  const [_timestamp, update] = useState(Date.now());
  const [{ transactions, tags, income }, setBudgetState] = useState<{
    transactions: ITransaction[];
    tags: ITag[];
    income: number;
  }>({
    transactions: [],
    tags: [],
    income: 0
  });

  const budgetService = useContext(BudgetServiceContext);

  const subscribe = () => {
    update(Date.now());
  };

  useEffect(() => {
    budgetService.subscribe(subscribe);

    return () => {
      budgetService.unsubscribe(subscribe);
    };
  });

  useEffect(() => {
    Promise.all([
      budgetService.getTransactions(queryOptions || {}),
      budgetService.getTags(),
      budgetService.getIncome()
    ]).then(([transactions, tags, income]) => {
      setBudgetState({ transactions, tags, income });
    });
  }, [_timestamp, queryOptions, budgetService]);

  return <>{children({ transactions, tags, income })}</>;
};

export const useBudgetService = () => useContext(BudgetServiceContext);
