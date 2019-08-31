import React, { FunctionComponent } from "react";
import { useBudgetService } from "../components/BudgetServiceProvider";
import { TransactionList } from "../components/TransactionList";
import {
  Paper,
  Divider,
  Container,
  Fab,
  Icon,
  Theme,
  Select,
  MenuItem
} from "@material-ui/core";
import { Redirect } from "react-router";
import { makeStyles, createStyles } from "@material-ui/styles";
import { Link } from "react-router-dom";
import { isDate, endOfMonth } from "date-fns";
import BudgetHeader from "../components/BudgetHeader";
import SpendingOverview from "../components/SpendingOverview";
import ITransaction from "../models/Transaction";
import { ITag } from "../models/Tag";
import { useTags } from "../hooks/useTags";
import { useTransactions } from "../hooks/useTransactions";
import { useIncome } from "../hooks/useIncome";

interface IMonthlyBudgetView {
  year: number;
  month: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: "fixed",
      bottom: "2rem",
      right: "2rem"
    },
    budgetHeaderDiv: {
      display: "flex",
      marginLeft: "auto",
      marginRight: "auto",
      flexDirection: "row"
    },
    tableOptionsDiv: {
      display: "flex",
      flexDirection: "column",

      [theme.breakpoints.up("md")]: {
        flexDirection: "row",
        justifyContent: "flex-end",

        "& > div": {
          marginLeft: "1rem"
        }
      }
    }
  })
);

const SortSelect = ({ sort = "date" }: { sort?: "cost" | "name" | "date" }) => {
  return (
    <Select value={sort} startAdornment={<Icon>sort</Icon>}>
      {["date", "name", "cost"].map(s => (
        <MenuItem key={s} value={s}>
          {s}
        </MenuItem>
      ))}
    </Select>
  );
};

const FilterSelect = ({
  tags,
  filter = "all"
}: {
  tags: ITag[];
  filter?: string;
}) => {
  return (
    <Select value={filter} startAdornment={<Icon>filter_list</Icon>}>
      {[{ label: "All", id: "all" } as ITag, ...tags].map(tag => (
        <MenuItem key={tag.id} value={tag.id}>
          {tag.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export const MonthlyBudgetView: FunctionComponent<IMonthlyBudgetView> = ({
  year,
  month
}) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = endOfMonth(startOfMonth);
  const classes = useStyles();
  const budgetService = useBudgetService();
  const tags = useTags();
  const transactions = useTransactions({
    from: startOfMonth,
    to: lastDayOfMonth
  });
  const income = useIncome();

  if (!isDate(startOfMonth)) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Container>
        <BudgetHeader startOfMonth={startOfMonth} />
        <Divider />
      </Container>
      <SpendingOverview
        transactions={transactions}
        month={startOfMonth}
        income={income}
      />
      <Paper>
        <Container>
          <div className={classes.tableOptionsDiv} style={{ display: "none" }}>
            <FilterSelect tags={tags} />
            <SortSelect />
          </div>
          <TransactionList
            transactions={transactions}
            onDelete={(transaction: ITransaction) => {
              budgetService.deleteTransaction(transaction.id);
            }}
            onEditSave={() => 0}
          />
          <Fab
            color="primary"
            aria-label="New Transaction"
            className={classes.fab}
            component={Link}
            to="/budget/add"
          >
            <Icon>add_icon</Icon>
          </Fab>
        </Container>
      </Paper>
    </>
  );
};
