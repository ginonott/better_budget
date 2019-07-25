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
import ITransaction from "../models/ITransaction";
import { ITag } from "../models/ITag";

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
  }) => ReactNode;
}

export const BudgetServiceSubscriber: FunctionComponent<
  IBudgetServiceSubscriberProps
> = ({ children, queryOptions = null }) => {
  const [_timestamp, update] = useState(Date.now());
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [tags, setTags] = useState<ITag[]>([]);

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
      budgetService.getTags()
    ]).then(([transactions, tags]) => {
      setTransactions(transactions);
      setTags(tags);
    });
  }, [_timestamp, queryOptions]);

  return <>{children({ transactions, tags })}</>;
};

export const useBudgetService = () => useContext(BudgetServiceContext);
