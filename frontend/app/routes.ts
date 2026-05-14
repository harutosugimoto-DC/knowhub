import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),

  layout("layouts/auth-guard.tsx", [
    route("top", "routes/top.tsx"),
    route("create-question", "routes/createQuestion.tsx"),
    route("question/:id", "routes/question.tsx"),
    route("profile", "routes/profile.tsx"),
  ]),
] satisfies RouteConfig;