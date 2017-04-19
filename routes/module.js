/**
 * Get a list of module objects
 * @param {Function} callback 
 */
function getModules(callback) {
    var modules = [];
    fs.readdir("questions", function (err, files) {
        rejected = 0;
        files.forEach(function (fname, findex) {
            if (!fname.includes(".json")) {
                //File is folder - Ignore
                console.log("Rejecting folder", fname)
                rejected++;
                return;
            }
            fs.readFile("questions/" + fname, function (err, data) {
                //
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
 * Handles module enable/disable
 */
app.get("/addmod/:modid", authUtils.basicAuth, function (req, res) {
    fs.readFile("userconfig/" + req.user.username, function (err, data) {
        var json = err ? [] : JSON.parse(data)
        if (json.indexOf(req.params.modid) !== -1) return;
        json.push(req.params.modid)
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

app.get("/remmod/:modid", authUtils.basicAuth, function (req, res) {
    fs.readFile("userconfig/" + req.user.username, function (err, data) {
        if (err) return;
        var json = JSON.parse(data)
        if (json.indexOf(req.params.modid) === -1) return;
        json.splice(json.indexOf(req.params.modid), 1)
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

app.get("/module", authUtils.basicAuth, function (req, res) {
    var renderModules = [];
    getUserModules(req.user.username, function (enabled) {
        //getUserModules("vknyazev", function (enabled) {
        getModules(function (modules) {
            modules.forEach(function (module) {
                if (enabled.indexOf(module.id) !== -1) {
                    //Module is enabled
                    module.enabled = true
                    renderModules.push(module)
                } else {
                    //Module is disabled
                    module.enabled = false
                    renderModules.push(module)
                }
            })
            res.render("modules", { modules: renderModules })
        })
    })
})