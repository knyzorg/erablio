/**
 * Generates quiz question html and automatically handles the response
 * @param {String} module Name of module stored in /questions
 * @param {Number} [id=-1] The id of the question
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 */
function question(module, id = -1, req, res) {
    if (req.user.questions[module] == undefined) {
        //Make sure module questions are defined
        req.user.questions[module] = {};
        req.user.questions[module].right = [];
        req.user.questions[module].wrong = [];
        req.user.questions[module].answered = [];
    }

    fs.readdir("questions/" + module, function (err, files) {
        if (err) {
            //Module does not exist, list all available
            res.redirect("/module")
            return;
        }

        if (id == -1) {
            //Question ID has not been defined

            if (files.length == req.user.questions[module].answered.length) {
                //All questions have been answered, redirect to quiz end
                res.redirect("/" + module + "/q/end");
                return;
            }

            //Find unanswered questions
            let unanswered = [];
            for (let qid = 1; qid != files.length + 1; qid++) {
                if (req.user.questions[module].answered.indexOf(qid.toString()) == -1) {
                    unanswered.push(qid.toString());
                }
            }

            //Select random unanswered question
            id = utils.randomArray(unanswered);

        }

        //ID now has a real value, load question

        fs.readFile("questions/" + module + "/" + id + ".json", { encoding: 'utf-8' }, function (err, quizJsonRaw) {
            if (err) {
                //Requested question does not exist, redirect to random one
                res.redirect("/" + module + "/q/");
                return;
            };

            let quizData = JSON.parse(quizJsonRaw);
            quizData.meta = { id: id, module: module };

            //Get correct answer text
            let correct = quizData.options[quizData.answer];

            //Shuffle Options
            quizData.options = utils.shuffleArray(quizData.options);

            //Find new position
            quizData.answer = quizData.options.indexOf(correct)

            //Get next question
            let availableQuestions = [];
            for (let qid = 1; qid != files.length + 1; qid++) {
                //Must not be current, must not have been answered
                if (req.user.questions[module].answered.indexOf(qid.toString()) === -1 && qid != id) {
                    //Meets conditions
                    availableQuestions.push(qid.toString());
                }
            }

            //If non-zero, get random. If zero, set to end.        
            let nextQuestion = availableQuestions.length ? utils.randomArray(availableQuestions) : "end";

            //Render Question page
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
}

app.get('/:module/q/end', authUtils.basicAuth, function (req, res) {
    if (!req.user.questions[req.params.module]) {
        //This condition catches fake/untouched modules
        res.redirect("/" + req.params.module + "/q/")
        return;
    }
    fs.readdir("questions/" + req.params.module, function (err, files) {
        //Did you *really* finish?
        if (req.user.questions[req.params.module].answered.length == files.length) {
            //You did!
            res.render("quizend", {
                percent: Math.round(req.user.questions[req.params.module].right.length * 100 / files.length) + "%",
                bracket: parseInt(10 * req.user.questions[req.params.module].right.length / files.length)
            });

            if (!req.user.questions[req.params.module].finished) {
                req.user.questions[req.params.module].finished = true;
                db.query('INSERT INTO verdicts VALUES (:user, :time, :set, :key, :right, :wrong, :wronglist, :rightlist, :grade)', {
                    user: req.user.username,
                    time: Date.now(),
                    set: req.params.module,
                    key: utils.newToken(),
                    rightlist: req.user.questions[req.params.module].right.toString(),
                    wronglist: req.user.questions[req.params.module].wrong.toString(),
                    right: +req.user.questions[req.params.module].right.length,
                    wrong: +req.user.questions[req.params.module].wrong.length,
                    grade: +req.user.questions[req.params.module].right.length * 100 / +req.user.questions[req.params.module].answered.length
                });
            }
            return;
        }
        //You didn't. Go do it!
        res.redirect("/" + req.params.module + "/q/")
    })

});


app.get('/:module/q/retake', authUtils.basicAuth, function (req, res) {
    if (req.user.questions[req.params.module] !== undefined) {
        //Answered questions are right questions
        req.user.questions[req.params.module].answered = req.user.questions[req.params.module].right;
        //No more wrong questions
        req.user.questions[req.params.module].wrong = [];
    }

    req.user.questions[req.params.module].finished = false;
    //Restart
    res.redirect("/" + req.params.module + "/q/")
});

app.get('/:module/q/reset', authUtils.basicAuth, function (req, res) {
    if (req.user.questions[req.params.module] !== undefined) {
        //Reset module questions tbh
        req.user.questions[req.params.module].answered = [];
        req.user.questions[req.params.module].right = [];
        req.user.questions[req.params.module].wrong = [];
    }

    req.user.questions[req.params.module].finished = false;

    //Restart
    res.redirect("/" + req.params.module + "/q/")
});

app.get('/:module/q/:id', authUtils.basicAuth, function (req, res) {
    //Send random question
    question(req.params.module, req.params.id, req, res);
});

app.get('/:module/q', authUtils.basicAuth, function (req, res) {
    //Question id isn't defined. Pass -1
    question(req.params.module, -1, req, res);
});
