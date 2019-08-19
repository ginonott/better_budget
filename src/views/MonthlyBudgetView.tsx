import React, { FunctionComponent } from "react";
import {
  BudgetServiceSubscriber,
  useBudgetService
} from "../components/BudgetServiceProvider";
import { TransactionList } from "../components/TransactionList";
import { Paper, Divider, Container, Fab, Icon, Theme } from "@material-ui/core";
import { Redirect } from "react-router";
import { makeStyles, createStyles } from "@material-ui/styles";
import { Link } from "react-router-dom";
import { isDate, endOfMonth } from "date-fns";
import BudgetHeader from "../components/BudgetHeader";
import SpendingOverview from "../components/SpendingOverview";
import ITransaction from "../models/Transaction";

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
    }
  })
);

export const MonthlyBudgetView: FunctionComponent<IMonthlyBudgetView> = ({
  year,
  month
}) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = endOfMonth(startOfMonth);
  const classes = useStyles();
  const budgetService = useBudgetService();

  if (!isDate(startOfMonth)) {
    return <Redirect to="/" />;
  }

  return (
    <BudgetServiceSubscriber
      queryOptions={{ from: startOfMonth, to: lastDayOfMonth }}
    >
      {({ transactions, income }) => (
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
      )}
    </BudgetServiceSubscriber>
  );
};
