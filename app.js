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

var auth = function (req, res, next) {
    console.log(req.url);
    console.log(JSON.stringify(req.user));
    if (!req.user) {
        console.log("User not logged in");
        req.session.returnTo = req.url;
        res.sendFile(__dirname + "/login.html");
    } else {
        console.log("User logged in");
        next();
    }
};


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));



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
function question(module, id, req, cb) {

    if (id == -1) {
        id = randomInt(1, fs.readdirSync("questions/" + module).length);
    }
    if (req.user.questions[module] == undefined) {
        req.user.questions[module] = {};
    }
    if (req.user.questions[module].answered === undefined) {
        req.user.questions[module].answered = [];
    }
    if (req.user.questions[module].answered.indexOf(id.toString()) === -1) {
        req.user.questions[module].answered.push(id.toString());

    }

    console.log("questions/" + module + "/" + id + ".json");
    fs.readFile("questions/" + module + "/" + id + ".json", { encoding: 'utf-8' }, function (err, quizJsonRaw) {
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

            //Select next question (semi-randomly)
            if (req.user.questions[module].answered.length == fs.readdirSync("questions/" + module).length) {
                //All questions complete, reset 
                console.log("Reset questions");
                req.user.questions[module].answered = [];
            }

            var nextQuestion = randomInt(1, fs.readdirSync("questions/" + module).length).toString();

            while (req.user.questions[module].answered.indexOf(nextQuestion) !== -1) {
                console.log(nextQuestion, "is present. Changing.");
                nextQuestion = randomInt(1, fs.readdirSync("questions/" + module).length).toString();
            }
            console.log(nextQuestion, "is not in", JSON.stringify(req.user.questions[module].answered));
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
			<button href="/logout.html" data-type="page-transition" class="cd-btn" style="position: absolute; top: 10px; right: 5px;">X</button>
			<button href="/module" data-type="page-transition" class="cd-btn" style="position: absolute; top: 10px; left: 5px;">&larr;</button>
			<div>
            <div id="data_inject" style="display:none">
            var data = JSON.parse(b64_to_utf8('` + new Buffer(JSON.stringify(quizData)).toString('base64') + `'));
                </div><form method="POST" action="/science?no-cache=${newToken()}" style="display:none;">
                    <input type="text" id="qid" name="qid" value="${id}">
                    <input type="text" id="timestart" name="timestart" value="${Date.now()}">
                    <input type="text" id="key" name="key" value="${newToken()}">
                    <input type="text" id="alttab" name="alttab" value="0">
                    <input type="text" id="quiz" name="quiz" value="${module}">
                    
                    <input type="text" id="options" name="options" value='${new Buffer(JSON.stringify(quizData.options)).toString('base64')}'>
                    <input type="text" id="answer" name="answer" value="">
                </form>
                <h2 style="font-weight: 400; color: #ccc; padding-bottom: 3em;">Question ${req.user.questions[module].answered.length}/${fs.readdirSync("questions/" + module).length}</h2>
                <h1 style=" padding-bottom: 1em;">${quizData.question}</h1>
                <button class="cd-btn science" data-option="0" data-type="answer">${quizData.options[0]}</button>
                <button class="cd-btn science" data-option="1" data-type="answer">${quizData.options[1]}</button>
                <button class="cd-btn science" data-option="2" data-type="answer">${quizData.options[2]}</button>
                <button class="cd-btn science" data-option="3" data-type="answer">${quizData.options[3]}</button>
                <br>
                <div id="answered" style="display:none;">
                    <button class="cd-btn" data-type="page-transition" href="${nextQuestion}">Suivant</button>
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

app.get("/module", auth, function (req, res) {
    res.sendFile(__dirname + "/select.html");
});

app.get('/:module/q/:id', auth, function (req, res) {
    question(req.params.module, req.params.id, req, function (data) {
        res.send(data);
    });
});

app.get('/:module/q/reset', auth, function (req, res) {
    question(req.params.module, req.params.id, req, function (data) {
        res.send(data);
    });
});

app.get('/:module/q', auth, function (req, res) {
    question(req.params.module, -1, req, function (data) {
        res.send(data);
    });
});


app.post('/science', auth, function (req, res) {
    //Result endpoint
    fs.readFile(__dirname + "/questions/" + req.body.quiz + "/" + req.body.qid + ".json", { encoding: 'utf-8' }, function (err, data) {
        console.log("Reading", __dirname + "/questions/" + req.body.quiz + "/" + req.body.qid + ".json")
        if (err) {
            console.log("Error could not read file for validation")
            res.send("Error");
            return 0;
        }
        console.log("OK");
        data = JSON.parse(data);

        //Unshuffle results
        if (!IsJsonString(new Buffer(req.body.options, 'base64').toString())) {
            console.log("Not valid JSON");
            return 0;
        }
        var optionsShuffled = JSON.parse(new Buffer(req.body.options, 'base64').toString());

        //Get value of shuffled
        var unshufa = -1;
        optionsShuffled.forEach(function (v, i, a) {
            if (data.options[i] == optionsShuffled[req.body.answer]) {
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

        if (req.user.questions[results.set] == undefined) {
            req.user.questions[results.set] = {};
        }

        if (req.user.questions[results.set].wrong == undefined || req.user.questions[results.set].wrong == undefined) {
            req.user.questions[results.set].wrong = [];
            req.user.questions[results.set].right = [];
        }

        if (results.pass) {
            req.user.questions[results.set].right.push(results.qid.toString);
        } else {
            req.user.questions[results.set].wrong.push(results.qid.toString);
        }

        //Implement sqlite logger
        // node dblite.test.js
        db.query('INSERT INTO quiz VALUES (:qid, :time, :set, :spent, :user, :alttab, :answer, :pass, :correct, :key, :agent)', results);
    })

});


app.get("/login.html", function (req, res) {
    res.sendFile(__dirname + "/login.html");
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
    if (req.session.returnTo) {
        req.session.returnTo += "?" + newToken();
    }
    res.redirect(req.session.returnTo || '/module' + "?" + newToken());
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log('App ready!');
    console.log('Listening on *:' + PORT);
});
