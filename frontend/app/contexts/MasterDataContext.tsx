// src/contexts/MasterDataContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getStatuses, type StatusType } from "@/api/statusService";
import { getTags, type TagType } from "@/api/tagService";
import { useUser } from "./UserContext";

type MasterDataContextType = {
    statuses: StatusType[];
    tags: TagType[];
    isLoading: boolean;
    getStatusName: (id: string) => string;
};

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [statuses, setStatuses] = useState<StatusType[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setStatuses([]);
            setTags([]);
            return;
        }

        const fetchMasterData = async () => {
            try {
                setIsLoading(true);
                // 💡 Promise.all で同時に取得すると効率的です
                const [statusData, tagData] = await Promise.all([getStatuses(), getTags()]);
                setStatuses(statusData);

                const sortedTagData = [...tagData].sort((a, b) => {
                    return a.name.localeCompare(b.name, "ja")
                })
                setTags(sortedTagData);
            } catch (err) {
                console.error("マスタデータの取得に失敗:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMasterData();
    }, [user]);

    const getStatusName = (id: string) => statuses.find((s) => s.id === id)?.name || "---";

    return (
        <MasterDataContext.Provider value={{ statuses, tags, isLoading, getStatusName }}>
            {children}
        </MasterDataContext.Provider>
    );
}

export const useMasterData = () => {
    const context = useContext(MasterDataContext);
    if (!context) throw new Error("useMasterData must be used within MasterDataProvider");
    return context;
};