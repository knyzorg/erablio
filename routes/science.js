app.post('/science', authUtils.basicAuth, function (req, res) {

    //Result endpoint
    fs.readFile(appRoot + "/questions/" + req.body.quiz + "/" + req.body.qid + ".json", { encoding: 'utf-8' },
        function (err, data) {
            if (err) {
                //console.log("Error could not read file for validation")
                res.send("Error");
                return 0;
            }
            //console.log("OK");
            data = JSON.parse(data);

            //Unshuffle results
            if (!utils.isJsonString(utils.base64Decode(req.body.options))) {
                //console.log("Not valid JSON");
                return 0;
            }
            let optionsShuffled = JSON.parse(utils.base64Decode(req.body.options));
            //console.log(optionsShuffled);
            //Get value of shuffled
            let unshufa = -1;
            optionsShuffled.forEach(function (v, i, a) {
                if (data.options[i] == optionsShuffled[req.body.answer]) {
                    unshufa = i;
                }
            });

            //Define result set
            let results = {
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


            //Make sure results are defined
            if (req.user.questions[results.set] == undefined) {
                req.user.questions[results.set] = {};
            }

            //Make REALLY fucking sure they are defined
            if (req.user.questions[results.set].wrong == undefined || req.user.questions[results.set].wrong == undefined) {
                req.user.questions[results.set].wrong = [];
                req.user.questions[results.set].right = [];
            }

            //Modify session data for next questions
            if (req.user.questions[results.set].answered.indexOf(results.qid.toString()) === -1) {
                req.user.questions[results.set].answered.push(results.qid.toString());
                if (results.pass) {
                    req.user.questions[results.set].right.push(results.qid.toString());
                } else {
                    req.user.questions[results.set].wrong.push(results.qid.toString());
                }
            }



            //Implement sqlite logger
            db.query('INSERT INTO quiz VALUES (:qid, :time, :set, :spent, :user, :alttab, :answer, :pass, :correct, :key, :agent)', results);
            res.send("Data Submitted for Analysis");

        })

});
