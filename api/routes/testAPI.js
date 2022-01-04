var express = require("express");
var router = express.Router();
const {spawn} = require('child_process');

router.get("/", function(req, res, next) {
    res.send("API is working properly");
});

module.exports = router;