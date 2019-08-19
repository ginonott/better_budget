export interface IGoal {
  id: string;
  name: string;
  amountToSave: number;
  amountSpent: number;
  goalDate: Date;
  isComplete: boolean;
}
