import React, { FunctionComponent } from "react";
import ITransaction from "../models/ITransaction";
import { format } from "date-fns";
import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  IconButton,
  Icon
} from "@material-ui/core";

interface TransactionListProps {
  transactions: ITransaction[];
}

export const TransactionList: FunctionComponent<TransactionListProps> = ({
  transactions
}) => {
  const rows = transactions.map(t => (
    <TableRow key={t.id}>
      <TableCell>{format(t.purchasedOn, "MM/DD/YYYY")}</TableCell>
      <TableCell>{t.name}</TableCell>
      <TableCell>{t.description}</TableCell>
      <TableCell>${t.cost.toFixed(2)}</TableCell>
      <TableCell>{t.tag.label}</TableCell>
      <TableCell>
        <IconButton>
          <Icon>trash</Icon>
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Purchased On</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Cost</TableCell>
          <TableCell>Tag</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length > 0 ? (
          rows
        ) : (
          <TableRow>
            <TableCell>
              {" "}
              Looks like there's nothing here{" "}
              <span role="img" aria-label="thinking emoji">
                🤔
              </span>{" "}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
