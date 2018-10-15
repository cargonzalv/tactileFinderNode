import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'left',
    color: theme.palette.text.secondary,
  },
  appBar: {
    position: 'relative',
}
});


class Header extends Component {


	render() {
		const { classes } = this.props;
		return (
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="headline" color="inherit" noWrap>
            Welcome!
          </Typography>
        </Toolbar>
        </AppBar>
  );
	}
}
Header.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);