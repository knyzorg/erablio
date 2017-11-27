const express = require("express");
const app = express.Router();

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));

module.exports = app;