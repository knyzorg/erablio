// @flow

const db = require("../util/db");
const secure = require("../util/secure");
const express = require("express")
const app = express.Router();

app.get("/add/:modid", secure.loggedIn, (req:express$Request, res:express$Response) => {
    console.log(req.user.username)
    db.addUserModule(req.user.username, req.params.modid)
        .then(() => res.send(200))
})

app.get("/remove/:modid", secure.loggedIn, (req:express$Request, res:express$Response) => {
    db.removeUserModule(req.user.username, req.params.modid)
        .then(() => res.send(200))
})

app.get("/", secure.loggedIn, (req:express$Request, res:express$Response) => {
    let renderModules = [];
    Promise.all([db.getAllModules(), db.getUserModules(req.user.username)])
        .then((values) => {
            let allModules = values[0];
            const userModules = values[1];
            const enabled = userModules.map((module) => {
                return module.id;
            })
            allModules.forEach((module) => {
                module.enabled = enabled.indexOf(module.id) !== -1;
            })

            res.render("modules", { modules: allModules })
        })
})

module.exports = app;