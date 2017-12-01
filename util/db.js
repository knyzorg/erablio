// @flow

const dotize = require('dotize');
const dblite = require('dblite');
const db = dblite("data.sqlite");

function validateLogin(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.query("SELECT count(*) as 'exists' FROM `users_login` where `username`=? and `password`=?;",
            [username, password], { exists: Number },
            (err, rows: Array < {| exists: Number |}>) => {
        if (err) reject(new Error(err));
        resolve(rows[0].exists === 1)
    })
})
}

function moduleQuery(query: string, substitute: Array<string> | Object = []): Promise<Array<QuestionModule>> {
    const moduleTypings = {
        name: String,
        id: String,
        member: String,
        draft: Number,
        description: String,
        seo: String,
        "owner.name": String,
        "owner.group": String
    }
    return new Promise((resolve, reject) => {
        db.query(query, substitute, moduleTypings,
            (err, rows: Array<Object>) => {
                if (err) return reject(new Error(err));
                rows.forEach((row: Object) => {
                    row.owner = {
                        name: row["owner.name"],
                        group: row["owner.group"]
                    }
                    row.member = row.member.split("|")
                    delete row["owner.name"]
                    delete row["owner.group"]
                })
                resolve(rows)
            })
    })
}

function filterToWhere(filter: ModuleFilter): string {
    delete filter["e"];
    let whereFilter = "where";
    let flatFilter = dotize.convert(filter);
    Object.keys(flatFilter).forEach((key) => {
        whereFilter += " `" + sqlesc(key) + "` = '" + sqlesc(flatFilter[key]) + "' AND ";
    })
    whereFilter += " 1=1"
    return whereFilter;
}

function getAllModules(filter: ModuleFilter = { e: 1 }): Promise<Array<QuestionModule>> {
    let whereFilter = filterToWhere(filter);
    let query = "SELECT * FROM `modules` " + whereFilter;
    return moduleQuery(query)
}


function getActiveModules(): Promise<Array<QuestionModule>> {
    return getAllModules({ draft: 0 })
}

function getUserModules(username: string, filter: Object = {}): Promise<Array<QuestionModule>> {

    let whereFilter = filterToWhere(filter);
    let userFilter = " `id` in (SELECT `module` from `user_modules` where `username` = ?)";
    let query = "SELECT * FROM `modules` " + whereFilter + userFilter;
    return moduleQuery(query, [username]);

}

function addUserModule(username: string, module: string): Promise<null> {
    return new Promise((resolve, reject) => {
        db.query("INSERT into `user_modules` (`username`, `module`) VALUES (?, ?)", [username, module],
            (err) => {
                if (err) {
                    return reject(new Error(err))
                }
                resolve(null)
            })
    })
}

function removeUserModule(username: string, module: string): Promise<null> {
    return new Promise((resolve, reject) => {
        db.query("DELETE from `user_modules` where `username` = ? and `module` = ?;", [username, module], (err: string | null, rows) => {
            if (err)
                return reject(new Error(err))
            resolve(null);
        })
    })
}

function getQuestionData(module: string, id: number): Promise<QuestionData> {
    return new Promise((resolve, reject) => {
        db.query("SELECT * from `questions` where `module`=? and id=?",
            [module, id], {
                title: String,
                module: String,
                id: Number,
                "explain.wrong": String,
                "explain.right": String,
                type: Number
            }, (err, question) => {
                db.query("SELECT `text`,`code` from `questions_answers` where `module`=? and id=?",
                    [module, id], {
                        text: String,
                        code: Number
                    }, (err, answers) => {
                        let questionData: QuestionData = {
                            title: question.title,
                            module: question.module,
                            id: question.id,
                            type: question.type,
                            explain: {
                                wrong: question["explain.wrong"],
                                right: question["explain.right"]
                            },
                            answers: answers
                        }
                        resolve(questionData);
                    })
            })
    })
}

function addQuestion(questionData: QuestionData): Promise<null> {
    return new Promise((resolve, reject) => {

        questionData.answers.forEach((answer, index) => {
            db.query("INSERT into `questions_answers` (`module`, `id`, `text`, `code`) VALUES (?, ?, ?, ?)",
                [questionData.module, questionData.id, answer.text, answer.code],
                (err) => {
                    if (err) {
                        return reject(new Error(err))
                    }
                    if (index == questionData.answers.length - 1) {

                        db.query("INSERT into `questions` (`title`, `module`, `id`, `explain.wrong`, `explain.right`, `type`) VALUES (?, ?, ?, ?, ?, ?)",
                            [questionData.title, questionData.module, questionData.id, questionData.explain.wrong, questionData.explain.right, questionData.type],
                            (err) => {
                                if (err) {
                                    return reject(new Error(err))
                                }
                                resolve(null)
                            })

                    }

                })
        })
    })
}

function sqlesc(a: any): any {
    if (typeof a !== 'string') {
        return a;
    }
    return a.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (b) => {
        switch (b) {
            case "\0":
                return "\\0";
            case "\b":
                return "\\b";
            case "\t":
                return "\\t";
            case "":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case '"':
            case "'":
            case "\\":
            case "%":
                return "\\" + a
        }
    })
}

module.exports = {
    removeUserModule,
    addUserModule,
    getUserModules,
    getActiveModules,
    getAllModules,
    validateLogin,
    addQuestion,
    getQuestionData
}