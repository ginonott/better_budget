import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  Theme,
  Icon,
  createStyles
} from "@material-ui/core";
import { useLogin } from "../hooks/useLogin";
import { Link } from "react-router-dom";
import firebase from "firebase";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spacer: {
      flex: 1
    }
  })
);
export const Header = () => {
  const classes = useStyles();
  const user = useLogin();

  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/">
          <Typography variant="h6" color="inherit">
            Budget
          </Typography>
        </Button>
        <span className={classes.spacer} />
        <Button color="inherit" component={Link} to="/spending">
          Spending <Icon>show_chart</Icon>
        </Button>
        {user ? (
          <Button
            color="inherit"
            onClick={() => {
              firebase.auth().signOut();
            }}
          >
            Logout <Icon>exit_to_app</Icon>
          </Button>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
