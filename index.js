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
var reqheader = 'BQB_7E3QWeFDMD-yHBVFc-thetKn-Fic_dkI2ZcpW4D1CHjUULDuGUw8M6S44ncbKQ_27HRvJ8oJyACXsGou3i_DUNtDXc8jf3rohXKhR49Kabl9-cbbWOWXsXF6Q-eFmbFlQ2tIYxSVbQO-FxcqYm9Bw4Yyg6cuWS9L9AyQEkhHzjpWLqFYzYA9PUaWn2EIAbkLXzWdiN1Hn47uzfzljWx974rqiiloOkMTDE-PV_qvt9Ecnljs3ow0';
var reqheader2 = 'BQCduhrtssqnnek6s0l1dTpZwajGA3Jwz3hwK7jNV3yK_XTJVJn1YAUSWllBlle_xI43gKOXz_mmFckpIGJnG1EYjrP0n4qhO75ItMOG6LC1l8xR2UEhGI_FkBhFshHhSFuZIySip-FmBZdALo2P72uvMXKMgp1zq_D_ZjkzXkGGHDgfh_83EbDIHzIMFoQ4D77KCmuH1_yicNnH0bQj3y0B9UOa2x8x_grITS2CeeBh8R0BdLLrXOeo';
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

//intervalId = window.setInterval(checkIfReady, 1000);

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
    //window.setInterval(checkIfReady, 1000);
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