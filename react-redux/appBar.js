import React, { Component } from "react";
import { render } from "react-dom";

//import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Collapse from "@material-ui/core/Collapse";

import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

import SimpleModal from "./modal";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    backgroundColor: "pink",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  largeContent: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  }
});

export default class MainAppBar extends Component {
  state = { expanded: false };
  toggle = () => this.setState({ expanded: !this.state.expanded });
  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton onClick={this.toggle} color="inherit">
              <MenuIcon />
            </IconButton>
            <Typography color="inherit">Large</Typography>
          </Toolbar>
          <Collapse in={this.state.expanded}>
            <div style={{ backgroundColor: "white", color: "black" }}>
              Hello world ABC
              <br />
              Hello world ABC
              <br />
              Hello world ABC
              <br />
              Hello world ABC
              <br />
            </div>
          </Collapse>
        </AppBar>
        <SimpleModal />
        <button onClick={this.toggle}>Toggle Expand</button>
      </div>
    );
  }
}

//export default withStyles(styles)(MainAppBar);
