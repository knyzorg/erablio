/*
    This file takes care of routing for static files
*/

//Handle index page
app.get('/', function (req, res) {
    res.render("index");
});

app.get("/home", function (req, res) {
    res.render("index");
});

//Handle static files
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));

//Handle normal pages
app.get("/login.html", function (req, res) {
    res.render("login");
});

app.get("/about", function (req, res) {
   res.render("about");
});
app.get("/news", function (req, res) {
    res.render("news");
});