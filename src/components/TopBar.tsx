import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  Theme,
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
        <Typography variant="h6" color="inherit">
          Budget v3
        </Typography>
        <span className={classes.spacer} />
        {user ? (
          <Button
            color="inherit"
            onClick={() => {
              firebase.auth().signOut();
            }}
          >
            Logout
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
