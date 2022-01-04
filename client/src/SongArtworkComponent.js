import React, { Component } from 'react';
import "./SongArtworkComponent.css"

export default class SongArtworkComponent extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      artwork_url: this.props.artwork_url ?? 'https://www.gothiccountry.se/images/pictures2/no_album_art__no_cover.jpg',
      song_title: this.props.song_title ?? 'Song Title',
      artist_name: this.props.artist_name ?? 'Artist Name',
      genre_name: this.props.genre_name ?? 'Genre'
    };
  }

  render() {
    return(
      <div id="song-artwork-box">
        <img id="album-artwork" src={this.state.artwork_url}></img>
        <p id="song-title">{this.state.song_title}</p>
        <p id="artist-name">{this.state.artist_name}</p>
        <p id="genre-name">{this.state.genre_name}</p>
      </div>
    )
  }

}