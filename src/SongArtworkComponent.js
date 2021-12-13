import React, { Component } from 'react';
import "./SongArtworkComponent.css"

export default class SongArtworkComponent extends Component {

  render() {
    return(
      <div id="song-artwork-box">
        <img id="album-artwork" src="https://www.gothiccountry.se/images/pictures2/no_album_art__no_cover.jpg"></img>
        <p id="song-title">Song Title</p>
        <p id="artist-name">Artist Name</p>
      </div>
    )
  }

}