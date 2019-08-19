import React, { FunctionComponent } from "react";
import ITransaction from "../models/Transaction";
import {
  Card,
  CardContent,
  Theme,
  Typography,
  Divider,
  CardHeader,
  CardActions
} from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/styles";
import { endOfMonth, getDate, isWithinRange, startOfMonth } from "date-fns";

interface ISpendingOverviewProps {
  transactions: ITransaction[];
  income: number;
  month: Date;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: "100%",

      [theme.breakpoints.up("md")]: {
        maxWidth: "200px"
      }
    },
    cardRow: {
      marginBottom: "2rem",
      marginTop: "2rem",
      display: "flex",
      flexDirection: "column",
      flexWrap: "wrap",

      [theme.breakpoints.up("md")]: {
        flexDirection: "row"
      }
    }
  })
);

const SpendingOverview: FunctionComponent<ISpendingOverviewProps> = ({
  transactions,
  month,
  income
}) => {
  const classes = useStyles();
  const total = transactions.reduce((sum, t) => sum + t.cost, 0);
  const moneyLeft = income - total;

  const daysUntilEndOfMonth = isWithinRange(
    month,
    startOfMonth(new Date()),
    endOfMonth(new Date())
  )
    ? getDate(endOfMonth(month)) - getDate(new Date())
    : 0;
  return (
    <div className={classes.cardRow}>
      <Card className={classes.card}>
        <CardHeader
          title="Spending"
          subheader={`${daysUntilEndOfMonth} days left`}
        />
        <Divider variant="fullWidth" />
        <CardContent>
          <div>
            <Typography align="center" variant="h6">
              ${total.toFixed(2)}
            </Typography>
            <Divider variant="middle" />
            <Typography align="center" variant="h6" gutterBottom>
              ${income.toFixed(2)}
            </Typography>
          </div>
        </CardContent>
        <Divider variant="fullWidth" />
        <CardActions>
          <Typography
            variant="caption"
            align="left"
            color={moneyLeft > 0 ? "textSecondary" : "error"}
          >
            ${moneyLeft.toFixed(2)} left for the month
          </Typography>
        </CardActions>
      </Card>
    </div>
  );
};

export default SpendingOverview;
