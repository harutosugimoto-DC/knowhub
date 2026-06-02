import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type LoadingContextType = {
    isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // ローディングイベントを受け取る
        const handleLoading = (e: Event) => {
            const customEvent = e as CustomEvent<boolean>;
            setIsLoading(customEvent.detail);
        };
        window.addEventListener('global-loading', handleLoading);

        return (() => {
            window.removeEventListener('global-loading', handleLoading);
        })
    }, [])
    return (
        <LoadingContext.Provider value={{ isLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading は LoadingProvider の内側で使用してください。");
    }
    return context;
}