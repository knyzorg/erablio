var express = require('express');
var fs = require('fs')
var Crypto = require('crypto')
var app = express();
var request = require('request');
var passport = require('passport');
var sys = require('sys')
var exec = require('child_process').exec;
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
    if (process.env.DEMO){
        callback(true);return;
    }

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

var advancedAuth = function (req, res, next) {
    console.log(req.url);
    console.log(JSON.stringify(req.user));
    if ((!req.user || !(req.user.username != "vbellemare" || req.user.username != "vknyazev")) && !process.env.DEMO) {
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

// oeil-4.png
app.use('/img', express.static('img'));
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
function question(module, id, req, res, cb) {

    if (req.user.questions[module] == undefined) {
        req.user.questions[module] = {};
        req.user.questions[module].right = [];
        req.user.questions[module].wrong = [];
    }
    if (req.user.questions[module].answered === undefined) {
        req.user.questions[module].answered = [];
    }


    if (id == -1) {
        if ((req.user.questions[module].answered.length != fs.readdirSync("questions/" + module).length)) {
            id = randomInt(1, fs.readdirSync("questions/" + module).length);
        }
        //TODO: Fix login complete quiz issue via redirect
        if (fs.readdirSync("questions/" + module).length == req.user.questions[module].answered.length){
            res.redirect("/" + module + "/q/end");
            return;
        }
    }

    if (req.user.questions[module].answered.indexOf(id.toString()) === -1 && !isNaN(id)) {
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

            var nextQuestion = randomInt(1, fs.readdirSync("questions/" + module).length).toString();

            //Select next question (semi-randomly)
            if (req.user.questions[module].answered.length == fs.readdirSync("questions/" + module).length) {
                //All questions complete, reset 
                if (fs.readdirSync("questions/" + module).length == req.user.questions[module].right.length) {
                    console.log("All done, all right");
                    req.user.questions[module].answered = [];
                } else {
                    nextQuestion = "end";
                }

            }

            while (req.user.questions[module].answered.indexOf(nextQuestion) !== -1) {
                console.log(nextQuestion, "is present. Changing.");
                nextQuestion = randomInt(1, fs.readdirSync("questions/" + module).length).toString();
            }
            console.log(nextQuestion, "is not in", JSON.stringify(req.user.questions[module].answered));

            var imgHtml = "";

            if (fs.existsSync("img/" + module + "-" + id + ".png")) {
                imgHtml = `
                    <img src="${"/img/" + module + "-" + id + ".png"}" style="
    display: block;
    margin-left: auto;
    margin-right:auto;
">
<br>
<br>
                `;
            }

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
                ${imgHtml}
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


app.get('/:module/q/end', auth, function (req, res) {
    data = "Questions not completed, can't generate verdict";
    if (req.user.questions[req.params.module].answered.length == fs.readdirSync("questions/" + req.params.module).length) {
        var text = "Something broke :/";
        switch (parseInt(10 * req.user.questions[req.params.module].right.length / fs.readdirSync("questions/" + req.params.module).length)) {
            case 0:
                text = "As-tu vraiment fait ça sérieusement ?"
                break;
            case 1:
                text = "As-tu vraiment compris la matière correctement ?"

                break;
            case 2:
                text = "Continue! Tu vas y arriver! Un jour...."

                break;
            case 3:
                text = "Tu es à mi-chemin!.......de la note de passage...Redouble tes efforts!"

                break;
            case 4:
                text = "Continue! Tu vas y arriver! Un jour...."

                break;
            case 5:
                text = "OH! Presque! Ne lache surtout pas ici!!"

                break;
            case 6:
                text = "Ca passe! Mais aucune raison d'abondonner maintenant!"
                break;
            case 7:
                text = "C'est bien! Mais c'est toujours possible à l'amélioration!"

                break;
            case 8:
                text = "Garde cette cadence pour l'examen!"

                break;
            case 9:
                text = "Si proche de la perfection! Souviens toi attentivement de tes erreurs pour ne pas les répéter durant tes examens!"

                break;
            case 10:
                text = "Perfection! Essaie d'avoir cette note encore une fois!"

                break;

        }
        data = `
        <!doctype html>
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

<body class="cd-about">
	<main>
		<div class="cd-about cd-main-content">
        <button href="/logout.html" data-type="page-transition" class="cd-btn" style="position: absolute; top: 10px; right: 5px;">X</button>
			<button href="/module" data-type="page-transition" class="cd-btn" style="position: absolute; top: 10px; left: 5px;">&larr;</button>
			<div>


                <h1>${Math.round(req.user.questions[req.params.module].right.length * 100 / fs.readdirSync("questions/" + req.params.module).length)}%</h1>

				<h2>Verdict</h2>

				<p>
					${text}
				</p>
				<button class="cd-btn" href="retake" data-type="page-transition">Refaire les questions manquées</button>
				<button class="cd-btn" href="reset" data-type="page-transition">Refaire le module au complet</button>
			</div>
		</div>
	</main>
	<div class="cd-cover-layer"></div>
	<div class="cd-loading-bar"></div>
	<script src="/js/jquery-2.1.1.js"></script>
	<script src="/js/main.js"></script>
	<!-- Resource jQuery -->
</body>

</html>
    `;
    }
    res.send(data);
});


app.get('/:module/q/retake', auth, function (req, res) {
    if (req.user.questions[req.params.module] != undefined) {
        req.user.questions[req.params.module].answered = req.user.questions[req.params.module].right;
        req.user.questions[req.params.module].wrong = [];
    }

    
    res.redirect("/" + req.params.module + "/q/")    
});

app.get('/:module/q/reset', auth, function (req, res) {
    if (req.user.questions[req.params.module] != undefined) {
        req.user.questions[req.params.module].answered = [];
        req.user.questions[req.params.module].right = [];
        req.user.questions[req.params.module].wrong = [];
    }

    res.redirect("/" + req.params.module + "/q/")
});

app.get('/:module/q/:id', auth, function (req, res) {
    question(req.params.module, req.params.id, req, res, function (data) {
        res.send(data);
    });
});

app.get('/:module/q', auth, function (req, res) {
    question(req.params.module, -1, req, res, function (data) {
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



        if (req.user.questions[results.set] == undefined) {
            req.user.questions[results.set] = {};
        }

        if (req.user.questions[results.set].wrong == undefined || req.user.questions[results.set].wrong == undefined) {
            req.user.questions[results.set].wrong = [];
            req.user.questions[results.set].right = [];
        }
        if (results.pass) {
            req.user.questions[results.set].right.push(results.qid.toString());
        } else {
            req.user.questions[results.set].wrong.push(results.qid.toString());
        }
        console.log(req.user.questions[results.set].right);


        //Implement sqlite logger
        // node dblite.test.js
        db.query('INSERT INTO quiz VALUES (:qid, :time, :set, :spent, :user, :alttab, :answer, :pass, :correct, :key, :agent)', results);

        res.send("Data Submitted for Analysis");
        console.log(JSON.stringify(results));
        console.log("Did you pass?", results.pass);

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
app.get("/news", function (req, res) {
    res.sendFile(__dirname + "/news.html");
});


//GENERATOR
app.get('/generator/new', advancedAuth, function (req, res) {
    res.sendFile(__dirname + "/generator/generator.html")
});

app.get('/generator/edit/:module/:qid', advancedAuth, function (req, res) {
    var module = req.params.module;
    var qid = req.params.qid;
    var data = JSON.parse(fs.readFileSync("questions/" + module + "/" + qid + ".json"));
    res.send(`
    <head>
    <title>Edit Question</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ"
    crossorigin="anonymous">
<script src="/js/jquery-2.1.1.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb"
    crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn"
    crossorigin="anonymous"></script>
    </head>

<body>
<nav class="navbar navbar-toggleable-md navbar-light bg-faded">
  <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <a class="navbar-brand" href="/generator">Home</a>
  <div class="collapse navbar-collapse" id="navbarNav">
  </div>
</nav>
    <form class="container" action="/generator/submit" method="POST">
        <div class="form-group">
            <label for="qid">ID (New question=0 else overwrite existing question):</label>
            <input type="number" id="qid" name="qid" class="form-control" value="${qid}" placeholder="Question numeric ID" required>
        </div>

        <div class="form-group">
            <label for="module">Module:</label>
            <select class="form-control" id="module" name="module">
                <option>${module}</option>
                <option>oeil</option>
                <option>oreille</option>
                <option>peau</option>
            </select>
        </div>

        <div class="form-group">
            <label for="question">Question (Use "&lt;br&gt;" for line-break):</label>
            <input type="text" id="question" name="question" class="form-control" placeholder="Question Here" value="${data.question}" required>
        </div>
        <div class="form-group">
            <label for="opt1">Options (First option is correct, empty options will be hidden):</label>
            <input type="text" id="opt1" name="opt1" value="${data.options[0]}"class="form-control" placeholder="Option 1 (Correct)" required>
            <input type="text" id="opt2" name="opt2" value="${data.options[1]}"class="form-control" placeholder="Option 2" required>
            <input type="text" id="opt3" name="opt3" value="${data.options[2]}"class="form-control" placeholder="Option 3" required>
            <input type="text" id="opt4" name="opt4" value="${data.options[3]}"class="form-control" placeholder="Option 4" required>
        </div>
        <div class="form-group">

            <label for="explainCorrect">Explain pls (Right):</label>
            <textarea type="text" id="explainCorrect" name="right" class="form-control" placeholder="Explain Correct Answer" required>${data.right}</textarea>

            <label for="explainWrong">Explain pls (Wrong):</label>
            <textarea type="text" id="explainWrong" name="wrong" class="form-control" placeholder="Explain Wrong Answer" required>${data.wrong}</textarea>
        </div>
    </form>
    <div class="container">
        <div class="form-group">
            <button class="btn" onclick='$("form").ajaxSubmit({success: function (r){if (r=="OK"){alert("Question uploaded"); window.location.href = "/generator/list";}}});'>Upload</button>
</div>
</div>
</body>
    `)
});

app.get('/generator/list', advancedAuth, function (req, res) {
    var questions = "";
    var nav = "";
    var addHtml = function (qid, module) {
        var data = JSON.parse(fs.readFileSync("questions/" + module + "/" + qid + ".json"));
        questions += `
            <div class="jumbotron">
  <h1>#${qid} - ${data.question}</h1>
  <p>${JSON.stringify(data.options)}</p>
  <p>
  <a class="btn btn-primary btn-lg" href="/${module}/q/${qid}" target="_blank" role="button">Open on Etudie CA!</a>
  <a class="btn btn-secondary btn-lg" href="/generator/edit/${module}/${qid}" role="button">Edit</a>
  </p>
</div>
        `
    }
    fs.readdirSync("questions/").forEach(function (module, i, a) {
        if (module == ".git"){
            return;
        }
        questions += "<h1 id='" + module + "'>Questions for " + module + "</h1>"
        nav += "<li class='nav-item'><a class='nav-link' href='#" + module + "'>" + module + "</a></li>"
        fs.readdirSync("questions/" + module).sort(function (a,b){return a.split(".")[0] - b.split(".")[0]}).forEach(function (filename, i, a) {
            addHtml(filename.split(".")[0], module);
        });
    });
    fullHtml = fs.readFileSync(__dirname + "/generator/list.html").toString().replace("{{data}}", questions).replace("{{nav}}", nav);
    res.send(fullHtml);
});

app.get('/generator', advancedAuth, function (req, res) {
    res.sendFile(__dirname + "/generator/menu.html")
});

app.get('/generator/upload', advancedAuth, function (req, res) {
    if (process.env.DEMO){
        res.send("Feature disabled on DEMO installs");return;
    }
    exec('cd questions; git add . -A; git commit -m "Production Upload"; git push; cd ..', function (err, out){
        res.send("Updated")
    });
});

app.get('/generator/update', advancedAuth, function (req, res) {
    exec("cd questions; git pull; cd ../img; git pull; cd ..;", function (err, out){
        res.send("Updated")
    });
});

app.post('/generator/submit', advancedAuth, function (req, res) {
    if (req.body.qid > fs.readdirSync("questions/" + req.body.module).length) {
        res.send("ERROR");
        return;
    }
    if (+req.body.qid == 0) {
        req.body.qid = fs.readdirSync("questions/" + req.body.module).length + 1;
    }

    var input = {
        question: req.body.question,
        options: [req.body.opt1, req.body.opt2, req.body.opt3, req.body.opt4],
        answer: "0",
        wrong: req.body.wrong,
        right: req.body.right
    };
    fs.writeFileSync("questions/" + req.body.module + "/" + req.body.qid + ".json", JSON.stringify(input));
    res.send("OK");
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
