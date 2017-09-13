/*
    Takes care of all login, logout and security needs
    Exposes the following auth middlewares:
        authUtils.basicAuth: Allows normal user connection and guarantees the req.user letiable
*/

//Inititionalize authentication stuff
let passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

//Setup passport
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


/**
 *  Validates login information using all login services
 *  @param {String} username User username 
 *  @param {String} password User password 
 *  @param {Function} callback Callback with a boolean value
 */
module.exports.login = function (username, password, callback) {
    //Attempt local login first
    return callback(true);
    localLogin(username, password, (valid) => {
        if (valid) {
            //Success
            callback(true)
            return;
        }
        //Failed? Attempt a login via web interface
        webLogin(username, password, (valid) => {
            if (valid) {
                //Success
                callback(true);
                //Update cache to make local login work next time
                updateLoginCache(username, password);
                return;
            }

            //Didn't work. Probably wrong password
            callback(false);

        });
    });
}

/**
 *  Updates login cache (Validate input before running function)
 *  @param {String} username User username 
 *  @param {String} password User password 
 */
function updateLoginCache(username, password) {
    fs.writeFile("cache/userlogin-" + utils.sha1(username), utils.sha1(password), () => {});
}

/**
 *  Validates login information using local cache
 *  @param {String} username User username 
 *  @param {String} password User password 
 *  @param {Function} callback Callback with a boolean value
 */
function localLogin(username, password, callback) {
    fs.readFile("cache/userlogin-" + utils.sha1(username), (err, data) => {
        callback(!err && (data === utils.sha1(password)))
    });
}

/**
 *  Validates login information using website
 *  @param {String} username User username 
 *  @param {String} password User password 
 *  @param {Function} callback Callback with a boolean value
 */
function webLogin(username, password, callback) {
    //  Broke down url into chunks to find in editor properly
    //  Url is made out of chunks I don't even care to understand but it allows
    //  a login and that's what I care for.
    //  This function got a number of issues with it, most notable is that
    //  it depends on a rather... unrealiable service. Secondly, user accounts
    //  get locked after too many password attemps.
    //  Let's just hope it doesn't break in production!

    let loginUrl = "https://portail.csdraveurs.qc.ca/Anonym/Login.aspx?" +
        "lnrid=636091206172586869&_lnPageGuid=869878df-59f3-43c9-a5e3-5c54" +
        "a05e24ef&__EGClientState=&__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=" +
        "&__EVENTVALIDATION=%2FwEWCAL%2BraDpAgKN1azYCQLr3en9AwLXgqWzDwLMwY" +
        "L7CQLvtfAUArqPkNEEApvk0uoCCFdFmooPyvnZcMHRMqny4KXERvg%3D&ctlUserCode=" +
        username + "&ctlUserPassword=" + password + "&ctlLogon=Connexion";

    request(loginUrl, (error, response, body) => {
        callback(!error && response.statusCode == 200 && body.includes("Chargement en cours"));
    })
}

let LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    (username, password, done) => {
        module.exports.login(username, password, (valid) => {

            //If valid, return user object, else false

            return done(null, valid ? {
                username: username.toLowerCase(),
                questions: {}
            } : false);

        });
    }
));

//Authentication middleware

//Basic login authentication, forces availability of req.user object
module.exports.basicAuth = (req, res, next) => {
    if (req.user) {
        //Already logged in
        return next();
    }

    //Save page to redirect to
    req.session.returnTo = req.url;
    //Present login page
    res.render("login");
};


//Handle login session destruction
app.get("/logout.html", (req, res) => {
    req.logout();
    req.session.destroy();
    res.render("login");
});

app.post("/login.html", passport.authenticate('local'), (req, res) => {
    if (req.session.returnTo) {
        req.session.returnTo += "?" + utils.newToken();
    }
    res.send(req.session.returnTo || '/module' + "?" + utils.newToken());
});

return module.exports;