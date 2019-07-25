import React, { FunctionComponent } from "react";
import { BudgetServiceSubscriber } from "../components/BudgetServiceProvider";
import { TransactionList } from "../components/TransactionList";
import { Paper, Divider, Container, Fab, Icon, Theme } from "@material-ui/core";
import { Redirect } from "react-router";
import { makeStyles, createStyles } from "@material-ui/styles";
import { Link } from "react-router-dom";
import { isDate, endOfMonth } from "date-fns";
import BudgetHeader from "../components/BudgetHeader";

interface IMonthlyBudgetView {
  year: number;
  month: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: "absolute",
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

  if (!isDate(startOfMonth)) {
    return <Redirect to="/" />;
  }

  return (
    <div>
      <Container>
        <BudgetHeader startOfMonth={startOfMonth} />
      </Container>
      <Paper>
        <Container>
          <BudgetServiceSubscriber
            queryOptions={{ from: startOfMonth, to: lastDayOfMonth }}
          >
            {({ transactions }) => (
              <TransactionList transactions={transactions} />
            )}
          </BudgetServiceSubscriber>
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
    </div>
  );
};
