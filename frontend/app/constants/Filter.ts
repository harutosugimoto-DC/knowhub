export const MY_ACTIONS: ({ id: ('my_questions' | 'my_answers' | 'my_solved' | 'bookmarked'), name: string })[] = [
    {
        id: 'my_questions',
        name: "自分の質問"
    },
    {
        id: 'my_answers',
        name: "自分が回答"
    },
    {
        id: 'my_solved',
        name: "自分が解決"
    },
    {
        id: 'bookmarked',
        name: "ブックマーク"
    }]
export const DROP_DOWN_OPTIONS = [
    { label: "投稿日降順", value: "newDesc" },
    { label: "投稿日昇順", value: "newAsc" },
    { label: "いいね数降順", value: "likesDesc" },
    { label: "いいね数昇順", value: "likesAsc" }
];