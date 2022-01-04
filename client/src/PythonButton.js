import React, { Component } from 'react';
import "./App.css";

// const express = require('express');
// const {spawn} = require('child_process');
// const app = express();
// const port = 3000;

export default class PythonButton extends Component {

    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
        this.handleClick = this.handleClick.bind(this);
    }

    callAPI() {
        fetch("http://localhost:9000/pythonAPI")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }))
            .catch(err => err);
    }

    /*
    componentDidMount() {
        this.callAPI();
    }
    */

    handleClick() {
        //coati: fill this up later
        //alert('using Python');
        this.callAPI();
    }
    
    render() {
        return(
        <div>
            <button onClick={this.handleClick}>Use Python</button>
            <p>{this.state.apiResponse}</p>
        </div>
        )
    }

}