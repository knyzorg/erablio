var express = require('express');
var fs = require('fs')
var Crypto = require('crypto')
var app = express();

app.use(require('body-parser').urlencoded({
    extended: true
}));

app.get('/new', function (req, res) {
    res.sendFile(__dirname + "/generator/generator.html")
});

app.get('/edit/:module/:qid', function (req, res) {
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
    <form class="container" action="/submit" method="POST">
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
            <button class="btn" onclick='$("form").ajaxSubmit({success: function (r){if (r=="OK"){alert("Question uploaded"); window.location.href = "/list";}}});'>Upload</button>
</div>
</div>
</body>
    `)
});

app.get('/list', function (req, res) {
    var questions = "";
    var nav = "";
    var addHtml = function (qid, module) {
        var data = JSON.parse(fs.readFileSync("questions/" + module + "/" + qid + ".json"));
        questions += `
            <div class="jumbotron">
  <h1>#${qid} - ${data.question}</h1>
  <p>${JSON.stringify(data.options)}</p>
  <p>
  <a class="btn btn-primary btn-lg" href="https://www.etudie.ca/${module}/q/${qid}" target="_blank" role="button">Open on Etudie CA!</a>
  <a class="btn btn-secondary btn-lg" href="/edit/${module}/${qid}" role="button">Edit</a>
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
        fs.readdirSync("questions/" + module).forEach(function (filename, i, a) {
            addHtml(filename.split(".")[0], module);
        });
    });
    fullHtml = fs.readFileSync(__dirname + "/generator/list.html").toString().replace("{{data}}", questions).replace("{{nav}}", nav);
    res.send(fullHtml);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/generator/menu.html")
});

app.post('/submit', function (req, res) {
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


app.use('/js', express.static('js'));

var PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
    console.log('App ready!');
    console.log('Listening on *:' + PORT);
});