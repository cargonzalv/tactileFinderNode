import React, { Component } from 'react';
import Header from './components/shared/Header';
import HomePage from './components/shared/HomePage';
import Footer from './components/shared/Footer';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <HomePage />
        <Footer />
      </div>
    );
  }
}

export default App;
