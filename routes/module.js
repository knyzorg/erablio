/**
 * Get a list of module objects
 * @param {Function} callback Function to callback with an array of JSON Objects describing modules
 */
function getModules(callback) {
    //Track module objects
    var modules = [];

    //Get all modules
    fs.readdir("questions", function (err, files) {
        rejected = 0;
        files.forEach(function (fname, findex) {
            //Reject all non-module files
            if (!fname.includes(".json")) {
                rejected++;
                return;
            }
            fs.readFile("questions/" + fname, function (err, data) {
                //File is legit, push
                modules.push(JSON.parse(data))
                //Read all module files?
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
        //If file doesn't exist, pretend it does and is empty. It will be created anyways.
        var json = err ? [] : JSON.parse(data)
        //Abandon ship if exists already
        if (json.indexOf(req.params.modid) !== -1) return;
        //Enable module
        json.push(req.params.modid)
        //Save config
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

app.get("/remmod/:modid", authUtils.basicAuth, function (req, res) {
    fs.readFile("userconfig/" + req.user.username, function (err, data) {
        //File doesn't exist?? Wtf how are you removing a module then go away
        if (err) return;
        var json = JSON.parse(data)
        //Module isn't enabled?? Wtf how are you removing it then go away
        if (json.indexOf(req.params.modid) === -1) return;
        //Remove module
        json.splice(json.indexOf(req.params.modid), 1)
        //Save it
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

app.get("/module", authUtils.basicAuth, function (req, res) {
    var renderModules = [];
    getUserModules(req.user.username, function (enabled) {
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