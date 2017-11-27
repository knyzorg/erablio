//Import dependencies
const passport = require('passport');
//ExpressJS router app
const express = require('express');
const app = express();

//A few utility functions
const utils = require("./util/utils");


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

app.use(passport.initialize());
app.use(passport.session());
//Setup passport
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

//Block all caching
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

//Use Pug rendering engine
app.set('view engine', 'pug');

// Routing
app.use("/", require("./routes/index"))
app.use("/", require("./routes/static"))
app.use("/auth", require("./routes/auth"))
app.use("/module", require("./routes/module"))

/*
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
});*/

//Launch application
let PORT = process.env.PORT || 3000;
let server = app.listen(PORT, () => console.log('Listening on *:' + PORT));
