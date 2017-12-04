// @flow

const db = require("../util/db");
const fs = require("fs");
const secure = require("../util/secure");
const express = require("express")
const app = express.Router();
const multer  = require('multer')
const upload = multer({ dest: './tmp/' })

/* Modules */
app.get("/", (req: express$Request, res: express$Response) => {
    res.render("admin/status");
})

app.get("/modules", (req: express$Request, res: express$Response) => {
    db.getAllModules().then((modules) => {
        res.render("admin/pages/modules/list", { modules });
    })
})

app.get("/modules/new", (req: express$Request, res: express$Response) => {
    res.render("admin/pages/modules/edit", { moduleGroups: [], module: { owner: {} } });
})

app.get("/modules/:module/edit", (req: express$Request, res: express$Response) => {

    db.getAllModules({ id: req.params.module }).then((modules) => {
        if (modules.length) {
            const module = modules[0]
            res.render("admin/pages/modules/edit", { moduleGroups: [], module });
        }
    })
})


app.post("/upload/cover/:module", upload.single('cover'), (req: express$Request, res: express$Response) => {
    console.log(req);
    fs.rename("/tmp/" + req.file.filename, "public/img/" + req.params.module, (err)=>{
        res.redirect("/admin/modules")
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

    db.addModule(module)
        .then(() => res.redirect("/admin/modules/" + module.id + "/edit?status=added"))
        .catch((err) => console.log(err))

})

/* Questions */
app.get("/modules/:module", (req: express$Request, res: express$Response) => {
    const moduleName = req.params.module;
    db.getQuestions(moduleName)
        .then((questions) => res.render("admin/pages/questions/list", { moduleName, questions }))
        .catch((a) => console.log(a))
})

app.get("/modules/:module/edit/:qid", (req: express$Request, res: express$Response) => {
    const moduleName = req.params.module;
    const qid = isNaN(req.params.qid) ? 0 : +req.params.qid;
    db.getQuestionAnswers(moduleName, qid)
        .then((question) => {
            res.render("admin/pages/questions/edit", { question })
        })
})

app.get("/modules/:module/new/:qid?", (req: express$Request, res: express$Response) => {
    const moduleName = req.params.module;
    const qid = isNaN(req.params.qid) ? 0 : +req.params.qid;
    let question: QuestionAnswers = {
        answers: [],
        explain: {
            right: "",
            wrong: ""
        },
        id: qid,
        module: moduleName,
        title: "",
        type: 1
    }
    res.render("admin/pages/questions/edit", { question })

})

app.get("/modules/:module/delete/:id", (req: express$Request, res: express$Response) => {
    db.removeQuestion(req.params.module, +req.params.id).then(()=>{
        res.redirect("/admin/modules/" + req.params.module)
    })
})

app.get("/modules/:module/delete", (req: express$Request, res: express$Response) => {
    db.removeModule(req.params.module).then(()=>{
        res.redirect("/admin/modules/")
    })
})

app.post("/modules/:module/new", (req: express$Request, res: express$Response) => {
    const module = req.params.module;
    let title = req.body.title;
    let id = +req.body.id;
    let type = +req.body.type;
    let explain = {
        right: req.body.right,
        wrong: req.body.wrong
    }
    let answers = [];

    Object.keys(req.body).forEach((key) => {
        if (key.startsWith("answer")) {
            let index = key.substr(6);
            if (!answers[index])
                answers[index] = {}
            answers[index].text = req.body[key];
        }
        if (key.startsWith("code")) {
            let index = key.substr(4);
            if (!answers[index])
                answers[index] = {}
            answers[index].code = req.body[key];
        }
    })

    answers = answers.filter((a)=>!!a)

    let questionAnswers:QuestionAnswers = {title, module, id, type, explain, answers}

    db.addQuestion(questionAnswers)
        .then(()=>res.redirect("/admin/modules/" + module + "/edit/" + id))
})

module.exports = app;