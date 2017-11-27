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

declare type Binary = 0 | 1