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
        if (err){
            res.send("Module does not exist")
            return;
        }
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
