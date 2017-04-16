/*
    This file takes care of routing for static files
*/

app.get('/', function (req, res) {
    res.render("index");
});

app.get("/home", function (req, res) {
    res.render("index");
});

app.use('/css', express.static('css'));

// oeil-4.png
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));


app.get("/login.html", function (req, res) {
    res.render("login");
});





app.get("/about", function (req, res) {
   res.render("about");
});
app.get("/news", function (req, res) {
    res.render("news");
});