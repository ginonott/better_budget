import { useState, useEffect, useCallback } from "react";
import { useBudgetService } from "../components/BudgetServiceProvider";

export const useIncome = () => {
  const [income, setIncome] = useState<number>(0);
  const budgetService = useBudgetService();

  const getIncome = useCallback(() => {
    budgetService.getIncome().then(income => {
      setIncome(income);
    });
  }, []);

  useEffect(() => {
    getIncome();
  }, []);

  return income;
};
