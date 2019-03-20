import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Segment,
  Statistic,
  Divider,
  Loader,
  Container,
  Button,
  Tab
} from "semantic-ui-react";
import { getMonthlyBudget } from "../reducers/budget.action";
import STATUSES from "../constants/status";
import { setTagFilter, getTransactions } from "../reducers/transactions.action";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LabelList,
  CartesianGrid,
  Pie,
  PieChart,
  Legend,
  Tooltip,
  Cell
} from "recharts";
import moment from "moment";

function getBudgetBreakdown(transactionsById) {
  const budgetBreakdown = {
    totalSpent: 0,
    spentByCategory: {
      Uncategorized: 0
    }
  };

  let transactions = Object.values(transactionsById);
  transactions.forEach(transaction => {
    budgetBreakdown.totalSpent += transaction.cost;
    if (transaction.tags.length < 1) {
      budgetBreakdown.spentByCategory.Uncategorized += transaction.cost;
    } else {
      transaction.tags.forEach(tag => {
        if (!budgetBreakdown.spentByCategory[tag]) {
          budgetBreakdown.spentByCategory[tag] = 0;
        }

        budgetBreakdown.spentByCategory[tag] += transaction.cost;
      });
    }
  });

  return budgetBreakdown;
}

// returns an array of dates where each date is the first of the month
function getMonthsFromNow(numMonths) {
  const startDate = moment()
    .subtract(numMonths, "months")
    .date(1);
  const dates = [startDate];
  for (let i = 1; i < numMonths; i++) {
    const nextMonth = moment(startDate)
      .add(i, "months")
      .date(1);
    dates.push(nextMonth);
  }

  return dates;
}

