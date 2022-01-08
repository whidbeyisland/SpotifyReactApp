import React, { Component } from 'react';
import "./App.css";
import { user_id, reqheader, reqheader2 } from './config';
import reportWebVitals from './reportWebVitals';
import $ from 'jquery';
// import { resolve } from 'path/posix';

var counter = 0;
var max = 50;
var maxCycles = 5;
var thisCycle = 0;
var special_value;
// var intervalId;
// var requestSongs_done = false;
// var generatePlaylist_done = false;
var top10Genres = new Array();
var top10Genres_opp;
var curGenreIndex = 0;
var playlist_id = '';
var csv_path = 'client/src/playlist-by-genre.csv';

const urlParams = new URLSearchParams(document.location.search);

export default class SpotifyDivs extends Component {

    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
    }

    componentDidMount() {
        mainFunc();
    }
    
    render() {
        return(
        <div>
            <div id="test-div-1">
                <p id="test-p-1">Genres:</p>
            </div>
            <div id="test-div-2">
                <p id="test-p-2">Playlist ID:</p>
            </div>
            <div id="test-div-3">
                <p id="test-p-3">Songs for each genre:</p>
            </div>
        </div>
        )
    }

}

// SPOTIFY FUNCTIONALITY

function mainFunc() {  
    requestSongsNCycles() // first get all of the person's songs, and the genres of each
    .then(() => doMLStuff()) // taking all those genres into account, find the genres they are least likely to like
    .then(() => createPlaylist()) // create a blank playlist
    .then(() => addSongsToPlaylistAllGenres()); // for all of the person's least liked genres, add songs to the playlist
}

/*
function testFunc1NCycles() {
    return repeat(testFunc1, 5);
}

function testFunc2NCycles() {
    return repeat(testFunc2, 5);
}

function testFunc1() {
    return new Promise(function (resolve, reject) {
        console.log('testfunc1');
        resolve();
    });
}

function testFunc2() {
    return new Promise(function (resolve, reject) {
        console.log('testfunc2');
        resolve();
    });
}
*/

function repeat(func, times) {
    var promise = Promise.resolve();
    while (times-- > 0) {
        promise = promise.then(func);
        thisCycle++;
    }
    return promise;
}

function requestSongsNCycles() {
    return repeat(requestSongs, maxCycles);
}

function requestSongs() {
    return new Promise(function (resolve, reject) {
        console.log('got here 1');
        console.log(thisCycle);
        $.ajax({
            url: 'https://api.spotify.com/v1/me/tracks?limit=' + max + '&offset=' + max * thisCycle,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + reqheader
            },
            success: function(resultA) {
                special_value = resultA;
                var top100artists = [];
    
                for (var i = 0; i < max; i++) {
                    try {
                        top100artists.push(resultA.items[i].track.artists[0].id);
                    } catch {}
                }
    
                var top100artists_genres = new Array();
    
                for (var i = 0; i < top100artists.length; i++) {
                    function getAjax() {
                        return $.ajax({
                                url: 'https://api.spotify.com/v1/artists/' + top100artists[i],
                                type: 'GET',
                                headers: {
                                    'Authorization': 'Bearer ' + reqheader
                                },
                                success: function(resultB) { }
                        })
                    }
                    getAjax().done(function(response) {
                        counter++;
                        top100artists_genres += response.genres;
                        $('#test-p-1').after('<p>' + response.genres + '</p>');
                    });
                    getAjax().fail(function(error) {
                        top100artists_genres += 'null';
                        $('#test-p-1').after('<p>null</p>');
                    });
                }
                console.log(top100artists_genres.length);

                resolve();
            }
        });
    });
}

/*
function checkIfReady() {
    console.log('got here 2');
    var testdiv1 = document.getElementById('test-div-1');
    var testp2 = document.getElementById('test-p-2');

    if (requestSongs_done == false) {
        if (testdiv1.children.length >= max * thisCycle + 1) {
            thisCycle++;
            if (thisCycle < maxCycles) {
                requestSongs(max, thisCycle);
            } else {
                requestSongs_done = true;
                doMLStuff();
            }
        }
    } else if (generatePlaylist_done == true) {
        console.log('got here 2a');
        if (curGenreIndex < top10Genres.length) {
            clearInterval(intervalId);
            curGenreIndex++;
            addSongsToPlaylist(playlist_id, top10Genres[curGenreIndex - 1]);
        }
    }
    
}
*/

