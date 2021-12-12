import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import $ from 'jquery';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// SPOTIFY STUFF STARTS HERE

// alert('hello world!')
// $("button").on("click", function(){
//   alert('hi!')
// });
var counter = 0;
var max = 50;
var maxCycles = 5;
var thisCycle = 0;
var reqheader = 'BQDfkWJ1Li7q1VC_Z9oSbpHe2DcKp4SBbOsoEZk7Te7lyL31qHeXwYmkDDUYBxIAqNDuRep8-fWAvQoiBPbgazRWMLBBU7RkTGoIYzXfpneGuCxLwoJ0sau6DUj_jtlWWUL1X_0TQVbW3b4h8NQckDZv6IetEI0iWJnMtPocusMJp42bmHkk_7YHWBvzfl275CKd2ddfS1VIt-8erkkdy56g93VWQ87iA9OjYQ70djUXs33_8Dwt73gx';
var reqheader2 = 'BQDTGbam_tPDl1aRSpb3V2qSxDV5X4sxUigsFn2Rb3rzewE5X5j0lcXoiwmjQu1TWga5C3DNxO6OUik2l1kyUH-PfApoLbzupfjkY8Wjk81cFh3KPCRoXZAuerPeq-hLxK-LTIIYDxK135GunPoCeqNVN12FGqbcgJ-RDJRDfRWliRY5oZEfwfrPDVsjGzHRbVN8ZiwShlqSaFgpxIMA-pPttNUK839eCm7blOXhXGka2-jS-QIWRVYe';
var special_value;
var intervalId;
var requestSongs_done = false;
var generatePlaylist_done = false;
var top10Genres;
var curGenreIndex = 0;
var playlist_id = '';

const urlParams = new URLSearchParams(document.location.search);
const user_id = urlParams.get('userid');

intervalId = window.setInterval(checkIfReady, 1000);

/*
top10Genres = ['pop', 'punk', 'indie soul', 'indie poptimism', 'nu metal'];
for (var i = 0; i < top10Genres.length; i++) {
    addSongsToPlaylist('1gtte2hJH9eSuVtwYerurB', top10Genres[i]);
}
*/

//test_playlist_id = '1gtte2hJH9eSuVtwYerurB';
//$(document).ready(addSongsToPlaylist(test_playlist_id, 'punk'));
//$(document).ready(createPlaylist(top10genres));
//$(document).ready(requestSongs(50, thisCycle));

function requestSongs(_max, _thisCycle) {
    //window.setInterval(checkIfReady, 1000);
    $.ajax({
        url: 'https://api.spotify.com/v1/me/tracks?limit=' + _max + '&offset=' + _max * _thisCycle,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + reqheader
        },
        success: function(resultA) {
            special_value = resultA;
            var top100artists = [];

            for (var i = 0; i < _max; i++) {
                try {
                    top100artists.push(resultA.items[i].track.artists[0].id);
                } catch {}
            }

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
                    $('#test-p-1').after('<p>' + response.genres + '</p>');
                });
                getAjax().fail(function(error) {
                    $('#test-p-1').after('<p>null</p>');
                });
            }
        }
    });
};

function checkIfReady() {
    var testdiv1 = document.getElementById('test-div-1');
    var testp2 = document.getElementById('test-p-2');

    if (requestSongs_done == false) {
        if (testdiv1.children.length >= max * thisCycle + 1) {
            thisCycle++;
            if (thisCycle < maxCycles) {
                requestSongs(max, thisCycle);
            } else {
                doMLStuff();
            }
        }
    } /*else if (generatePlaylist_done == true) {
        if (curGenreIndex < top10Genres.length) {
            clearInterval(intervalId);
            curGenreIndex++;
            addSongsToPlaylist(playlist_id, top10Genres[curGenreIndex - 1]);
        }
    }
    */
    
}

function testFunc() {
    alert('teeeeeeeeest');
}

function doMLStuff() {
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

    /*
    generate playlist based on top 10 genres: take the 10 lowest predicted genres based on the top 10 that
    are within the algorithm, and for each one, pull 5 random songs from the radio playlist for that genre
    */
    //allowedGenres: just set as a placeholder for now
    var allowedGenres = ['pop', 'rock', 'country', 'dance pop', 'indie rock', 'alternative rock', 'permanent wave',
    'alternative metal', 'new rave', 'punk', 'indie soul', 'indie poptimism', 'nu metal', 'emo', 'indietronica',
    'indie soul', 'urban contemporary', 'pop rap', 'classic rock', 'trance', 'soft rock', 'indie soul'];
    var _top10Genres = [];
    var i = 0;
    var genresMatched = 0;
    while (genresMatched < 10) {
        try {
            if (allowedGenres.includes(genreCountsKeys[i])) {
                top10Genres.push(genreCountsKeys[i]);
                genresMatched++;
            }
            i++;
        } catch { }
    }
    alert(_top10Genres);
    top10Genres = _top10Genres;
    //createPlaylist(_top10Genres);
    
    testp2.innerText = dictString;
}

function createPlaylist(_top10Genres) {
    //TODO: get ID of playlist once it's created so you can POST songs to it

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
                    generatePlaylist_done = true;
                },
                error: function(err) {
                    alert(user_id + '..........');
                    alert(JSON.stringify(err));
                }
        });
    }
    getAjax().done(function(response) {
        playlist_id = response.id;
        $('#test-p-2').after('<p>' + response.id + '</p>');
    });
    getAjax().fail(function(error) {
        $('#test-p-2').after('<p>null</p>');
    });
    
};

function addSongsToPlaylist(_playlist_id, _genre) {
    var songsThisGenre = getSongsOneGenre(_genre);
    $.ajax({
        url: 'https://api.spotify.com/v1/playlists/' + _playlist_id + '/tracks',
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
            alert(JSON.stringify(resultA));
            console.log(JSON.stringify(resultA));
            generatePlaylist_done = true;
        },
        error: function(err) {
            alert(user_id + '..........');
            alert(JSON.stringify(err));
        }
    });
}

function getSongsOneGenre(_genre) {
    //TODO: return songs from playlist of each genre instead
    switch (_genre) {
        case 'pop':
            return ['spotify:track:7xbWAw3LMgRMn4omR5yVn3'];
        case 'punk':
            return ['spotify:track:64yrDBpcdwEdNY9loyEGbX'];
        case 'indie soul':
            return ['spotify:track:7kC97zPE0PxrcItXyGdk8P'];
        case 'indie poptimism':
            return ['spotify:track:3FpEXAupLwCHwzeUBxF99S'];
        case 'nu metal':
            return ['spotify:track:7mQwxVogsnpR3h6AJLQLlR'];
        default:
            return ['spotify:track:1nedyHXLtbomGOaa7BOwYl'];
    }
}

function getLeastLikedGenres(_top10Genres) {
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