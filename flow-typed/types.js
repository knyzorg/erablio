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

declare type QuestionData = {
    title: string,
    module: string,
    id: number,
    type: number,
    explain: {
        wrong: string,
        right: string
    }
}

declare type QuestionAnswers = QuestionData & {
    answers: Array<{text: string, code:number}>
}

declare type QuestionList = Array<QuestionData>