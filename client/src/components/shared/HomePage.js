import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import './HomePage.css';
import ImageGrid from './ImageGrid'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
   textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
});


class HomePage extends Component {

state = {
    name: ''
  };

handleChange = (name) => event => {
    this.setState({
      name: event.target.value,
    });
  };

uploadImage = (name) => event => {
    this.setState({
      name: event.target.value,
    });
  };

searchImage = (name) => event => {
    this.setState({
      name: event.target.value,
    });
  };
	render() {
		const { classes } = this.props;
		return (
    <div className={classes.root}>
      <Grid container >
      <Grid className="specialGrid" item xs={1}>
       </Grid>
        <Grid item xs={10}>
          <Paper className={classes.paper}>
          <Grid item xs={12}>
            <Typography variant="display4" color="inherit" noWrap>
            T-Graph
            </Typography>
          </Grid>

          <Grid item xs={12}>
          <TextField
          id="outlined-name"
          style={{ margin: 1 }}
          label="Search for your image"
          className={classes.textField}
          fullWidth
          value={this.state.name}
          onChange={this.handleChange('Search for your image')}
          margin="normal"
          variant="outlined"
          />
          </Grid>
          <Grid container spacing={24}>
          	<Grid item xs={6}>
          		<Button id="uploadButton" 
      			variant="contained" 
      			color="primary" 
      			className={classes.button} 
      			fullWidth={true}
      			onClick={this.uploadImage}>
      			Upload your image
      			</Button>
      		</Grid>
      		<Grid item xs={6}>
      		<Button id="searchButton" 
          		variant="contained" 
          		color="primary" 
          		className={classes.button} 
          		fullWidth={true}
          		onClick={this.searchImage}>
        		Search for a tactile graph
      			</Button>
      		</Grid>
     	  </Grid>
          <Grid item xs={12}>
            <Typography id="subheading" variant="title" align="center" color="textSecondary" paragraph>
              Making more tactile graphs available to blind people through magic*
            </Typography>
          </Grid>
          <Grid item xs={12}>
          	<ImageGrid/>




            <Typography id="subheading" variant="title" align="center" color="textSecondary" paragraph>
              Examples of good images to upload
            </Typography>



          </Grid>
          </Paper>
        </Grid>
        <Grid className="specialGrid" item xs={1}>
        </Grid>
      </Grid>
    </div>
  );
	}
}
HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HomePage);