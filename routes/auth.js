// @flow

const secure = require("../util/secure");
const express = require("express")
const app = express.Router();
const utils = require("../util/utils")

app.get("/logout", secure.logOut, (req:express$Request, res:express$Response) => {
    res.render("login");
});

app.post("/login", secure.logIn, (req:express$Request, res:express$Response) => {
    if (req.session.returnTo) {
        req.session.returnTo += "?" + utils.newToken();
    }
    res.send(req.session.returnTo || '/module' + "?" + utils.newToken());
});

app.get("/login", (req:express$Request, res:express$Response) => {
    res.render("login");
});
module.exports = app;