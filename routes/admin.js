// @flow

const db = require("../util/db");
const secure = require("../util/secure");
const express = require("express")
const app = express.Router();

app.get("/", (req: express$Request, res: express$Response) => {
    res.render("admin/status");
})

app.get("/modules", (req: express$Request, res: express$Response) => {
    db.getAllModules().then((modules) => {
        res.render("admin/modules", { modules });
    })
})

app.get("/modules/new", (req: express$Request, res: express$Response) => {
    res.render("admin/module-new", { moduleGroups: [], module: { owner: {} } });
})

app.get("/modules/edit/:module", (req: express$Request, res: express$Response) => {

    db.getAllModules({ id: req.params.module }).then((modules) => {
        if (modules.length) {
            const module = modules[0]
            res.render("admin/module-new", { moduleGroups: [], module });
        }
    })
})

app.post("/modules/new", (req: express$Request, res: express$Response) => {
    let name = req.body.name;
    let id = req.body.id;
    let member = req.body.members;
    let draft = !!req.body.draft;
    let description = req.body.description;
    let seo = req.body.seo;
    let owner = {
        name: req.body.ownerName,
        group: req.body.ownerGroup
    }
    if (!member) {
        member = [];
    }
    if (typeof member == 'string') {
        member = [member]
    }
    if (!owner.group) {
        owner.group = "";
    }
    if (!owner.name) {
        owner.name = "";
    }

    if (!description) {
        description = "";
    }

    let module = { name, id, member, draft, description, seo, owner };
    console.log(module)
    db.addModule(module)
        .then(() => res.redirect("/admin/modules/edit/" + module.id + "?status=added"))
        .catch((err) => console.log(err))

})

app.get("/modules/:module", (req: express$Request, res: express$Response) => {
    const moduleName = req.param.moduleName;
    db.getQuestions(moduleName)
        .then((questions) => res.render("questions", { moduleName, questions }))
})
module.exports = app;