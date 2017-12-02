const express = require("express");
const app = express.Router();

app.use('/css', express.static('public/css'));
app.use('/img', express.static('public/img'));
app.use('/js', express.static('public/js'));

module.exports = app;