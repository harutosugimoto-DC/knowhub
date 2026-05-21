import { type QuestionType } from "@/types/question";

// contentプロパティを許容するように型を拡張
type MockQuestionType = QuestionType & { content?: string };

export const questionsMockData: MockQuestionType[] = [
    {
        title: "ECS Fargateでタスクが起動しない理由が知りたい",
        statusId: 1, // 回答募集中
        isLiked: false,
        isBookmarked: true,
        userName: "テラコヤ太郎",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
        likeCount: 3,
        bookmarkCount: 3,
        replyCount: 2,
        tagNames: ["AWS", "ECS", "Fargate"],
        content: "現在、AWS ECS (Fargate) を利用して新規プロジェクトのコンテナ基盤を構築していますが、デプロイしたタスクが正常に実行されず、数秒から数十秒で「STOPPED」状態になってしまう現象に悩まされています。ログを確認しても特に致命的なエラーが出ておらず原因特定に苦戦しています。タスク定義やセキュリティグループの確認ポイントがあれば教えていただきたいです。",
    },
    {
        title: "ReactのuseEffectが2回実行されるのを防ぎたいです",
        statusId: 3, // 解決済み
        isLiked: true,
        isBookmarked: false,
        userName: "ハッカーキッズ",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
        likeCount: 42,
        bookmarkCount: 15,
        replyCount: 8,
        tagNames: ["React", "JavaScript"],
        content: "Next.jsの開発環境（Strict Mode）で、useEffect内のデータフェッチが2回走ってしまいます。本番環境では1回になることは認識していますが、開発中にAPIサーバーに2倍負荷がかかるのが気になります。何か良い回避策や、ベストプラクティスはありますでしょうか？",
    },
    {
        title: "TypeScriptでコンポーネントのPropsの型を厳密に定義する方法",
        statusId: 2, // 整理中
        isLiked: false,
        isBookmarked: false,
        userName: "型安全第一",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3日前
        likeCount: 12,
        bookmarkCount: 4,
        replyCount: 1,
        tagNames: ["TypeScript", "React"],
        content: "MUIのコンポーネントをラップしたカスタムコンポーネントを作っています。MUIアイコンだけをPropsとして厳密に受け取るために SvgIconComponent を使ってみましたが、自作のSVGも許容したい場合にどう拡張すべきか迷っています。インターフェースの設計思想についてアドバイスが欲しいです。",
    },
    {
        title: "Next.js (App Router) でのコンポーネント設計について",
        statusId: 1, // 回答募集中
        isLiked: true,
        isBookmarked: true,
        userName: "Nextマスター",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1週間前
        likeCount: 25,
        bookmarkCount: 9,
        replyCount: 0,
        tagNames: ["Next.js", "App Router"],
        content: "Server ComponentとClient Componentの切り分け基準についての質問です。基本的にはServer Componentで組み、インタラクティブな要素だけをClient Componentとして切り出す方針で進めていますが、状態管理（Context）が必要になった場合のファイル配置で悩んでいます。",
    },
    {
        title: "Tailwind CSSで要素を中央寄せにする一番シンプルな書き方",
        statusId: 3, // 解決済み
        isLiked: false,
        isBookmarked: false,
        userName: "初心者マーク",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5時間前
        likeCount: 0,
        bookmarkCount: 1,
        replyCount: 3,
        tagNames: ["TailwindCSS", "CSS"],
        content: "短い質問です。フレックスボックスを使う方法以外に、グリッド（grid）を使った中央寄せのほうが記述量が少なくなるという噂を聞いたのですが本当ですか？具体的なクラス名を教えてください！", // 3行未満の短いテキストテスト用
    },
    {
        title: "Prismaのマイグレーションが本番環境で失敗した時の対処法",
        statusId: 1, // 回答募集中
        isLiked: true,
        isBookmarked: false,
        userName: "インフラ迷子",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2週間前
        likeCount: 8,
        bookmarkCount: 2,
        replyCount: 6,
        tagNames: ["Prisma", "PostgreSQL", "Database"],
        content: "本番環境のデータベース（PostgreSQL）に対して prisma migrate deploy を実行したところ、一部のデータ整合性エラーが原因でロールバックされてしまいました。すでに動いている本番環境で、既存データを壊さずにスキーマを修正する際の手順や注意点、皆さんがやっている運用方法を教えてください。",
    }, {
        title: "ECS Fargateでタスクが起動しない理由が知りたい",
        statusId: 1, // 回答募集中
        isLiked: false,
        isBookmarked: true,
        userName: "テラコヤ太郎",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
        likeCount: 3,
        bookmarkCount: 3,
        replyCount: 2,
        tagNames: ["AWS", "ECS", "Fargate"],
        content: "現在、AWS ECS (Fargate) を利用して新規プロジェクトのコンテナ基盤を構築していますが、デプロイしたタスクが正常に実行されず、数秒から数十秒で「STOPPED」状態になってしまう現象に悩まされています。ログを確認しても特に致命的なエラーが出ておらず原因特定に苦戦しています。タスク定義やセキュリティグループの確認ポイントがあれば教えていただきたいです。",
    },
    {
        title: "ReactのuseEffectが2回実行されるのを防ぎたいです",
        statusId: 3, // 解決済み
        isLiked: true,
        isBookmarked: false,
        userName: "ハッカーキッズ",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
        likeCount: 42,
        bookmarkCount: 15,
        replyCount: 8,
        tagNames: ["React", "JavaScript"],
        content: "Next.jsの開発環境（Strict Mode）で、useEffect内のデータフェッチが2回走ってしまいます。本番環境では1回になることは認識していますが、開発中にAPIサーバーに2倍負荷がかかるのが気になります。何か良い回避策や、ベストプラクティスはありますでしょうか？",
    },
    {
        title: "TypeScriptでコンポーネントのPropsの型を厳密に定義する方法",
        statusId: 2, // 整理中
        isLiked: false,
        isBookmarked: false,
        userName: "型安全第一",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3日前
        likeCount: 12,
        bookmarkCount: 4,
        replyCount: 1,
        tagNames: ["TypeScript", "React"],
        content: "MUIのコンポーネントをラップしたカスタムコンポーネントを作っています。MUIアイコンだけをPropsとして厳密に受け取るために SvgIconComponent を使ってみましたが、自作のSVGも許容したい場合にどう拡張すべきか迷っています。インターフェースの設計思想についてアドバイスが欲しいです。",
    },
    {
        title: "Next.js (App Router) でのコンポーネント設計について",
        statusId: 1, // 回答募集中
        isLiked: true,
        isBookmarked: true,
        userName: "Nextマスター",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1週間前
        likeCount: 25,
        bookmarkCount: 9,
        replyCount: 0,
        tagNames: ["Next.js", "App Router"],
        content: "Server ComponentとClient Componentの切り分け基準についての質問です。基本的にはServer Componentで組み、インタラクティブな要素だけをClient Componentとして切り出す方針で進めていますが、状態管理（Context）が必要になった場合のファイル配置で悩んでいます。",
    },
    {
        title: "Tailwind CSSで要素を中央寄せにする一番シンプルな書き方",
        statusId: 3, // 解決済み
        isLiked: false,
        isBookmarked: false,
        userName: "初心者マーク",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5時間前
        likeCount: 0,
        bookmarkCount: 1,
        replyCount: 3,
        tagNames: ["TailwindCSS", "CSS"],
        content: "短い質問です。フレックスボックスを使う方法以外に、グリッド（grid）を使った中央寄せのほうが記述量が少なくなるという噂を聞いたのですが本当ですか？具体的なクラス名を教えてください！", // 3行未満の短いテキストテスト用
    },
    {
        title: "Prismaのマイグレーションが本番環境で失敗した時の対処法",
        statusId: 1, // 回答募集中
        isLiked: true,
        isBookmarked: false,
        userName: "インフラ迷子",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2週間前
        likeCount: 8,
        bookmarkCount: 2,
        replyCount: 6,
        tagNames: ["Prisma", "PostgreSQL", "Database"],
        content: "本番環境のデータベース（PostgreSQL）に対して prisma migrate deploy を実行したところ、一部のデータ整合性エラーが原因でロールバックされてしまいました。すでに動いている本番環境で、既存データを壊さずにスキーマを修正する際の手順や注意点、皆さんがやっている運用方法を教えてください。",
    }
    , {
        title: "ECS Fargateでタスクが起動しない理由が知りたい",
        statusId: 1, // 回答募集中
        isLiked: false,
        isBookmarked: true,
        userName: "テラコヤ太郎",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
        likeCount: 3,
        bookmarkCount: 3,
        replyCount: 2,
        tagNames: ["AWS", "ECS", "Fargate"],
        content: "現在、AWS ECS (Fargate) を利用して新規プロジェクトのコンテナ基盤を構築していますが、デプロイしたタスクが正常に実行されず、数秒から数十秒で「STOPPED」状態になってしまう現象に悩まされています。ログを確認しても特に致命的なエラーが出ておらず原因特定に苦戦しています。タスク定義やセキュリティグループの確認ポイントがあれば教えていただきたいです。",
    },
    {
        title: "ReactのuseEffectが2回実行されるのを防ぎたいです",
        statusId: 3, // 解決済み
        isLiked: true,
        isBookmarked: false,
        userName: "ハッカーキッズ",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
        likeCount: 42,
        bookmarkCount: 15,
        replyCount: 8,
        tagNames: ["React", "JavaScript"],
        content: "Next.jsの開発環境（Strict Mode）で、useEffect内のデータフェッチが2回走ってしまいます。本番環境では1回になることは認識していますが、開発中にAPIサーバーに2倍負荷がかかるのが気になります。何か良い回避策や、ベストプラクティスはありますでしょうか？",
    },
    {
        title: "TypeScriptでコンポーネントのPropsの型を厳密に定義する方法",
        statusId: 2, // 整理中
        isLiked: false,
        isBookmarked: false,
        userName: "型安全第一",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3日前
        likeCount: 12,
        bookmarkCount: 4,
        replyCount: 1,
        tagNames: ["TypeScript", "React"],
        content: "MUIのコンポーネントをラップしたカスタムコンポーネントを作っています。MUIアイコンだけをPropsとして厳密に受け取るために SvgIconComponent を使ってみましたが、自作のSVGも許容したい場合にどう拡張すべきか迷っています。インターフェースの設計思想についてアドバイスが欲しいです。",
    },
    {
        title: "Next.js (App Router) でのコンポーネント設計について",
        statusId: 1, // 回答募集中
        isLiked: true,
        isBookmarked: true,
        userName: "Nextマスター",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1週間前
        likeCount: 25,
        bookmarkCount: 9,
        replyCount: 0,
        tagNames: ["Next.js", "App Router"],
        content: "Server ComponentとClient Componentの切り分け基準についての質問です。基本的にはServer Componentで組み、インタラクティブな要素だけをClient Componentとして切り出す方針で進めていますが、状態管理（Context）が必要になった場合のファイル配置で悩んでいます。",
    },
    {
        title: "Tailwind CSSで要素を中央寄せにする一番シンプルな書き方",
        statusId: 3, // 解決済み
        isLiked: false,
        isBookmarked: false,
        userName: "初心者マーク",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5時間前
        likeCount: 0,
        bookmarkCount: 1,
        replyCount: 3,
        tagNames: ["TailwindCSS", "CSS"],
        content: "短い質問です。フレックスボックスを使う方法以外に、グリッド（grid）を使った中央寄せのほうが記述量が少なくなるという噂を聞いたのですが本当ですか？具体的なクラス名を教えてください！", // 3行未満の短いテキストテスト用
    },
    {
        title: "Prismaのマイグレーションが本番環境で失敗した時の対処法",
        statusId: 1, // 回答募集中
        isLiked: true,
        isBookmarked: false,
        userName: "インフラ迷子",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2週間前
        likeCount: 8,
        bookmarkCount: 2,
        replyCount: 6,
        tagNames: ["Prisma", "PostgreSQL", "Database"],
        content: "本番環境のデータベース（PostgreSQL）に対して prisma migrate deploy を実行したところ、一部のデータ整合性エラーが原因でロールバックされてしまいました。すでに動いている本番環境で、既存データを壊さずにスキーマを修正する際の手順や注意点、皆さんがやっている運用方法を教えてください。",
    }, {
        title: "Tailwind CSSで要素を中央寄せにする一番シンプルな書き方",
        statusId: 3, // 解決済み
        isLiked: false,
        isBookmarked: false,
        userName: "初心者マーク",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5時間前
        likeCount: 0,
        bookmarkCount: 1,
        replyCount: 3,
        tagNames: ["TailwindCSS", "CSS"],
        content: "短い質問です。フレックスボックスを使う方法以外に、グリッド（grid）を使った中央寄せのほうが記述量が少なくなるという噂を聞いたのですが本当ですか？具体的なクラス名を教えてください！", // 3行未満の短いテキストテスト用
    },
    {
        title: "Prismaのマイグレーションが本番環境で失敗した時の対処法",
        statusId: 1, // 回答募集中
        isLiked: true,
        isBookmarked: false,
        userName: "インフラ迷子",
        postingTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2週間前
        likeCount: 8,
        bookmarkCount: 2,
        replyCount: 6,
        tagNames: ["Prisma", "PostgreSQL", "Database"],
        content: "本番環境のデータベース（PostgreSQL）に対して prisma migrate deploy を実行したところ、一部のデータ整合性エラーが原因でロールバックされてしまいました。すでに動いている本番環境で、既存データを壊さずにスキーマを修正する際の手順や注意点、皆さんがやっている運用方法を教えてください。",
    },

];
export const myActionsMock = [
    {
        id: 1,
        name: "自分の質問",
    }, 
    {
        id: 2,
        name: "自分が回答",
    },
    {
        id:3,
        name:"自分が解決",
    },
    {
        id:4,
        name:"ブックマーク",
    }
]
export const statusesMock=[
    {
        id: 1,
        name: "回答募集中",
    }, 
    {
        id: 2,
        name: "整理中",
    },
    {
        id:3,
        name:"解決済み",
    },
]
export const tagsMock = [
    { id: 1, name: "React" }, 
    { id: 2, name: "Next.js" },
    { id: 3, name: "TypeScript" },
    { id: 4, name: "JavaScript" },
    { id: 5, name: "Vue.js" },
    { id: 6, name: "Nuxt" },
    { id: 7, name: "Node.js" },
    { id: 8, name: "Python" },
    { id: 9, name: "Go" },
    { id: 10, name: "Docker" },
    { id: 11, name: "AWS" },
    { id: 12, name: "GCP" },
    { id: 13, name: "TailwindCSS" },
    { id: 14, name: "GraphQL" },
    { id: 15, name: "Prisma" },
    { id: 16, name: "PostgreSQL" },
    { id: 17, name: "Firebase" },
    { id: 18, name: "GitHub Actions" },
    { id: 19, name: "CI/CD" },
    { id: 20, name: "CSS" }
];