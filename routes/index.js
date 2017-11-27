const express = require("express");
const app = express.Router();

app.get('/', (req, res) => {
    res.render("index");
});

app.get("/home", (req, res) => {
    res.render("index");
});

app.get("/about", (req, res) => {
    res.render("about");
});
app.get("/news", (req, res) => {
    res.render("news");
});

module.exports = app;