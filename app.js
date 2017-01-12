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
    secret: 'correct battery house staple',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


function newToken() {
    return Crypto.randomBytes(8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}



function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
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

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        login(username, password, function (status) {
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

var auth = function (req, res, next) {
    console.log(req.url);
    if (!req.user) {
        req.session.returnTo = req.url;
        res.sendFile(__dirname + "/login.html");
    } else {
        next();
    }
};


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));



app.get('/m', auth, function (req, res) {
    fs.readFile(__dirname + "/quiz.html", function (err, data) {
        data.replace("{{data}}")
        res.send(data);
    });

});


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function question(module, id, cb) {

    if (id == -1) {
        id = randomInt(1, fs.readdirSync("questions/" + module).length);
    }
    console.log("questions/" + module + "/" + id + ".json");
    fs.readFile("questions/" + module + "/" + id + ".json", function (err, quizJsonRaw) {
        if (err) return;
        var quizData = JSON.parse(quizJsonRaw);
        fs.readFile("quiz.html", function (err, html) {

            //Shuffle options

            //Get current text
            var correct = quizData.options[quizData.answer];

            //Shuffle Options
            quizData.options = shuffle(quizData.options);

            //Find new position
            quizData.options.forEach(function (v, i, a) {
                if (v == correct) {
                    quizData.answer = i;
                    return;
                }
            });

            //Done shuffling

            var toreturn = `<!doctype html>
<html lang="en" class="no-js">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css'>

	<link rel="stylesheet" href="/css/reset.css">
	<!-- CSS reset -->
	<link rel="stylesheet" href="/css/style.css">
	<!-- Resource style -->
	<script src="/js/modernizr.js"></script>
	<!-- Modernizr -->

	<title>Étudie ÇA!</title>
</head>

<body>
	<main>
		<div class="cd-index cd-main-content">
			<a href="/logout.html" data-type="page-transition"><button class="cd-btn" style="position: absolute; top: 10px; right: 5px;">X</button></a>
			<a href="/module" data-type="page-transition"><button class="cd-btn" style="position: absolute; top: 10px; left: 5px;">&larr;</button></a>
			<div>
            <script>
            var data = JSON.parse(window.atob('` + new Buffer(JSON.stringify(quizData)).toString('base64') + `'));
                </script><form method="POST" action="/science" style="display:none;">
                    <input type="text" id="qid" name="qid" value="${id}">
                    <input type="text" id="timestart" name="timestart" value="${Date.now()}">
                    <input type="text" id="key" name="key" value="${newToken()}">
                    <input type="text" id="alttab" name="alttab" value="0">
                    <input type="text" id="options" name="options" value='${new Buffer(JSON.stringify(quizData.options)).toString('base64')}'>
                    <input type="text" id="answer" name="answer" value="">

                    <input type="text" id="quiz" name="quiz" value="phy">
                </form>
                <h2 style="font-weight: 400; color: #ccc; padding-bottom: 3em;">Question</h2>
                <h1 style=" padding-bottom: 1em;">${quizData.question}</h1>
                <a class="cd-btn science" data-option="0" data-type="answer">${quizData.options[0]}</a>
                <a class="cd-btn science" data-option="1" data-type="answer">${quizData.options[1]}</a>
                <a class="cd-btn science" data-option="2" data-type="answer">${quizData.options[2]}</a>
                <a class="cd-btn science" data-option="3" data-type="answer">${quizData.options[3]}</a>
                <br>
                <div id="answered" style="display:none;">
                    <a class="cd-btn" data-type="page-transition" href="${randomInt(1, fs.readdirSync("questions/" + module).length)}">Suivant</a>
                </div>
            </div>
		</div>
        
	</main>
	<div class="cd-cover-layer"></div>
	<div class="cd-loading-bar"></div>
	<script src="/js/jquery-2.1.1.js"></script>
	<script src="/js/main.js"></script>
	<script src="/js/collect.js"></script>
	<!-- Resource jQuery -->
</body>

</html>

            
            `;

            cb(toreturn);
        });
    });
}

app.get('/:module/q/:id', auth, function (req, res) {
    question(req.params.module, req.params.id, function (data) {
        res.send(data);
    });
});

app.get('/:module/q', auth, function (req, res) {
    question(req.params.module, -1, function (data) {
        res.send(data);
    });
});


app.post('/science', auth, function (req, res) {
    //Result endpoint
    fs.readFile(__dirname + "/questions/" + req.body.quiz + "/" + req.body.qid + ".json", function (err, data) {
        if (err) {
            return 0
        }
        data = JSON.parse(data);

        //Unshuffle results
        if (!IsJsonString(new Buffer(req.body.options, 'base64').toString('ascii'))){
            return 0;
        }
        var optionsShuffled = JSON.parse(new Buffer(req.body.options, 'base64').toString());

        //Get value of shuffled
        var unshufa = -1;
        optionsShuffled.forEach(function (v,i,a){
            if (data.options[i] == optionsShuffled[req.body.answer]){
                console.log(optionsShuffled[req.body.answer], "is indeed", data.options[i], "While having id of", i);
                console.log("Real answer", i);
                unshufa = i;
            }
        });

        var results = {
            qid: req.body.qid,
            time: +req.body.timestart,
            set: req.body.quiz,
            spent: +(Date.now() - req.body.timestart),
            user: req.user.username,
            alttab: +req.body.alttab,
            answer: +unshufa,
            pass: +(unshufa == data.answer),
            correct: data.answer,
            key: req.body.key,
            agent: req.headers['user-agent']
        };
        res.send("Data Submitted for Analysis");
        console.log(JSON.stringify(results));
        console.log("Did you pass?", results.pass);


        //Implement sqlite logger
        // node dblite.test.js
        db.query('INSERT INTO quiz VALUES (:qid, :time, :set, :spent, :user, :alttab, :answer, :pass, :correct, :key, :agent)', results);
    })

});


app.get("/login.html", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.get("/module", auth, function (req, res) {
    res.sendFile(__dirname + "/select.html");
});


app.get("/home", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/about", function (req, res) {
    res.sendFile(__dirname + "/about.html");
});

app.get("/logout.html", function (req, res) {
    req.logout();
    req.session.destroy();
    res.sendFile(__dirname + "/login.html");
});

app.post("/login.html", passport.authenticate('local', {
    failureRedirect: '/login.html'
}), function (req, res) {
    res.redirect(req.session.returnTo || '/');
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log('App ready!');
    console.log('Listening on *:' + PORT);
});
