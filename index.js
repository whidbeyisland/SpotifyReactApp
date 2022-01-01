const express = require('express');
const {spawn} = require('child_process');
const axios = require('axios');
const app = express();
const port = 3000;

axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
  .then(response => {
    console.log(response.data.url);
    console.log(response.data.explanation);
  })
  .catch(error => {
    console.log(error);
});

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