declare type QuestionModule = {|
    name: string,
    id: string,
    member: Array<string>,
    draft: boolean,
    description: string,
    seo: string,
    enabled?: boolean,
    owner: {
        name: string,
        group: string
    }
|};

declare type ModuleFilter = {|
    name?: string,
    id?: string,
    member?: Array<string>,
    draft?: number,
    description?: string,
    seo?: string,
    owner?: {
        name?: string,
        group?: string
    },
    e?: any;
|};

declare type QuestionData = {|
    title: String,
    module: String,
    id: Number,
    explain: {
        wrong: String,
        right: String
    },
    answers: Array<{text: string, code:Number}>
|};
