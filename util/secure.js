// @flow

/*
    Takes care of all login, logout and security needs
    Exposes the following auth middlewares:
        authUtils.basicAuth: Allows normal user connection and guarantees the req.user letiable
*/
const passport = require("passport");
const db = require("../util/db");
let LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    (username, password, done) => {
        //If valid, return user object, else false
        db.validateLogin(username, password).then((valid) => done(null, valid ? {
            username: username,
            questions: {}
        } : false))
    }
));

//Authentication middleware

//Basic login authentication, forces availability of req.user object
function loggedIn (req:express$Request, res:express$Response, next:express$NextFunction):void {
    if (req.user) {
        //Already logged in
        next();
        return;
    }

    //Save page to redirect to
    req.session.returnTo = req.url;
    //Present login page
    res.render("login");
};

function logOut (req:express$Request, res:express$Response, next:express$NextFunction):void {
    req.logout();
    req.session.destroy();
    next();
}

const logIn = passport.authenticate('local');

module.exports = {
    loggedIn,
    logIn,
    logOut
};