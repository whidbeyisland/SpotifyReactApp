const express = require('express');
const {spawn} = require('child_process');
const axios = require('axios');
const app = express();
const port = 3000;

// AXIOS JUST FOR REFERENCE
/*
axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
  .then(response => {
    console.log(response.data.url);
    console.log(response.data.explanation);
  })
  .catch(error => {
    console.log(error);
});
*/








// SPOTIFY STUFF STARTS HERE

// alert('hello world!')
// $("button").on("click", function(){
//   alert('hi!')
// });
var counter = 0;
var max = 50;
var maxCycles = 5;
var thisCycle = 0;
var reqheader = 'BQBVQui1E9uVDa5dMLBMh9IhsA84TJ9hjZ7gO4Uzu9EKYc2gKwrHLOI_8a6AHto5FztCFLAlEwGUuIuHVvNOgBPMq4axnf_rJ2JyPp9TUnB4gS-RUU1fV3h8jlo9OmzSG3dHP-a3XHKHhZTpIDao9Q_TkrM9N3UTJ0iwwmK76DhbEqNU3UN19YuTuqvyYBidRYkInudYlWhx6LYD_BdGPMYJZ3GLEwpwOHaZ3vBrBwMcBAmeOYAM_icr';
var reqheader2 = 'BQDrS6GOsJHMeqJgJ3KAwMBBMixGDDHb3ey_XBTjudqqP_z-p_oRmgG1TuuaHhXbWRTmfm0MMnS_bXFegymCaB2XflkjZkB5_A3hHsAXH4MfTjoqQU1kHRl1D_tG_Z9fzcViHsm90UWiXtK13Urex_SYF4XCR_jH-W5O6d1eWNW6qXHA5v18sz3Oq9EoJ6r4xvHJszyTKp0U_VRq4kzArj2hk6WE_aWsu7EGE2F4e1QfE8rJzC5M2mKP';
var special_value;
var intervalId;
var requestSongs_done = false;
var generatePlaylist_done = false;
var top10Genres;
var curGenreIndex = 0;
var playlist_id = '';

const urlParams = new URLSearchParams(document.location.search);
const user_id = urlParams.get('userid');
const fs = require('fs');

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

requestSongs(50, 0);

function requestSongs(_max, _thisCycle) {
    window.setInterval(checkIfReady, 1000);
    url_reqsongs = 'https://api.spotify.com/v1/me/tracks?limit=' + _max + '&offset=' + _max * _thisCycle
    axios.get(url_reqsongs, {
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

            // coati: here, finish translating this AJAX into Axios
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
    })
    .catch(error => {
        console.log(error);
    });
    /*
    .then(response => {
        console.log(response.data.url);
        console.log(response.data.explanation);
    })
    .catch(error => {
        console.log(error);
    });*/
};




























app.get('/', (req, res) => {
    var largeDataSet = [];
    // spawn new child process to call the python script
    const python = spawn('python', [
        'python_pytorch.py',
        '--genres-liked',
        '010001000010' // coati: mocked data for now, this should be pulled from functions in React app
        // 1 = user likes that genre according to scouring of library
    ]);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        largeDataSet.push(data);
    });
    // in close event we are sure that stream is from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(largeDataSet.join(""))
    });
})

app.listen(port, () => console.log(`Example app listening on port
${port}!`));