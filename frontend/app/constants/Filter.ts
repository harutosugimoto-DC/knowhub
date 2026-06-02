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
    { label: "新着順", value: "newDesc" },
    { label: "古い順", value: "newAsc" },
    { label: "いいね多い順", value: "likesDesc" },
    { label: "いいね少ない順", value: "likesAsc" }
];