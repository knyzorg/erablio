var express = require('express');
var fs = require('fs')
var Crypto = require('crypto')
var app = express();
var request = require('request');
var passport = require('passport');

var dblite = require('dblite');
var db = dblite("../data.sqlite");

app.use(require('body-parser').urlencoded({
    extended: true
}));
app.use(require('express-session')({
    secret: 'correct battery horse staple',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


function newToken() {
    return Crypto.randomBytes(8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}




passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function login(username, password, callback) {
    //  Broke down url into chunks to find in editor properly
    //  Url is made out of chunks I don't even care to understand but it allows
    //  a login and that's what I care for.
    //  This function got a number of issues with it, most notable is that
    //  it depends on a rather... unrealiable service. Secondly, user accounts
    //  get locked after too many password attemps.
    //  Let's just hope it doesn't break in production!

    var login = "https://portail.csdraveurs.qc.ca/Anonym/Login.aspx?" +
        "lnrid=636091206172586869&_lnPageGuid=869878df-59f3-43c9-a5e3-5c54" +
        "a05e24ef&__EGClientState=&__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=" +
        "&__EVENTVALIDATION=%2FwEWCAL%2BraDpAgKN1azYCQLr3en9AwLXgqWzDwLMwY" +
        "L7CQLvtfAUArqPkNEEApvk0uoCCFdFmooPyvnZcMHRMqny4KXERvg%3D&ctlUserCode=" +
        username + "&ctlUserPassword=" + password + "&ctlLogon=Connexion";

    console.log("Logging in for", username, password);
    request(login, function(error, response, body) {
        if (!error && response.statusCode == 200 && body.includes("Chargement en cours")) {
            callback(true);
            console.log("Logged in");
        } else {
            callback(false);
            console.log("Log in failed");
        }
    })
}

var quizfile = fs.readFileSync(__dirname + "/quiz.html");

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html")
});
app.get('/index.html', function(req, res) {
    res.sendFile(__dirname + "/index.html")
});
app.get('/about.html', function(req, res) {
    res.sendFile(__dirname + "/about.html")
});
app.get('/js/:file', function(req, res) {
    res.sendFile(__dirname + "/js/" + req.params.file);
});
app.get('/css/:file', function(req, res) {
    res.sendFile(__dirname + "/css/" + req.params.file);
});

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        login(username, password, function(status) {
            if (status) {
                //Logged in
                return done(null, {
                    username: username.toLowerCase()
                });
            } else {
                //Failed to login
                return done(null, false);
            }
        });
    }
));

var auth = function(req, res, next) {
    console.log(req.url);
    if (!req.user) {
        req.session.returnTo = req.url;
        res.sendFile(__dirname + "/login.html");
    } else {
        next();
    }

};


