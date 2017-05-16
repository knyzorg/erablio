//Import dependencies

//Most dependencies are declared globally to avoid code-duplication

//ExpressJS router app
global.express = require('express');
global.app = express();

//Same as fs but better
global.fs = require('fs-extra');

//A few utility functions
global.utils = require("./util/utils");

//Database setup
global.dblite = require('dblite');
global.db = dblite("../data.sqlite");

//For webrequests
global.request = require('request');

//__dirname is different for modules, required overriding
global.appRoot = __dirname;

//Setup ExpressJS
app.use(require('body-parser').urlencoded({
    extended: true
}));

//Setup random encryption token
let tmpSecret = utils.newToken();

app.use(require('express-session')({
    secret: tmpSecret,
    resave: true,
    saveUninitialized: true
}));

app.use(require("cookie-parser")(tmpSecret));

//Block all caching
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

//Use Pug rendering engine
app.set('view engine', 'pug');

//Import routes
//Secure file carries routes as well as a few middlewares which guarantees the existance of req.user letiable
global.authUtils = require("./util/secure");

//Just routing.. refer to files in the routes directory
require('require-dir')("./routes");

//Handle errors
// Handle 404
app.use((req, res) => {
    if (!req.xhr) res.status(404);
    res.render("error", {
        code: 404,
        message: "Il semble que cette page n'existe pas!"
    })
});

// Handle 500
app.use((error, req, res, next) => {
    if (!req.xhr) res.status(500);
    res.render("error", {
        code: 500,
        message: JSON.stringify(error)
    })
});

//Launch application
let PORT = process.env.PORT || 3000;
let server = app.listen(PORT, () => console.log('Listening on *:' + PORT));
