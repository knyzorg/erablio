/**
 * Get a list of module objects
 * @param {Function} callback 
 */
function getAllModules(callback) {
    var modules = [];
    fs.readdir("questions", function (err, files) {
        rejected = 0;
        files.forEach(function (fname, findex) {
            if (fname.split(".json").length != 2) {
                console.log("Rejecting folder", fname)
                rejected++;
                return;
            }
            fs.readFile("questions/" + fname, function (err, data) {
                console.log("Parsing question", fname)
                var json = JSON.parse(data);
                modules.push(json)
                if (modules.length == files.length-rejected) {
                    callback(modules);
                }
            })
        })
    })
}
/**
 * Gets an array of a user's enabled modules
 * @param {String} user Username of user
 * @param {Function} callback 
 */
function getUserModules(user, callback) {
    var path = "userconfig/" + user;
    if (fs.existsSync(path)) {
        fs.readFile(path, (err, data) => {
    console.log(JSON.parse(data));
            
            callback(JSON.parse(data));
        })
    } else {
        callback([]);
    }
    
}
/**
 * Generates quiz question html and automatically handles issues with redirection
 * @param {String} module Name of module stored in /questions
 * @param {Number} [id=-1] The id of the question
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} cb Callback with the generated html
 */
function question(module, id = -1, req, res, cb) {

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
            id = utils.randomInt(1, fs.readdirSync("questions/" + module).length);
        }
        //TODO: Fix login complete quiz issue via redirect
        if (fs.readdirSync("questions/" + module).length == req.user.questions[module].answered.length) {
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
        quizData.meta = { id: id, module: module };
        fs.readFile("quiz.html", function (err, html) {

            //Shuffle options

            //Get current text
            var correct = quizData.options[quizData.answer];

            //Shuffle Options
            quizData.options = utils.shuffleArray(quizData.options);

            //Find new position
            quizData.options.forEach(function (v, i, a) {
                if (v == correct) {
                    quizData.answer = i;
                    return;
                }
            });
            //Done shuffling

            var nextQuestion = utils.randomInt(1, fs.readdirSync("questions/" + module).length).toString();

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
                nextQuestion = utils.randomInt(1, fs.readdirSync("questions/" + module).length).toString();
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

	<link href='/css/fonts/fonts.css' rel='stylesheet' type='text/css'>

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
            var data = JSON.parse(b64_to_utf8('` + utils.base64Encode(JSON.stringify(quizData)) + `'));
                </div><form method="POST" action="/science?no-cache=${utils.newToken()}" style="display:none;">
                    <input type="text" id="qid" name="qid" value="${id}">
                    <input type="text" id="timestart" name="timestart" value="${Date.now()}">
                    <input type="text" id="key" name="key" value="${utils.newToken()}">
                    <input type="text" id="alttab" name="alttab" value="0">
                    <input type="text" id="quiz" name="quiz" value="${module}">
                    
                    <input type="text" id="options" name="options" value='${utils.base64Encode(JSON.stringify(quizData.options))}'>
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

app.get("/addmod/:modid", authUtils.basicAuth, function (req, res){
    fs.readFile("userconfig/" + req.user.username, function (err, data){
        var json = err ? [] : JSON.parse(data)
        json.push(req.params.modid)
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), ()=>{})
    })
    res.send("OK")
})

app.get("/remmod/:modid", authUtils.basicAuth, function (req, res){
    fs.readFile("userconfig/" + req.user.username, function (err, data){
        var json = err ? [] : JSON.parse(data)
        delete json[json.indexOf(req.params.modid)]
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), ()=>{})
    })
    res.send("OK")
})
app.get("/module", authUtils.basicAuth, function (req, res) {
    var buffer = "";
    var buffer2 = "";
    getUserModules(req.user.username, function (valid) {

        getAllModules(function (modules) {
            modules.forEach(function (module) {
                if (module.draft) {
                    return;
                }
                buffer2 += `<div class="new-mod-container">
                    <button class="cd-btn addmod" data-modid="${module.id}" data-modname="${module.name}">${(valid.indexOf(module.id) === -1) ? "+" : "-"}</button>

                <h2 style="
                    display: inline-block;
                ">${module.name}</h2>
                    
                    <p style="display:none;">${module.description}</p></div>`
                if (valid.indexOf(module.id) !== -1) {
                    buffer += `<button class="cd-btn" href="/${module.id}/q/" data-type="page-transition" id="mod${module.id}">${module.name}</button>`
                }
            })
            fs.readFile("html/select.html", function (err, data) {
                if (buffer == "") {
                    //buffer = "<p>Pas de modules. Appuyez sur le <b>+</b> pour en ajouter!</p>"
                }
                res.send(data.toString().replace("{{buffer}}", buffer).replace("{{buffer2}}", buffer2))
            })
        })

    })
});


app.get('/:module/q/end', authUtils.basicAuth, function (req, res) {
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

	<link href='/css/fonts/fonts.css' rel='stylesheet' type='text/css'>

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


app.get('/:module/q/retake', authUtils.basicAuth, function (req, res) {
    if (req.user.questions[req.params.module] != undefined) {
        req.user.questions[req.params.module].answered = req.user.questions[req.params.module].right;
        req.user.questions[req.params.module].wrong = [];
    }


    res.redirect("/" + req.params.module + "/q/")
});

app.get('/:module/q/reset', authUtils.basicAuth, function (req, res) {
    if (req.user.questions[req.params.module] != undefined) {
        req.user.questions[req.params.module].answered = [];
        req.user.questions[req.params.module].right = [];
        req.user.questions[req.params.module].wrong = [];
    }

    res.redirect("/" + req.params.module + "/q/")
});

app.get('/:module/q/:id', authUtils.basicAuth, function (req, res) {
    question(req.params.module, req.params.id, req, res, function (data) {
        res.send(data);
    });
});

app.get('/:module/q', authUtils.basicAuth, function (req, res) {
    question(req.params.module, -1, req, res, function (data) {
        res.send(data);
    });
});
