/*
    Admin quiz-creation interface
*/

/*  =========
    IMPORTANT
    =========
    Generator system has been broken by project re-structuring as well as a new question module standard.
    Please do not spend any time fixing it,
    instead focus on a ground-up re-write of it while closely integrating it in the main application
*/
app.get('/generator', authUtils.adminAuth, function (req, res) {
    console.log("Accessed admin panel")
    res.sendFile(appRoot + "/generator/menu.html")
});

app.get('/generator/new', authUtils.adminAuth, function (req, res) {
    var modules = "";
    fs.readdirSync("questions").forEach(function (v, i, a) {
        if (v == ".git") {
            return;
        }
        modules += "<option>" + v + "</option>"
    })
    fs.readFile(appRoot + "/generator/generator.html", function (err, data) {
        res.send(data.toString().replace("{{modules}}", modules))
    })

});

app.get('/generator/edit/:module/:qid', authUtils.adminAuth, function (req, res) {
    var module = req.params.module;
    var qid = req.params.qid;
    var data = JSON.parse(fs.readFileSync(appRoot + "/questions/" + module + "/" + qid + ".json"));
    var modules = "";
    fs.readdirSync(appRoot + "/questions").forEach(function (v, i, a) {
        if (v == ".git") {
            return;
        }
        modules += "<option>" + v + "</option>"
    })
    res.send(`
    <head>
    <title>Edit Question</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/bootstrap.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ"
    crossorigin="anonymous">
<script src="/js/jquery-2.1.1.js"></script>
<script src="/js/tether.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb"
    crossorigin="anonymous"></script>
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
                ${modules}
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

app.get('/generator/list', authUtils.adminAuth, function (req, res) {
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
        if (module == ".git") {
            return;
        }
        questions += "<h1 id='" + module + "'>Questions for " + module + "</h1>"
        nav += "<li class='nav-item'><a class='nav-link' href='#" + module + "'>" + module + "</a></li>"
        fs.readdirSync(appRoot + "/questions/" + module).sort(function (a, b) {
            return a.split(".")[0] - b.split(".")[0]
        }).forEach(function (filename, i, a) {
            addHtml(filename.split(".")[0], module);
        });
    });
    fullHtml = fs.readFileSync(appRoot + "/generator/list.html").toString().replace("{{data}}",
        questions).replace("{{nav}}", nav);
    res.send(fullHtml);
});

app.get('/generator/upload', authUtils.adminAuth, function (req, res) {
    if (process.env.DEMO) {
        res.send("Feature disabled on DEMO installs"); return;
    }
    exec('cd questions; git add . -A; git commit -m "Production Upload"; git push; cd ..', function (err, out) {
        if (err) {
            res.send("Something went wrong")
            return;
        }
        res.send("Updated")
    });
});

app.get('/generator/update', authUtils.adminAuth, function (req, res) {
    exec("cd questions; git pull; cd ../img; git pull; cd ..;", function (err, out) {
        if (err) {
            res.send("Something went wrong")
            return;
        }
        res.send("Updated")
    });
});

app.get('/generator/reboot-crash', authUtils.adminAuth, function (req, res) {
    process.exit(1)
});

app.get('/generator/reboot-npm', authUtils.adminAuth, function (req, res) {
    //res.send("Coming soon..")
    server.close(function () {
        var spawn = require('child_process').spawn;
        spawn('npm', ['start'], {
            stdio: 'ignore', // piping all stdio to /dev/null
            detached: true
        }).unref();
        setTimeout(function (err, stdout, stderr) {
            console.log(err, stdout, stderr);
            console.log("Server status", server.listening)
            process.exit(0);
        });
    });

});

app.get('/generator/upgrade', authUtils.adminAuth, function (req, res) {
    fs.readFile("package.json", function (err, data) {
        currentVersion = JSON.parse(data).version;
        exec("git pull; npm install", function (err, out) {
            if (err) {
                res.send("Something went wrong")
                return;
            }
            fs.readFile("package.json", function (err, data) {
                newVersion = JSON.parse(data).version;
                if (currentVersion == newVersion) {
                    res.send("Already up to date!");
                    return;
                }
                res.send("Upgraded from v" + currentVersion + " to v" + newVersion + "<br>Requires engine restart");
            });
        });
    });
});
app.get('/generator/reboot-ctl', authUtils.adminAuth, function (req, res) {
    res.send("Reboot using systemctl")
    exec("systemctl restart erablio");
});
app.post('/generator/submit', authUtils.adminAuth, function (req, res) {
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
    fs.writeFile("questions/" + req.body.module + "/" + req.body.qid + ".json",
        JSON.stringify(input), function () {
            res.send("OK");
        });

});