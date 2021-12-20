import React, { Component } from 'react';
//import "./SongArtworkComponent.css"

// const express = require('express');
// const {spawn} = require('child_process');
// const app = express();
// const port = 3000;

export default class PythonButton extends React.Component {

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {

    //coati: fill this up later

  }
  render() {
    return(
      <button onClick={this.handleClick}>Create my playlist</button>
    )
  }

}