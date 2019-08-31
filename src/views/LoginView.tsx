import React from "react";
import {
  TextField,
  createStyles,
  makeStyles,
  Theme,
  Button,
  Paper
} from "@material-ui/core";
import { useState } from "react";
import { FirebaseLoginService } from "../services/FirebaseLoginService";
import { RouterProps } from "react-router";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: "flex",
      flexDirection: "column"
    },
    paper: {
      maxWidth: 720,
      marginLeft: "auto",
      marginRight: "auto",
      padding: "1rem"
    },
    margin: {
      marginTop: "2rem"
    }
  })
);

export const LoginView = (history: RouterProps["history"]) => {
  const ref = new URLSearchParams(history.location.search).get("ref");

  const classes = useStyles();

  const [formState, setFormState] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key: string) => (
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormState({
      ...formState,
      [key]: evt.target.value
    });
  };

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const fbLoginSvc = new FirebaseLoginService();
    fbLoginSvc
      .login(formState.email, formState.password)
      .then(() => {
        if (ref) {
          history.replace(ref);
        } else {
          history.replace("/");
        }
      })
      .catch(err => {
        setErrorMsg(err.message);
      });
  };

  return (
    <Paper className={classes.paper}>
      <form className={classes.form} onSubmit={handleSubmit}>
        <TextField
          className={classes.margin}
          autoFocus
          id="name"
          label="Email"
          value={formState.email}
          onChange={handleChange("email")}
          margin="normal"
        />
        <TextField
          className={classes.margin}
          type="password"
          id="password"
          label="Password"
          value={formState.password}
          onChange={handleChange("password")}
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.margin}
        >
          Login
        </Button>
        <p>{errorMsg}</p>
      </form>
    </Paper>
  );
};