app.get('/:quiz/answer.html', auth, function(req, res) {
    if (!req.query.q || !req.query.a) {
        res.sendFile(__dirname + "/index.html");
    }
    fs.readFile(__dirname + "/questions/" + req.params.quiz + "/" + req.query.q + ".json", function(err, data) {
        if (!err) {
            qdata = JSON.parse(data);
            if (qdata.answer != req.query.a) {
                //Wrong answer
                res.send(`
                <!doctype html>
                <html lang="en" class="no-js">
                <head>
                	<meta charset="UTF-8">
                	<meta name="viewport" content="width=device-width, initial-scale=1">

                	<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css'>

                	<link rel="stylesheet" href="/css/reset.css"> <!-- CSS reset -->
                	<link rel="stylesheet" href="/css/style.css"> <!-- Resource style -->
                	<script src="/js/modernizr.js"></script> <!-- Modernizr -->

                	<title>Étudie ÇA!</title>
                </head>
                <body class="cd-about">
                	<main>
                		<div class="cd-about cd-main-content">
                        <a href="/logout.html" data-type="page-transition"><button class="cd-btn" style="position: absolute; top: 10px; right: 5px;">X</button></a>
                        <a href="/quiz.html" data-type="page-transition"><button class="cd-btn" style="position: absolute; top: 10px; left: 5px;">&larr;</button></a>
                			<div>

                				<h1 style="color:red">Mauvaise Reponse!</h1>

                				<h2>La bonne reponse etait: <span>${qdata.options[+qdata.answer]}</span></h2>
                				<p>
                					${qdata.wrong}
                				</p>
                					<a class="cd-btn" href="quiz.html" data-type="page-transition">Continuer &#8594;</a>
                			</div>
                		</div>
                	</main>
                	<div class="cd-cover-layer"></div>
                	<div class="cd-loading-bar"></div>
                <script src="/js/jquery-2.1.1.js"></script>
                <script src="/js/main.js"></script> <!-- Resource jQuery -->
                </body>
                </html>
                `.toString());
            } else {
                //Right answer
                res.send(`
                <!doctype html>
                <html lang="en" class="no-js">
                <head>
                	<meta charset="UTF-8">
                	<meta name="viewport" content="width=device-width, initial-scale=1">

                	<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css'>

                	<link rel="stylesheet" href="/css/reset.css"> <!-- CSS reset -->
                	<link rel="stylesheet" href="/css/style.css"> <!-- Resource style -->
                	<script src="/js/modernizr.js"></script> <!-- Modernizr -->

                	<title>Étudie ÇA!</title>
                </head>
                <body class="cd-about">
                	<main>
                		<div class="cd-about cd-main-content">
                        <a href="/logout.html" data-type="page-transition"><button class="cd-btn" style="position: absolute; top: 10px; right: 5px;">X</button></a>
                        <a href="/quiz.html" data-type="page-transition"><button class="cd-btn" style="position: absolute; top: 10px; left: 5px;">&larr;</button></a>
                			<div>

                				<h1 style="color:green">Bonne Reponse!</h1>

                				<h2>Vous avez correctement dit: <span>${qdata.options[+qdata.answer]}</span></h2>
                				<p>
                					${qdata.right}
                				</p>
                					<a class="cd-btn" href="quiz.html" data-type="page-transition">Continuer &#8594;</a>
                			</div>
                		</div>
                	</main>
                	<div class="cd-cover-layer"></div>
                	<div class="cd-loading-bar"></div>
                <script src="/js/jquery-2.1.1.js"></script>
                <script src="/js/main.js"></script> <!-- Resource jQuery -->
                </body>
                </html>
                `.toString());
            }
        }

    })
});
app.get('/quiz.html', auth, function(req, res) {
    res.sendFile(__dirname + "/choose.html");
});
app.get('/:quiz/quiz.html', auth, function(req, res) {
    //Question endpoint
    fs.readdir(__dirname + "/questions/" + req.params.quiz, function(err, files) {
        if (err) {
            res.send("404");
            return;
        };
        var index = randomInt(0, files.length - 1);

        console.log(index);

        var filename = files[index];
        fs.readFile(__dirname + "/questions/" + req.params.quiz + "/" + filename, function(err, data) {
            qdata = JSON.parse(data);


            var element = `<div>
                <form method="POST" action="/science" style="display:none;">
                    <input type="text" id="qid" name="qid" value="${index}">
                    <input type="text" id="timestart" name="timestart" value="${Date.now()}">
                    <input type="text" id="key" name="key" value="${newToken()}">
                    <input type="text" id="alttab" name="alttab" value="0">
                    <input type="text" id="answer" name="answer" value="0">

                    <input type="text" id="quiz" name="quiz" value="${req.params.quiz}">
                </form>
                <h2 style="font-weight: 400; color: #ccc; padding-bottom: 3em;">Question</h2>
                <h1 style=" padding-bottom: 1em;">${qdata.question}</h1>
                <a class="cd-btn" href="answer.html" data-option="0" data-type="answer">${qdata.options[0]}</a>
                <a class="cd-btn" href="answer.html" data-option="1" data-type="answer">${qdata.options[1]}</a>
                <a class="cd-btn" href="answer.html" data-option="2" data-type="answer">${qdata.options[2]}</a>
                <a class="cd-btn" href="answer.html" data-option="3" data-type="answer">${qdata.options[3]}</a>
            </div>`;
            res.send(quizfile.toString().replace("{{{data}}}", element));
        });
    });
});

app.post('/science', auth, function(req, res) {
    //Result endpoint
    fs.readFile(__dirname + "/questions/" + req.body.quiz + "/" + req.body.qid + ".json", function(err, data) {
        if (err) {
            return 0
        }
        data = JSON.parse(data);
        var results = {
            qid: req.body.qid,
            time: +req.body.timestart,
            set: req.body.quiz,
            spent: +(Date.now() - req.body.timestart),
            user: req.user.username,
            alttab: +req.body.alttab,
            answer: +req.body.answer,
            pass: +(req.body.answer == data.answer),
            correct: data.answer,
            key: req.body.key,
            agent: req.headers['user-agent']
        };
        res.send("Data Submitted for Analysis");
        console.log(JSON.stringify(results));


        //Implement sqlite logger
        // node dblite.test.js
        db.query('INSERT INTO quiz VALUES (:qid, :time, :set, :spent, :user, :alttab, :answer, :pass, :correct, :key, :agent)', results);
    })

});


app.get("/login.html", function(req, res) {
    res.sendFile(__dirname + "/login.html");
});
app.get("/logout.html", function(req, res) {
    req.logout();
    req.session.destroy();
    res.sendFile(__dirname + "/login.html");
});

app.post("/login.html", passport.authenticate('local', {
    failureRedirect: '/login.html'
}), function(req, res) {
    res.redirect(req.session.returnTo || '/');
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log('App ready!');
        console.log('Listening on *:' + PORT);
});
