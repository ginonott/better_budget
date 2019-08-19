import React from "react";
import "./App.css";
import { BudgetServiceProvider } from "./components/BudgetServiceProvider";
import SiteRouter from "./components/SiteRouter";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { FirestoreBudgetService } from "./services/FirestoreBudgetService";

const budgetService = new FirestoreBudgetService();
const theme = createMuiTheme();

const App: React.FC = () => {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <BudgetServiceProvider budgetService={budgetService}>
          <SiteRouter />
        </BudgetServiceProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
