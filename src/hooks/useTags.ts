import { useState, useEffect } from "react";
import { ITag } from "../models/Tag";
import { useBudgetService } from "../components/BudgetServiceProvider";
import { useSubscribe } from "./useSubscribe";

export const useTags = () => {
  const [tags, setTags] = useState<ITag[]>([]);
  const budgetService = useBudgetService();
  const ts = useSubscribe(
    budgetService.subscribe.bind(budgetService),
    budgetService.unsubscribe.bind(budgetService)
  );

  useEffect(() => {
    console.log("here????");
    budgetService.getTags().then(tags => {
      setTags(tags);
    });
  }, [ts, budgetService, tags]);

  return tags;
};
