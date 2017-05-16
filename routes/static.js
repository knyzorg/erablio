/*
    This file takes care of routing for static files
*/

//Handle index page
app.get('/', (req, res) => {
    res.render("index");
});

app.get("/home", (req, res) => {
    res.render("index");
});

//Handle static files
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));

//Handle normal pages
app.get("/login.html", (req, res) => {
    res.render("login");
});

app.get("/about", (req, res) => {
    res.render("about");
});
app.get("/news", (req, res) => {
    res.render("news");
});