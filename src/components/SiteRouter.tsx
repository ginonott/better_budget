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
import { useLogin } from "../hooks/useLogin";
import { LoginView } from "../views/LoginView";
import { SpendingView } from "../views/SpendingView";

export const SiteRouter: FunctionComponent = () => {
  const thisMonth = getMonth(new Date());
  const thisYear = getYear(new Date());

  const defaultPath = `/budget/${thisYear}/${thisMonth + 1}/`;
  const user = useLogin();

  const ref = new URLSearchParams(window.location.search).get("ref");

  return (
    <Router>
      <Header />
      <Container className="App" maxWidth="lg">
        {user ? (
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
            <Route path="/spending" exact component={SpendingView} />
            <Route exact path="/login">
              <Redirect to={ref || defaultPath} />
            </Route>
            <Route>
              {/* The "404" Path */}
              <h1>Oh no! There has been a terrible mistake!</h1>
              <p>
                <Link to={defaultPath}>Click Here</Link> to go to this month's
                budget.
              </p>
            </Route>
          </Switch>
        ) : (
          <Switch>
            <Route exact path="/login" component={LoginView} />
            <Route>
              <Redirect to={`/login?ref=${window.location.pathname}`} />
            </Route>
          </Switch>
        )}
      </Container>
    </Router>
  );
};

export default SiteRouter;
