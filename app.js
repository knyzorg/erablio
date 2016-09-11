var express = require('express');
var cookieParser = require('cookie-parser')
var app = express();
var request = require('request');
app.use(cookieParser())




app.get('/', function(req, res) {
    if (req.cookies.id) {

    }
    res.send('Hello World!');
});

app.get('/quiz', function(req, res) {
    //Question endpoint
    
});

app.get('/quiz', function(req, res) {
    //Result endpoint

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
