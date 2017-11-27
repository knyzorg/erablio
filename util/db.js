// @flow

const dotize = require('dotize');
const dblite = require('dblite');
const db = dblite("data.sqlite");

function validateLogin(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.query("SELECT count(*) as 'exists' FROM `users_login` where `username`=? and `password`=?;",
            [username, password], { exists: Number },
            (err, rows: Array<{| exists: Number |}>) => {
                if (err) reject(new Error(err));
                resolve(rows[0].exists === 1)
            })
    })
}



function getAllModules(filter:Object = {}): Promise<Array<QuestionModule>> {
    return new Promise((resolve, reject) => {
        let whereFilter = "where";
        let flatFilter = dotize.convert(filter);
        Object.keys(flatFilter).forEach((key) => {
            whereFilter += " `" + sqlesc(key) + "` = '" + sqlesc(flatFilter[key]) + "' AND ";
        })
        whereFilter += " 1=1;"

        db.query("SELECT * FROM `modules`" + whereFilter,
            {
                name: String,
                id: String,
                member: String,
                draft: Number,
                description: String,
                seo: String,
                "owner.name": String,
                "owner.group": String
            },
            (err, rows: Array<Object>) => {
                if (err) reject(new Error(err));
                rows.forEach((row: Object) => {
                    row.owner = {
                        name: row["owner.name"],
                        group: row["owner.group"]
                    }
                    row.member = row.member.split("|")
                    delete row["owner.name"],
                        delete row["owner.group"]
                })
                resolve(rows)
            })
    })
}


function getActiveModules(): Promise<Array<QuestionModule>> {
    return new Promise((resolve, reject) => {
        getAllModules({ draft: 0 }).then((a) => resolve(a))
    })
}

function getUserModules(username:string, filter:Object = {}): Promise<Array<QuestionModule>> {
    return new Promise((resolve, reject) => {
        let whereFilter: string = "where";
        let flatFilter: Object = dotize.convert(filter);

        Object.keys(flatFilter).forEach((key) => {
            whereFilter += " `" + sqlesc(key) + "` = '" + sqlesc(flatFilter[key]) + "' AND ";
        })
        whereFilter += " `id` in (SELECT `module` from `user_modules` where `username` = ?);"

        db.query("SELECT * FROM `modules`" + whereFilter, [username],
            {
                name: String,
                id: String,
                member: String,
                draft: Number,
                description: String,
                seo: String,
                "owner.name": String,
                "owner.group": String
            },
            (err, rows: Array<Object>) => {
                if (err) reject(new Error(err));
                rows.forEach((row: Object) => {
                    row.owner = {
                        name: row["owner.name"],
                        group: row["owner.group"]
                    }
                    row.member = row.member.split("|")
                    delete row["owner.name"],
                        delete row["owner.group"]
                })
                resolve(rows)
            })
    })
}

function addUserModule(username: string, module: string): Promise<null> {
    return new Promise((resolve, reject) => {
        db.query("INSERT into `user_modules` (`username`, `module`) VALUES (?, ?)", [ username, module ],
        (err)=>{
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

function sqlesc(a: any): any {
    if (typeof a != 'string') {
        return a;
    }
    return a.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (a: string) {
        switch (a) {
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
    validateLogin
}