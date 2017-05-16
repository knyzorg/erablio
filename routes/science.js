app.post('/science', authUtils.basicAuth, (req, res) => {

    //Result endpoint
    fs.readFile(appRoot + "/questions/" + req.body.quiz + "/" + req.body.qid + ".json", { encoding: 'utf-8' },
        (err, data) => {
            if (err || !utils.isJsonString(utils.base64Decode(req.body.options))) {
                //console.log("Error could not read file for validation")
                return res.send("Error");
            }
            //console.log("OK");
            data = JSON.parse(data);

            let optionsShuffled = JSON.parse(utils.base64Decode(req.body.options));
            //console.log(optionsShuffled);
            //Get value of shuffled
            let unshufa = -1;
            optionsShuffled.forEach((v, i, a) => {
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
                req.user.questions[results.set][results.pass ? "right" : "wrong"].push(results.qid.toString());
            }



            //Implement sqlite logger
            db.query('INSERT INTO quiz VALUES (:qid, :time, :set, :spent, :user, :alttab, :answer, :pass, :correct, :key, :agent)', results);
            res.send("Data Submitted for Analysis");

        })

});
