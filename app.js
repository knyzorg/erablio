var express = require('express');
var cookieParser = require('cookie-parser')
var fs = require('fs')
var Crypto = require('crypto')
var app = express();
var request = require('request');
function newToken() {
    return Crypto.randomBytes(8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}


app.use(cookieParser())


function randomInt(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
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
app.get('/answer.html', function(req, res) {
    fs.readFile(__dirname + "/questions/" + req.query.q + ".json", function (err, data){
        if (!err){
            qdata = JSON.parse(data);
            if (qdata.answer != req.query.a){
                //Wrong answer
                res.send(`
                <!doctype html>
                <html lang="en" class="no-js">
                <head>
                	<meta charset="UTF-8">
                	<meta name="viewport" content="width=device-width, initial-scale=1">

                	<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css'>

                	<link rel="stylesheet" href="css/reset.css"> <!-- CSS reset -->
                	<link rel="stylesheet" href="css/style.css"> <!-- Resource style -->
                	<script src="js/modernizr.js"></script> <!-- Modernizr -->

                	<title>Etude, Etude</title>
                </head>
                <body class="cd-about">
                	<main>
                		<div class="cd-about cd-main-content">
                			<div>

                				<h1>Mauvaise Reponse!</h1>

                				<h2>La bonne reponse etait: <span>${qdata.options[+qdata.answer]}</span></h2>
                				<p>
                					${qdata.wrong}
                				</p>
                					<a class="cd-btn" href="/quiz.html" data-type="page-transition">Continuer &#8594;</a>
                			</div>
                		</div>
                	</main>
                	<div class="cd-cover-layer"></div>
                	<div class="cd-loading-bar"></div>
                <script src="js/jquery-2.1.1.js"></script>
                <script src="js/main.js"></script> <!-- Resource jQuery -->
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

                	<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css'>

                	<link rel="stylesheet" href="css/reset.css"> <!-- CSS reset -->
                	<link rel="stylesheet" href="css/style.css"> <!-- Resource style -->
                	<script src="js/modernizr.js"></script> <!-- Modernizr -->

                	<title>Etude, Etude</title>
                </head>
                <body class="cd-about">
                	<main>
                		<div class="cd-about cd-main-content">
                			<div>

                				<h1>Bonne Reponse!</h1>

                				<h2>Vous avez correctement dit: <span>${qdata.options[+qdata.answer]}</span></h2>
                				<p>
                					${qdata.right}
                				</p>
                					<a class="cd-btn" href="/quiz.html" data-type="page-transition">Continuer &#8594;</a>
                			</div>
                		</div>
                	</main>
                	<div class="cd-cover-layer"></div>
                	<div class="cd-loading-bar"></div>
                <script src="js/jquery-2.1.1.js"></script>
                <script src="js/main.js"></script> <!-- Resource jQuery -->
                </body>
                </html>
                `.toString());
            }
        }

    })
});
app.get('/quiz.html', function(req, res) {
    //Question endpoint
    fs.readdir(__dirname + "/questions", function (err, files){
        if (err) throw err;
        var index = randomInt(0, files.length - 1);

        console.log(index);

        var filename = files[index];
        fs.readFile(__dirname + "/questions/" + filename, function (err, data){
            qdata = JSON.parse(data);


            var element = `<div>
                <form action="POST" target="/quiz" style="display:none;">
                    <input type="text" id="qid" name="qid" value="${index}">
                    <input type="text" id="timestart" name="timestart" value="${Date.now()}">
                    <input type="text" id="user" name="user" value="${req.cookies.user}">
                    <input type="text" id="key" name="key" value="${newToken()}">
                    <input type="text" id="alttab" name="alttab" value="0">
                    <input type="text" id="answer" name="answer" value="0">
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

app.post('/quiz', function(req, res) {
    //Result endpoint
    var results = {
        qid: req.query.qid,
        time: req.query.timestart,
        spent: req.query.timeend - req.query.timestart,
        user: req.query.user,
        alttab: req.query.alttab,
        answer: req.query.answer,
        key: req.query.key
    };

});


app.post("/login", function(req, res) {

    var username = req.query.username;
    var password = req.query.password;

    var login = "https://portail.csdraveurs.qc.ca/Anonym/Login.aspx?lnrid=636091206172586869&_lnPageGuid=869878df-59f3-43c9-a5e3-5c54a05e24ef&__EGClientState=&__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=&__EVENTVALIDATION=%2FwEWCAL%2BraDpAgKN1azYCQLr3en9AwLXgqWzDwLMwYL7CQLvtfAUArqPkNEEApvk0uoCCFdFmooPyvnZcMHRMqny4KXERvg%3D&ctlUserCode=" + username + "&ctlUserPassword=" + password + "&ctlLogon=Connexion";

    request(login, function(error, response, body) {
        if (!error && response.statusCode == 200 && body.includes("Chargement en cours")) {
            console.log("Logged in");
        } else {
            console.log("Failed to login");
        }
    })

});

app.listen(process.env.PORT || 3000, function() {
    console.log('App ready!');
});
