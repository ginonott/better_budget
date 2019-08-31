import { useState, useEffect, useCallback } from "react";
import { ITag } from "../models/Tag";
import { useBudgetService } from "../components/BudgetServiceProvider";

export const useTags = () => {
  const [tags, setTags] = useState<ITag[]>([]);
  const budgetService = useBudgetService();

  const getTags = useCallback(() => {
    budgetService.getTags().then(tags => {
      setTags(tags);
    });
  }, []);

  useEffect(() => {
    getTags();
  }, []);

  return tags;
};
