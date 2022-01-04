import React, { Component } from "react";
//import hash from "./hash";
import logo from "./logo.svg";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import Player from "./Player.js";

console.log('got here 1');
// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

console.log(hash);
window.location.hash = "";

class SpotifyButton extends Component {
    componentDidMount() {
        console.log('got here 2');
        // Set token
        let _token = hash.access_token;
        if (_token) {
            // Set token
            this.setState({
                token: _token
            });
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                {!this.state.token && (
                    <a
                    className="btn btn--loginApp-link"
                    href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
                    >
                    Login to Spotify
                    </a>
                )}
                {this.state.token && (
                    <Player
                    item={this.state.item}
                    is_playing={this.state.is_playing}
                    progress_ms={this.progress_ms}
                />
                )}
                </header>
            </div>
        );
    }
}

export default SpotifyButton;