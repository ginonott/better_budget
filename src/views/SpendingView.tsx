import React, { useState, useCallback } from "react";
import { Container, Paper, Typography, Divider } from "@material-ui/core";
import { startOfMonth, endOfMonth, subMonths, format, getDate } from "date-fns";
import { useTransactions } from "../hooks/useTransactions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Bar,
  BarChart
} from "recharts";
import ITransaction from "../models/Transaction";
import { useIncome } from "../hooks/useIncome";

function getSpendingByTag(transactions: ITransaction[]) {
  const spendingByTag: { [tag: string]: number } = {};

  return transactions.reduce((spending, t) => {
    if (!spending[t.tag.label]) {
      spending[t.tag.label] = 0;
    }
    spending[t.tag.label] += t.cost;

    return spending;
  }, spendingByTag);
}

function combineSpendingByTag(
  spendingByTag1: ReturnType<typeof getSpendingByTag>,
  spendingByTag2: ReturnType<typeof getSpendingByTag>
) {
  const combinedSpendingByTag: {
    [tag: string]: {
      s1: number;
      s2: number;
    };
  } = {};

  Object.entries(spendingByTag1).forEach(([tag, amt]) => {
    if (tag === "") {
      return;
    }

    if (!combinedSpendingByTag[tag]) {
      combinedSpendingByTag[tag] = {
        s1: 0,
        s2: 0
      };
    }

    combinedSpendingByTag[tag].s1 += amt;
  });

  Object.entries(spendingByTag2).forEach(([tag, amt]) => {
    if (tag === "") {
      return;
    }

    if (!combinedSpendingByTag[tag]) {
      combinedSpendingByTag[tag] = {
        s1: 0,
        s2: 0
      };
    }

    combinedSpendingByTag[tag].s2 += amt;
  });

  return combinedSpendingByTag;
}

function getSpendingByDay(transactions: ITransaction[]) {
  return transactions.reduce(
    (bucket, transaction) => {
      const date = getDate(transaction.purchasedOn);

      if (!bucket[date]) {
        bucket[date] = 0;
      }

      bucket[date] += transaction.cost;

      return bucket;
    },
    {} as { [date: number]: number }
  );
}

function combineSpendingByDate(
  spending1: { [date: number]: number },
  spending2: { [date: number]: number }
) {
  const combinedSpending: {
    [date: number]: {
      s1: number;
      s2: number;
    };
  } = {};

  Object.entries(spending1).forEach(([key, value]) => {
    const k = parseInt(key);
    if (!combinedSpending[k]) {
      combinedSpending[k] = {
        s1: 0,
        s2: 0
      };
    }

    combinedSpending[k].s1 = value;
  });

  Object.entries(spending2).forEach(([key, value]) => {
    const k = parseInt(key);
    if (!combinedSpending[k]) {
      combinedSpending[k] = {
        s1: 0,
        s2: 0
      };
    }

    combinedSpending[k].s2 = value;
  });

  return combinedSpending;
}

export const SpendingView = () => {
  const income = useIncome();

  const [width, setWidth] = useState(0);

  const measuredRef = useCallback(node => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const today = new Date();
  const thisMonthsTransactions = useTransactions({
    from: startOfMonth(today),
    to: endOfMonth(today)
  });

  const lastMonthsTransactions = useTransactions({
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1))
  });

  const lastMonthSpendingByDay = getSpendingByDay(lastMonthsTransactions);
  const thisMonthsSpendingByDay = getSpendingByDay(thisMonthsTransactions);

  const spending = Object.entries(
    combineSpendingByDate(lastMonthSpendingByDay, thisMonthsSpendingByDay)
  )
    .map(([key, value]) => ({
      name: key,
      lx: value.s1,
      cx: value.s2
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name))
    .map(d => ({
      ...d,
      name: d.name.padStart(2, "0")
    }));

  const accumulatedSpending = [...spending];
  for (let i = 1; i < accumulatedSpending.length; i++) {
    accumulatedSpending[i].lx += accumulatedSpending[i - 1].lx;
    accumulatedSpending[i].cx += accumulatedSpending[i - 1].cx;

    accumulatedSpending[i].lx = parseInt(accumulatedSpending[i].lx.toFixed(2));
    accumulatedSpending[i].cx = parseInt(accumulatedSpending[i].cx.toFixed(2));
  }

  const thisMonthsSpendingByTag = getSpendingByTag(thisMonthsTransactions);
  const lastMonthsSpendingByTag = getSpendingByTag(lastMonthsTransactions);
  console.log(thisMonthsSpendingByTag, lastMonthsSpendingByTag);
  const combinedSpending = Object.entries(
    combineSpendingByTag(thisMonthsSpendingByTag, lastMonthsSpendingByTag)
  ).map(([tag, amts]) => {
    return {
      name: tag,
      cx: amts.s1.toFixed(2),
      lx: amts.s2.toFixed(2)
    };
  });

  return (
    <Container>
      <Paper ref={measuredRef} style={{ paddingLeft: "8px" }}>
        <Typography variant="h5">Current Spending Vs Last Month</Typography>
        <br />
        <LineChart
          width={width - 8}
          height={500}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          data={spending}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <ReferenceLine
            y={income}
            label="Monthly Budget"
            stroke="red"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="lx"
            stroke="#8884d8"
            name={format(subMonths(today, 1), "MMMM")}
          />
          <Line
            type="monotone"
            dataKey="cx"
            stroke="#82ca9d"
            name={format(today, "MMMM")}
          />
        </LineChart>
      </Paper>
      <br />
      <Paper style={{ paddingLeft: "8px" }}>
        <Typography variant="h5">
          Current Spending By Tag Vs Last Month Spending By Tag
        </Typography>
        <BarChart width={width - 8} height={500} data={combinedSpending}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="cx"
            fill="#8884d8"
            name={format(subMonths(today, 1), "MMMM")}
          />
          <Bar dataKey="lx" fill="#82ca9d" name={format(today, "MMMM")} />
        </BarChart>
      </Paper>
    </Container>
  );
};
