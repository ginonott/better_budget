import { ITag } from "./Tag";

export default interface ITransaction {
  id: string;
  name: string;
  cost: number;
  purchasedOn: Date;
  description: string;
  tag: ITag;
}