class BudgetView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed:
        window.localStorage.getItem("better-budget.budget-view.collapsed") ===
        "true",
      sixMonthTransactions: []
    };
  }

  getTransactionsForMonth = async date => {
    const format = "MMM-YYYY";
    const nowStr = moment().format(format);

    const startDate = moment(date).startOf("month");
    const endDate = moment(startDate).endOf("month");

    // do not cache this month's transactions
    if (nowStr === startDate.format(format)) {
      return getTransactions({
        from: startDate.toDate(),
        to: endDate.toDate()
      });
    }

    // try to get transactions from cache
    const cachedTransactions = window.localStorage.getItem(
      startDate.format(format)
    );
    if (cachedTransactions) {
      console.log("pulled from cache for ", startDate.format(format));
      return JSON.parse(cachedTransactions);
    }

    // not cached
    const transactions = await getTransactions({
      from: startDate.toDate(),
      to: endDate.toDate()
    });

    // cache them
    window.localStorage.setItem(
      startDate.format(format),
      JSON.stringify(transactions)
    );

    return transactions;
  };

  componentWillMount() {
    const promises = getMonthsFromNow(6).map(startDate =>
      this.getTransactionsForMonth(startDate)
    );
    Promise.all(promises).then(monthlyTransactions => {
      console.log(monthlyTransactions);
      let allTransactions = [];
      for (let transactions of monthlyTransactions) {
        allTransactions = allTransactions.concat(transactions);
      }

      this.setState({
        sixMonthTransactions: allTransactions
      });
    });
  }

  setCollapsed = collapsed => {
    this.setState({ collapsed }, () => {
      window.localStorage.setItem(
        "better-budget.budget-view.collapsed",
        collapsed
      );
    });
  };

  renderBudgetBreakdown = (withoutBills) => {
    const data = Object.entries(this.props.budgetBreakdown.spentByCategory)
      .map(([category, cost]) => ({
        category,
        cost
      }))
      .sort((catA, catB) => catB.cost - catA.cost)
      .filter(d => withoutBills ? d.category !== 'Bills' : true);

    let COLORS = [
      "#FFF58A",
      "#FFC9DE",
      "#AFF8DB",
      "#85E3FF",
      "#97A2FF",
      "#FFCCF9",
      "#FFABAB",
      "#E7FFAC",
      "#6EB5FF",
      "#F6A6FF"
    ];

    return (
      <ResponsiveContainer height={400} width="100%">
        <PieChart>
          <Pie dataKey="cost" nameKey="category" data={data}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
            <LabelList dataKey="cost" position="inside"/>
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`}/>
          <Legend/>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  renderSpendingChart = () => {
    const months = getMonthsFromNow(6).map(d => d.format("MMM"));

    const transactionsByMonth = this.state.sixMonthTransactions.reduce(
      (buckets, t) => {
        const month = moment(t.date).format("MMM");
        if (!buckets[month]) {
          buckets[month] = 0;
        }

        buckets[month] += t.cost;

        return buckets;
      },
      {}
    );

    const data = months.map(m => ({
      month: m,
      total: Math.round(transactionsByMonth[m])
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <Bar
            dataKey="total"
            fill="#8fbc8f"
            label={data => `$${data.value}`}
          />
          <XAxis dataKey="month" />
          <YAxis dataKey="total" unit="$" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  componentDidMount() {
    const year = this.props.selectedDate.getFullYear();
    const month = this.props.selectedDate.getMonth();
    this.props.loadMonthlyBudget(year, month);
  }
  render() {
    if (this.props.loading === STATUSES.STARTED) {
      return (
        <Segment>
          <Loader active={true} />
        </Segment>
      );
    }

    if (this.props.loading === STATUSES.FAILED) {
      return (
        <Segment>
          <Container>
            <p>
              There was an error fetching the budget. Please reload the page and
              try again.
            </p>
          </Container>
        </Segment>
      );
    }

    const moneyRemaining = this.props.budget.income - this.props.budgetBreakdown.totalSpent;
    const { totalSpent } = this.props.budgetBreakdown;
    return (
      <Segment id="budget-stats">
        <Button
          icon={this.state.collapsed ? "plus" : "minus"}
          floated="right"
          onClick={this.setCollapsed.bind(null, !this.state.collapsed)}
        />
        <div className="budget-view-stats">
          <Statistic size="tiny">
            <Statistic.Value>
              ${this.props.budget.income.toFixed(2)}
            </Statistic.Value>
            <Statistic.Label>Income</Statistic.Label>
          </Statistic>
          <Statistic size="tiny">
            <Statistic.Value style={{ color: "#721c24" }}>
              ${totalSpent.toFixed(2)}
            </Statistic.Value>
            <Statistic.Label>Total Spent</Statistic.Label>
          </Statistic>
          <Statistic size="tiny">
            <Statistic.Value
              style={{ color: moneyRemaining > this.props.budget.savingsGoal ? "seagreen" : "red" }}
            >
              ${moneyRemaining.toFixed(2)}
            </Statistic.Value>
            <Statistic.Label>Money Remaining</Statistic.Label>
          </Statistic>
        </div>
        <Divider />
        {!this.state.collapsed && (
          <Tab
            menu={{ secondary: true }}
            panes={[
              {
                menuItem: "Budget Breakdown",
                render: this.renderBudgetBreakdown.bind(this, false)
              },
              {
                menuItem: "Budget Breakdown (Without Bills)",
                render: this.renderBudgetBreakdown.bind(this, true)
              },
              {
                menuItem: "6 Month Spending (BETA)",
                render: this.renderSpendingChart
              }
            ]}
          />
        )}
      </Segment>
    );
  }
}

export default connect(
  state => ({
    budget: state.budget.monthlyBudget,
    selectedDate: state.transactions.selectedDate,
    budgetBreakdown: getBudgetBreakdown(state.transactions.transactionsById),
    loading: state.budget.loading
  }),
  dispatch => ({
    loadMonthlyBudget: (year, month) => {
      dispatch(getMonthlyBudget(year, month));
    },
    setTagFilter: tag => {
      dispatch(setTagFilter(tag));
      window.location.hash = "transactions";
    }
  })
)(BudgetView);
