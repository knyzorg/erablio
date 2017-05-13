/*
    Takes care of all login, logout and security needs
    Exposes 2 middlewares:
        authUtils.basicAuth: Allows normal user connection and guarantees the req.user letiable
        authUtils.adminAuth: Allows admin user connection and guarantees the req.user letiable
*/

//Inititionalize authentication stuff
let passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

//Setup passport
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


/**
 *  Validates login information using all login services
 *  @param {String} username User username 
 *  @param {String} password User password 
 *  @param {Function} callback Callback with a boolean value
 */
module.exports.login = function login(username, password, callback) {
    //Attempt local login first
    localLogin(username, password, function (valid) {
        if (valid) {
            //Success
            callback(true)
            return;
        }
        //Failed? Attempt a login via web interface
        webLogin(username, password, function (valid) {
            if (valid) {
                //Success
                callback(true);
                //Update cache to make local login work next time
                updateLoginCache(username, password);
            } else {
                //Didn't work. Probably wrong password
                callback(false);
            }
        });
    });
}

/**
 *  Updates login cache (Validate input before running function)
 *  @param {String} username User username 
 *  @param {String} password User password 
 */
function updateLoginCache(username, password) {
    fs.writeFile("cache/userlogin-" + utils.sha1(username), utils.sha1(password), () => { });
}

/**
 *  Validates login information using local cache
 *  @param {String} username User username 
 *  @param {String} password User password 
 *  @param {Function} callback Callback with a boolean value
 */
function localLogin(username, password, callback) {
    fs.readFile("cache/userlogin-" + utils.sha1(username), function (err, data) {
        if (err) {
            callback(false)
            return;
        }
        if (data == utils.sha1(password)) {
            callback(true)
            return;
        }
        callback(false)
        return;
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

    let login = "https://portail.csdraveurs.qc.ca/Anonym/Login.aspx?" +
        "lnrid=636091206172586869&_lnPageGuid=869878df-59f3-43c9-a5e3-5c54" +
        "a05e24ef&__EGClientState=&__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=" +
        "&__EVENTVALIDATION=%2FwEWCAL%2BraDpAgKN1azYCQLr3en9AwLXgqWzDwLMwY" +
        "L7CQLvtfAUArqPkNEEApvk0uoCCFdFmooPyvnZcMHRMqny4KXERvg%3D&ctlUserCode=" +
        username + "&ctlUserPassword=" + password + "&ctlLogon=Connexion";

    console.log("Logging in for", username, password);
    request(login, function (error, response, body) {
        if (!error && response.statusCode == 200 && body.includes("Chargement en cours")) {
            callback(true);
            console.log("Logged in");
        } else {
            callback(false);
            console.log("Log in failed");
        }
    })
}

let LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        module.exports.login(username, password, function (status) {
            if (status) {
                //Logged in
                return done(null, {
                    username: username.toLowerCase(),
                    questions: {}
                });
            } else {
                //Failed to login
                return done(null, false);
            }
        });
    }
));

//Authentication middleware

//Basic login authentication, forces availability of req.user object
module.exports.basicAuth = function (req, res, next) {
    if (!req.user) {
        //Save page to redirect to
        req.session.returnTo = req.url;
        //Present login page
        res.render("login");
    } else {
        //Already logged in
        next();
    }
};

//Login authentication with white-listing7
//TODO: Rewrite this after standardizing groups
module.exports.adminAuth = function (req, res, next) {
    let admins = ["vbellemare", "vknyazev"];
    if (!req.user || admins.indexOf(req.user.username) === -1) {
        console.log("User not admin");
        req.session.returnTo = req.url;
        res.render("login");
    } else {
        console.log("User is admin id:", req.user.username);
        next();
    }
};


//Handle login session destruction
app.get("/logout.html", function (req, res) {
    req.logout();
    req.session.destroy();
    res.render("login");
});

app.post("/login.html", passport.authenticate('local'), function (req, res) {
    if (req.session.returnTo) {
        req.session.returnTo += "?" + utils.newToken();
    }
    res.send(req.session.returnTo || '/module' + "?" + utils.newToken());
});

return module.exports;
//Authentication stuff end