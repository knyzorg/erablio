/**
 * Get a list of module objects
 * @param {Function} callback Function to callback with an array of JSON Objects describing modules
 */
function getModules(callback) {
    //Track module objects
    let modules = [];

    //Get all modules
    fs.readdir("questions", (err, files) => {

        //Keep only .json files
        let moduleFiles = files.filter((fname) => (fname.includes(".json")))

        moduleFiles.forEach((fname, findex) => {
            fs.readFile("questions/" + fname, (err, data) => {
                //File is legit, push
                modules.push(JSON.parse(data))

                //Read all module files?
                if (modules.length === moduleFiles.length) {
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
    let path = "userconfig/" + user;
    if (fs.existsSync(path)) {
        fs.readFile(path, (err, data) => {
            console.log(JSON.parse(data));

            return callback(JSON.parse(data));
        })
        callback([]);
    }
}
/**
 * Handles module enable/disable
 */
app.get("/addmod/:modid", authUtils.basicAuth, (req, res) => {
    fs.readFile("userconfig/" + req.user.username, (err, data) => {
        //If file doesn't exist, pretend it does and is empty. It will be created anyways.
        let json = err ? [] : JSON.parse(data)
        //Abandon ship if exists already
        if (json.indexOf(req.params.modid) !== -1) return;
        //Enable module
        json.push(req.params.modid)
        //Save config
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

app.get("/remmod/:modid", authUtils.basicAuth, (req, res) => {
    fs.readFile("userconfig/" + req.user.username, (err, data) => {
        //File doesn't exist?? Wtf how are you removing a module then go away
        if (err) return;
        let json = JSON.parse(data)
        //Module isn't enabled?? Wtf how are you removing it then go away
        if (json.indexOf(req.params.modid) === -1) return;
        //Remove module
        json.splice(json.indexOf(req.params.modid), 1)
        //Save it
        fs.writeFile("userconfig/" + req.user.username, JSON.stringify(json), () => { })
    })
    res.send("OK")
})

app.get("/module", authUtils.basicAuth, (req, res) => {
    let renderModules = [];
    getUserModules(req.user.username, (enabled) => {
        getModules((modules) => {
            modules.forEach((module) => {

                //Set module as enabled if member of enabled array
                module.enabled = (enabled.indexOf(module.id) !== -1)
                renderModules.push(module)

            })

            res.render("modules", { modules: renderModules })
        })
    })
})