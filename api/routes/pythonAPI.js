var express = require("express");
var router = express.Router();
const {spawn} = require('child_process');





var dataToSend;
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
    dataToSend = data.toString();
});

router.get("", function(req, res, next) {
    res.send(dataToSend);
    //res.send("API is working properly");
});

module.exports = router;