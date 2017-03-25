//Import dependencies
global.express = require('express');
global.fs = require('fs-extra')
global.app = express();
global.sys = require('sys')
global.exec = require('child_process').exec;
global.utils = require("./local_modules/utils")
global.dblite = require('dblite');
global.db = dblite("../data.sqlite");
global.request = require('request');
global.appRoot = __dirname;

console.log(__dirname);

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
global.authUtils = require("./local_modules/secure")
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
