import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import Player from "./Player";
import logo from "./logo.svg";
import "./App.css";
import SongArtworkComponent from "./SongArtworkComponent.js";

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
      },
      is_playing: "Paused",
      progress_ms: 0,
      no_data: false,
    };

    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.tick = this.tick.bind(this);
  }



  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      this.getCurrentlyPlaying(_token);
    }

    // set interval for polling every 5 seconds
    this.interval = setInterval(() => this.tick(), 5000);
  }

  componentWillUnmount() {
    // clear the interval to save resources
    clearInterval(this.interval);
  }

  tick() {
    if(this.state.token) {
      this.getCurrentlyPlaying(this.state.token);
    }
  }


  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }

        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms,
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
        });
      }
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p className="app-title">TubaTube</p>
          <p className="app-subtitle">Expand your horizons</p>

          <p className="playlist-header">From your new playlist...</p>
          <p className="p-transparent">(Look in your Spotify playlists for "Worst Songs 853093")</p>

          <div className="song-artwork-container">
            <SongArtworkComponent
              artwork_url="https://upload.wikimedia.org/wikipedia/en/f/fe/Sound_of_joy.jpg"
              song_title="Reflections in Blue"
              artist_name="Sun Ra"
              genre_name="Free jazz"/>
            <SongArtworkComponent
              artwork_url="https://m.media-amazon.com/images/I/81INZs21JoL._SL1500_.jpg"
              song_title="Death Magick for Adepts"
              artist_name="Cradle of Filth"
              genre_name="Black metal"/>
            <SongArtworkComponent
              artwork_url="https://upload.wikimedia.org/wikipedia/en/d/da/Georgiaclay.jpg"
              song_title="A Real Good Try"
              artist_name="Josh Kelley"
              genre_name="Country roads"/>
            <SongArtworkComponent
              artwork_url="https://upload.wikimedia.org/wikipedia/en/a/a1/Diary_of_a_psamlist.jpg"
              song_title="Lift Those Hands"
              artist_name="Marvin Sapp"
              genre_name="Gospel"/>
          </div>

          <p className="p-transparent">Listeners like you are least likely to enjoy songs in these styles</p>

          <div id="test-div-1">
              <p id="test-p-1">Genres:</p>
          </div>
          <div id="test-div-2">
              <p id="test-p-2">Playlist ID:</p>
          </div>
          <div id="test-div-3">
              <p id="test-p-3">Songs for each genre:</p>
          </div>

          <img src={logo} className="App-logo" alt="logo" />
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}
          {this.state.token && !this.state.no_data && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.state.progress_ms}
            />
          )}
          {this.state.no_data && (
            <p>
              You need to be playing a song on Spotify, for something to appear here.
            </p>
          )}
        </header>
      </div>
    );
  }
}

export default App;