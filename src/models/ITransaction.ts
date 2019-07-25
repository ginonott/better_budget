import { ITag } from "./ITag";

export default interface ITransaction {
  id: number;
  name: string;
  cost: number;
  purchasedOn: Date;
  description: string;
  tag: ITag;
}