function doMLStuff() {
    return new Promise(function (resolve, reject) {
        console.log('got here 3');
        alert(counter);
        var testdiv1 = document.getElementById('test-div-1');
        var testp2 = document.getElementById('test-p-2');

        var genreCounts = new Object();
        if (testdiv1.children.length >= max + 1) {
            var testDiv1Children = testdiv1.children;
            for (var i = 1; i < testDiv1Children.length; i++) {
                var str = testDiv1Children[i].innerText;
                try {
                    var thisDivGenres = str.split(',');
                    for (var j = 0; j < thisDivGenres.length; j++) {
                        if (genreCounts[thisDivGenres[j]] == null) {
                            genreCounts[thisDivGenres[j]] = 1;
                        }
                        else {
                            genreCounts[thisDivGenres[j]]++;
                        }
                    }
                } catch { }
            }
        }

        var dictString = '';
        var genreCountsKeys = Object.keys(genreCounts);
        function sortByCount(array) {
            return array.sort(function(a, b) {
                var x = genreCounts[a];
                var y = genreCounts[b];
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            });
        }
        sortByCount(genreCountsKeys);

        for (var i = 0; i < genreCountsKeys.length; i++) {
            dictString += genreCountsKeys[i] + ': ' + genreCounts[genreCountsKeys[i]] + '\n';
        }
        // console.log(dictString);
        console.log('got here 3a');
        // console.log(genreCountsKeys.length);

        /*
        generate playlist based on top 10 genres: take the 10 lowest predicted genres based on the top 10 that
        are within the algorithm, and for each one, pull 5 random songs from the radio playlist for that genre
        */
        //allowedGenres: just set as a placeholder for now
        var allowedGenres = ['pop', 'rock', 'country', 'dance pop', 'indie rock', 'alternative rock', 'permanent wave',
        'alternative metal', 'new rave', 'punk', 'indie soul', 'indie poptimism', 'nu metal', 'emo', 'indietronica',
        'indie soul', 'urban contemporary', 'pop rap', 'classic rock', 'trance', 'soft rock', 'experimental hip hop',
        'post-grunge', 'boy band'];

        var i = 0;
        var genresMatched = 0;
        for (var i = 0; i < genreCountsKeys.length; i++) {
            if (genresMatched < 10) {
                if (allowedGenres.includes(genreCountsKeys[i])) {
                    console.log(genreCountsKeys[i]);
                    top10Genres.push(genreCountsKeys[i]);
                    genresMatched++;
                    /*
                    try {
                        console.log(genreCountsKeys[i]);
                        top10Genres.push(genreCountsKeys[i]);
                        genresMatched++;
                    }
                    catch {

                    }
                    */
                }
            }
        }
        console.log(top10Genres);
        // coati: just for testing
        top10Genres_opp = [
            'rock', 'permanent wave', 'emo', 'alternative rock', 'indie rock', 'punk', 'indietronica', 'experimental hip hop',
            'new rave', 'soft rock'
        ];
        console.log(top10Genres_opp);
        console.log(top10Genres_opp.length);
        // top10Genres_opp = getLeastLikedGenres(top10Genres);
        createPlaylist(top10Genres_opp);

        testp2.innerText = dictString;
        resolve();
    });
    
}

