//Import dependencies

//Most dependencies are declared globally to avoid code-duplication

//ExpressJS router app
global.express = require('express');
global.app = express();

//Same as fs but better
global.fs = require('fs-extra')

//For interaction with CLI
global.sys = require('sys')
global.exec = require('child_process').exec;

//A few utility functions
global.utils = require("./local_modules/utils")

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
app.use(require('express-session')({
    secret: 'correct battery house staple',
    resave: true,
    saveUninitialized: true
}));

app.use(require("cookie-parser")('correct battery house staple'));
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
})

//Import routes
//Secure file carries routes as well as a few middlewares which guarantees the existance of req.user variable
global.authUtils = require("./local_modules/secure")

//Just routing.. refer to appropriate file
require("./local_modules/static")
require("./local_modules/generator")
require("./local_modules/quiz")
require("./local_modules/science")

//Launch application
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function () {
    console.log('App ready!');
    console.log('Listening on *:' + PORT);
});
