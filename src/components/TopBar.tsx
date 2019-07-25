import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";

export const Header = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        Budget v3
      </Typography>
      <Button color="inherit"> Login </Button>
    </Toolbar>
  </AppBar>
);
