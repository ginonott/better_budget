import { withStyles, createStyles, makeStyles } from "@material-ui/styles";
import {
  Theme,
  InputBase,
  IconButton,
  Icon,
  Select,
  MenuItem
} from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { format, addMonths, subMonths, getMonth, getYear } from "date-fns";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";

const MonthInput = withStyles((theme: Theme) =>
  createStyles({
    input: {
      borderRadius: 4,
      width: "7rem",
      position: "relative",
      backgroundColor: theme.palette.background.paper,
      fontSize: "1.5rem",
      padding: "10px 26px 10px 12px",
      margin: "2px",
      transition: theme.transitions.create([
        "border-color",
        "box-shadow",
        "background-color"
      ]),
      "&:focus": {
        borderRadius: 4,
        borderColor: "#80bdff",
        boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)"
      },
      "&:hover": {
        backgroundColor: theme.palette.grey[200]
      }
    }
  })
)(InputBase);

const YearInput = withStyles((_theme: Theme) =>
  createStyles({
    input: {
      width: "4rem",
      padding: "auto 0px auto 0px"
    }
  })
)(MonthInput);

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    budgetHeaderDiv: {
      display: "flex",
      marginLeft: "auto",
      marginRight: "auto",
      flexDirection: "row",
      justifyContent: "center"
    },
    iconButton: {
      marginTop: "auto",
      marginBottom: "auto",
      marginLeft: "1rem",
      marginRight: "1rem"
    }
  })
);

interface IBudgetHeader extends RouteComponentProps {
  startOfMonth: Date;
}

const BudgetHeader: FunctionComponent<IBudgetHeader> = ({
  startOfMonth,
  history
}) => {
  const classNames = useStyles();
  const nextMonth = addMonths(startOfMonth, 1);
  const lastMonth = subMonths(startOfMonth, 1);
  return (
    <div className={classNames.budgetHeaderDiv}>
      <IconButton
        className={classNames.iconButton}
        component={Link}
        to={`/budget/${getYear(lastMonth)}/${getMonth(lastMonth) + 1}/`}
      >
        <Icon>keyboard_arrow_left</Icon>
      </IconButton>
      <Select
        IconComponent={() => <div />}
        value={getMonth(startOfMonth)}
        onChange={evt => {
          history.push(
            `/budget/${getYear(nextMonth)}/${(evt.target.value as number) + 1}/`
          );
        }}
        input={<MonthInput name="month" id="month" />}
      >
        {new Array(12)
          .fill(0)
          .map((_, i) => i)
          .map(month => (
            <MenuItem key={month} value={month}>
              {" "}
              {format(new Date(2019, month, 1), "MMMM")}
            </MenuItem>
          ))}
      </Select>
      <Select
        displayEmpty={true}
        IconComponent={() => <div />}
        value={getYear(startOfMonth)}
        renderValue={v => <div>{v as number}</div>}
        onChange={evt => {
          history.push(
            `/budget/${evt.target.value}/${getMonth(startOfMonth) + 1}/`
          );
        }}
        input={<YearInput name="year" id="year" />}
      >
        {new Array(getYear(new Date()) + 1 - 2017)
          .fill(0)
          .map((_, i) => i + 2018)
          .map(year => (
            <MenuItem key={year} value={year}>
              {" "}
              {year}{" "}
            </MenuItem>
          ))}
      </Select>
      <IconButton
        className={classNames.iconButton}
        component={Link}
        to={`/budget/${getYear(nextMonth)}/${getMonth(nextMonth) + 1}/`}
      >
        <Icon>keyboard_arrow_right</Icon>
      </IconButton>
    </div>
  );
};

const BudgetHeaderWithRouter = withRouter(BudgetHeader);

export default BudgetHeaderWithRouter;
