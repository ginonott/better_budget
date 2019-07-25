import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import React, { FunctionComponent } from "react";
import { MonthlyBudgetView } from "../views/MonthlyBudgetView";
import AddTransaction from "../views/AddTransactionView";
import { getMonth, getYear } from "date-fns";
import { Container } from "@material-ui/core";
import { Header } from "./TopBar";

export const SiteRouter: FunctionComponent = () => {
  const thisMonth = getMonth(new Date());
  const thisYear = getYear(new Date());

  const defaultPath = `/budget/${thisYear}/${thisMonth + 1}`;

  return (
    <Router>
      <Header />
      <Container className="App" maxWidth="lg">
        <Switch>
          <Route path="/" exact>
            <Redirect to={defaultPath} />
          </Route>
          <Route
            path="/budget/:year/:month/"
            exact
            render={({ match }) => {
              const {
                params: { year, month }
              } = match;

              return (
                <MonthlyBudgetView
                  year={Number.parseInt(year)}
                  month={Number.parseInt(month)}
                />
              );
            }}
          />
          <Route path="/budget/add" exact component={AddTransaction} />
          <Route>
            {/* The "404" Path */}
            <h1>Oh no! There has been a terrible mistake!</h1>
            <p>
              <Link to={defaultPath}>Click Here</Link> to go to this month's
              budget.
            </p>
          </Route>
        </Switch>
      </Container>
    </Router>
  );
};

export default SiteRouter;
