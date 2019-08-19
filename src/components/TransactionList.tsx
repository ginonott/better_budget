import {
  Icon,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";
import { format } from "date-fns";
import React, { FunctionComponent, useState } from "react";
import { Link } from "react-router-dom";
import ITransaction from "../models/Transaction";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    transactionList: {
      display: "flex",
      flexDirection: "column",

      [theme.breakpoints.up("md")]: {
        display: "table-row"
      }
    },
    edit: {
      transition: theme.transitions.create(
        ["color", "background-color", "border-color"],
        {
          duration: 250,
          easing: "ease-in"
        }
      ),
      "&:hover": {
        color: "goldenrod"
      }
    },
    delete: {
      "&:hover": {
        transition: theme.transitions.create(
          ["color", "background-color", "border-color"],
          {
            duration: 250,
            easing: "ease-in"
          }
        ),
        color: theme.palette.error.main
      }
    }
  })
);

const ViewTransactionRow: FunctionComponent<{
  transaction: ITransaction;
  loading: boolean;
  onDelete: (t: ITransaction) => void;
  onEdit: () => void;
}> = ({ transaction, loading, onDelete, onEdit }) => {
  const classes = useStyles();

  return (
    <TableRow key={transaction.id} className={classes.transactionList}>
      <TableCell>{format(transaction.purchasedOn, "MM/DD/YYYY")}</TableCell>
      <TableCell>{transaction.name}</TableCell>
      <TableCell>{transaction.description}</TableCell>
      <TableCell>${transaction.cost.toFixed(2)}</TableCell>
      <TableCell>{transaction.tag.label}</TableCell>
      <TableCell align="center">
        <IconButton
          disabled={loading}
          className={classes.edit}
          component={Link}
          to={`/budget/add?tid=${transaction.id}`}
        >
          <Icon>edit</Icon>
        </IconButton>
        <IconButton
          disabled={loading}
          className={classes.delete}
          onClick={onDelete.bind(null, transaction)}
        >
          <Icon>delete</Icon>
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

interface TransactionListProps {
  transactions: ITransaction[];

  onDelete: (transaction: ITransaction) => void;
  onEditSave: (transaction: ITransaction) => void;
}

export const TransactionList: FunctionComponent<TransactionListProps> = ({
  transactions,
  onDelete
}) => {
  const [deletedIds, setDeletedIds] = useState<{ [id: string]: boolean }>({});
  const classes = useStyles();

  const rows = transactions.map(t => {
    return (
      <React.Fragment key={t.id}>
        <ViewTransactionRow
          key={t.id}
          transaction={t}
          onDelete={() => {
            setDeletedIds({ ...deletedIds, [t.id]: true });
            onDelete(t);
          }}
          onEdit={() => 0}
          loading={deletedIds[t.id]}
        />
        {deletedIds[t.id] && (
          <TableRow>
            <TableCell colSpan={6}>
              <LinearProgress />
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  });

  return (
    <Table>
      <TableHead>
        <TableRow className={classes.transactionList}>
          <TableCell>Purchased On</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Cost</TableCell>
          <TableCell>Tag</TableCell>
          <TableCell align="center">Actions</TableCell>
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
