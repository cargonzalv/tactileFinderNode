import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  root: {
		flexGrow: 1,
		position:"fixed",
		left: 0,
		height: 48,
		top: "calc(100% - 35px)",
    width: "100%",
		textAlign: "center",
		verticalAlign: "middle"
  },
  paper: {
    padding: "0 " + theme.spacing.unit * 2 + "px 0 " + theme.spacing.unit * 2 + "px",
    textAlign: 'left',
    color: theme.palette.text.secondary,
  },
});


class Footer extends Component {


	render() {
		const { classes } = this.props;
		return (
			<div className={classes.root}>
				<Paper className={classes.paper}>
          			<Grid container spacing={24}>
          				<Grid item xs={9}>
          				Mit license. by Carlos Gonzalez
          				</Grid>
          				<Grid item xs={3}>
           				* By magic we mean machine learning
           				</Grid>
           			</Grid>
          		</Paper>
          	</div>
          	);
	}
}
Footer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Footer);