/*
    Core app logic
    TODO: Unbundle module and quiz routes and functions
*/

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
                if (modules.length == files.length - rejected) {
                    callback(modules);
                }
            });
        });
    });
}
/**
 * Gets an array of a user's enabled modules
 * @param {String} user Username of user
 * @param {Function} callback 
 */
//TODO: Requires refactoring. Current settings storage is deficient.
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
 * Generates quiz question html and automatically handles the response
 * @param {String} module Name of module stored in /questions
 * @param {Number} [id=-1] The id of the question
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 */
function question(module, id = -1, req, res) {
    if (req.user.questions[module] == undefined) {
        req.user.questions[module] = {};
        req.user.questions[module].right = [];
        req.user.questions[module].wrong = [];
        req.user.questions[module].answered = [];
    }

    fs.readdir("questions/" + module, function (err, files) {
        if (id == -1) {

            if (files.length == req.user.questions[module].answered.length) {
                res.redirect("/" + module + "/q/end");
                return;
            }

            let unanswered = [];
            for (let qid = 1; qid != files.length + 1; qid++) {
                if (req.user.questions[module].answered.indexOf(qid.toString()) == -1) {
                    unanswered.push(qid.toString());
                }
            }
            console.log("Available unanswered questions", unanswered);
            id = utils.randomArray(unanswered);
            console.log("Selected", id);

            /*while (req.user.questions[module].answered.indexOf(id.toString()) !== -1) {
                id = utils.randomInt(1, files.length)
            }*/
        }
        console.log("Answering", id);

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

                let availableQuestions = [];
                for (let qid = 1; qid != files.length + 1; qid++) {
                    if (req.user.questions[module].answered.indexOf(qid.toString()) == -1 && qid != id) {
                        console.log("Logic test", qid, id, qid != id)
                        availableQuestions.push(qid.toString());
                    }
                }

                console.log("Next Q candidates", availableQuestions)

                var nextQuestion = availableQuestions.length ? utils.randomArray(availableQuestions) : "end";
                console.log("Selected", nextQuestion)
                //var nextQuestion = utils.randomInt(1, files.length).toString();

                //Logic:  Is this the last question? (Only one question unanswered) AND is this THE unanswered question?
                /*if (req.user.questions[module].answered.length + 1 == files.length && req.user.questions[module].answered.indexOf(id.toString()) === -1) {

                    console.log("Quiz is over, next page is result", req.user.questions[module].answered.indexOf(id.toString()))

                    nextQuestion = "end";

                }

                while (req.user.questions[module].answered.indexOf(nextQuestion) !== -1 || nextQuestion == id) {
                    console.log(nextQuestion, "is present. Changing.");
                    nextQuestion = utils.randomInt(1, files.length).toString();
                }
                console.log(nextQuestion, "is not in", JSON.stringify(req.user.questions[module].answered));*/

                res.render("question", {
                    question: quizData.question,
                    id: id,
                    module: module,
                    options: quizData.options,
                    silentOptions: utils.base64Encode(JSON.stringify(quizData.options)),
                    quizData: utils.base64Encode(JSON.stringify(quizData)),
                    token: utils.newToken(),
                    next: nextQuestion,
                    timestamp: Date.now(),
                    questionNumber: req.user.questions[module].answered.length + 1,
                    totalQuestions: files.length
                })
            });
        });
    });
}

app.get("/addmod/:modid", authUtils.basicAuth, function (req, res) {
    fs.readFile("userconfig/" + req.user.username, function (err, data) {
        var json = err ? [] : JSON.parse(data)
        json.push(req.params.modid)
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

app.get("/remmod/:modid", authUtils.basicAuth, function (req, res) {
    fs.readFile("userconfig/" + req.user.username, function (err, data) {
        var json = err ? [] : JSON.parse(data)
        delete json[json.indexOf(req.params.modid)]
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

//TODO: Redo entire /module page, it's utter crap
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
    console.log("Answered=", req.user.questions[req.params.module].answered.length)
    console.log("Number of wsad", fs.readdirSync("questions/" + req.params.module).length)
    if (req.user.questions[req.params.module].answered.length == fs.readdirSync("questions/" + req.params.module).length) {
        console.log("End valid")
        res.render("quizend", {
            percent: Math.round(req.user.questions[req.params.module].right.length * 100 / fs.readdirSync('questions/' + req.params.module).length) + "%",
            bracket: parseInt(10 * req.user.questions[req.params.module].right.length / fs.readdirSync("questions/" + req.params.module).length)
        });
        return;
    }
    res.redirect("/" + req.params.module + "/q/")
});


app.get('/:module/q/retake', authUtils.basicAuth, function (req, res) {
    if (req.user.questions[req.params.module] !== undefined) {
        req.user.questions[req.params.module].answered = req.user.questions[req.params.module].right;
        req.user.questions[req.params.module].wrong = [];
    }


    res.redirect("/" + req.params.module + "/q/")
});

app.get('/:module/q/reset', authUtils.basicAuth, function (req, res) {
    if (req.user.questions[req.params.module] !== undefined) {
        req.user.questions[req.params.module].answered = [];
        req.user.questions[req.params.module].right = [];
        req.user.questions[req.params.module].wrong = [];
    }

    res.redirect("/" + req.params.module + "/q/")
});

app.get('/:module/q/:id', authUtils.basicAuth, function (req, res) {
    question(req.params.module, req.params.id, req, res);
});

app.get('/:module/q', authUtils.basicAuth, function (req, res) {
    question(req.params.module, -1, req, res);
});
