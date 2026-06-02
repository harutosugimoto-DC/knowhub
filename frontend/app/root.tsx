import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import Header from "./components/common/Header";

import "@/index.css";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/lora/400.css";
import GlobalHandler from "./components/common/GlobalHandler";
import { UserProvider } from "./contexts/UserContext";
import { MasterDataProvider } from "./contexts/MasterDataContext";
import { LoadingProvider } from "./contexts/LoadingContext";

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
                <LoadingProvider>
                    <UserProvider>
                        <MasterDataProvider>
                            <GlobalHandler />
                            <Header />
                            {/* Headerの高さだけpadding-topを付与（Headerに隠れないようにするってこと） */}
                            <div className="pt-[64px]">
                                <Outlet />
                            </div>
                            <ScrollRestoration />
                            <Scripts />
                        </MasterDataProvider>
                    </UserProvider>
                </LoadingProvider>
            </body>
        </html>
    );
}