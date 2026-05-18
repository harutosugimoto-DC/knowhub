import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";

import "@fontsource/lora/400.css";

export default function App() {
    return (
        <html lang="ja">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}