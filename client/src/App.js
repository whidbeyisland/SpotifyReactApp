import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import PythonButton from "./PythonButton.js";
import SpotifyDivs from "./SpotifyDivs.js";
import SpotifyButton from "./SpotifyButton.js";
import SongArtworkComponent from "./SongArtworkComponent.js";
import Button from "react-bootstrap/Button";
//import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
    }

    callAPI() {
        fetch("http://localhost:9000/testAPI")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }))
            .catch(err => err);
    }

    componentDidMount() {
        this.callAPI();
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <p className="app-title">TubaTube</p>
                    <p className="app-subtitle">Expand your horizons</p>
                    <p className="playlist-header">From your new playlist...</p>

                    <div className="song-artwork-container">
                      <SongArtworkComponent/>
                      <SongArtworkComponent/>
                      <SongArtworkComponent/>
                      <SongArtworkComponent/>
                    </div>

                    <p className="p-transparent">Listeners like you are least likely to enjoy songs in these styles</p>

                    <SpotifyDivs/>
                    <PythonButton/>
                </header>
                <p className="App-intro">{this.state.apiResponse}</p>
            </div>
        );
    }
}

export default App;