function createPlaylist() {
    return new Promise(function (resolve, reject) {
        console.log('got here 4');

        function getAjax() {
            return $.ajax({
                    url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
                    type: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + reqheader2
                    },
                    data: JSON.stringify({
                        'name': 'Worst Songs ' + Math.floor(Math.random() * 1000000).toString(),
                        'description': 'Just try them!',
                        'public': false
                    }),
                    dataType: 'json',
                    success: function(resultA) {
                        console.log('got here 4a');
                        // generatePlaylist_done = true;
                    },
                    error: function(err) {
                        alert(user_id + '..........');
                        alert(JSON.stringify(err));
                    }
            });
        }
        getAjax().done(function(response) {
            playlist_id = response.id;
            console.log('got here 4b');
            console.log(playlist_id);
            resolve();
        });
        getAjax().fail(function(err) {
            alert(JSON.stringify(err));
        });
    });
}

function addSongsToPlaylistAllGenres() {
    console.log('got here 4.5');
    return repeat(addSongsToPlaylistOneGenre, top10Genres_opp.length);
}

function addSongsToPlaylistOneGenre() {
    return new Promise(function (resolve, reject) {
        console.log('got here 5');
        curGenreIndex++;
        var curGenre = top10Genres_opp[curGenreIndex];
        var songsThisGenre = getSongsOneGenre(curGenre);
        $.ajax({
            url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + reqheader2
            },
            data: JSON.stringify({
                //'uris': ['spotify:track:7g3jW7rQ81Ddoqu5vxvqYi']
                'uris': songsThisGenre
            }),
            dataType: 'json',
            success: function(resultA) {
                // console.log(JSON.stringify(resultA));
                resolve();
                // generatePlaylist_done = true;
            },
            error: function(err) {
                alert(JSON.stringify(err));
            }
        });
    });
}

function getSongsOneGenre(_genre) {
    console.log('got here 6');
    //coati: return songs from playlist of each genre instead

    try {
        switch (_genre) {
            case 'alternative rock':
                return ['spotify:track:0KEhlgtlk0HuqBIqfGCGdF'];
            case 'experimental hip hop':
                return ['spotify:track:4pSbdUWj7FrZRjgxQOISIL'];
            case 'indie poptimism':
                return ['spotify:track:3FpEXAupLwCHwzeUBxF99S'];
            case 'indie rock':
                return ['spotify:track:19Ov4l8mtvCT1iEUKks4aM'];
            case 'indie soul':
                return ['spotify:track:7kC97zPE0PxrcItXyGdk8P'];
            case 'indietronica':
                return ['spotify:track:3VhBuvzzuGUuh7nyJJvGLk'];
            case 'new rave':
                return ['spotify:track:048AQ5XBnvStuTn7X2pGSY'];
            case 'nu metal':
                return ['spotify:track:7mQwxVogsnpR3h6AJLQLlR'];
            case 'permanent wave':
                return ['spotify:track:7oK3Hn5fli8uCS1eiD3lBS'];
            case 'pop':
                return ['spotify:track:7xbWAw3LMgRMn4omR5yVn3'];
            case 'punk':
                return ['spotify:track:64yrDBpcdwEdNY9loyEGbX'];
            case 'rock':
                return ['spotify:track:0qjfjKFoP7LaqLI2KI9M1Q'];
            case 'soft rock':
                return ['spotify:track:07E5tOPjL9R54pkeOPTLo1'];
            default:
                return ['spotify:track:1nedyHXLtbomGOaa7BOwYl'];
        }
    }
    catch {
        console.log('Retrieving songs failed');
        return ['spotify:track:1nedyHXLtbomGOaa7BOwYl'];
    }
}

function getLeastLikedGenres(_top10Genres) {
    console.log('got here 7');

    //TODO: actually retrieve most anticorrelated genres from ML, this is just a placeholder
    //TODO: store the playlist for each genre in a CSV and access that so you don't have to alter the code
    var leastLikedGenres = [];
    var leastLikedGenresDict = {
        'pop': 'black metal',
        'punk': 'free jazz',
        'indie soul': 'bollywood',
        'indie poptimism': 'country road',
        'nu metal': 'soul'
    }
    for (var i = 0; i < _top10Genres.length; i++) {
        if (leastLikedGenresDict[_top10Genres[i]] != null) {
            leastLikedGenres += leastLikedGenresDict[_top10Genres[i]];
        }
    }
    return leastLikedGenres;
}