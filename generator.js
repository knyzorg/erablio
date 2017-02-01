var express = require('express');
var fs = require('fs')
var Crypto = require('crypto')
var app = express();

app.use(require('body-parser').urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/generator.html")
});

app.post('/submit', function (req, res) {
    if (req.body.qid>fs.readdirSync("questions/" + req.body.module).length){
        res.send("ERROR");
        return;
    }
    if (+req.body.qid == 0){
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