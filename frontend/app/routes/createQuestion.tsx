import Button from "@/components/common/Button";
import SectionTitle from "@/components/common/SectionTitle";
import TextInput from "@/components/common/TextInput";
import TagSelector from "@/components/createQuestion/TagSelector";
import { useState } from "react";

import { tagsMock } from "@/mockData";
import Modal from "@/components/common/Modal";
export default function CreateQuestion() {

    const [titleText, setTitleText] = useState("")
    const [detailText, setDetailText] = useState("")
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    return (
        <div className="flex flex-col gap-4 px-[var(--spacing-64)] py-[var(--spacing-32)] ">
            <div>
                <SectionTitle title="質問タイトル" />
                <div className="px-[var(--spacing-16)]">
                    <TextInput value={titleText} onChange={setTitleText} placeholder="例：ReactのuseStateを使用している変数が変更されないタイミングがあるのはなぜ？" />
                </div>
            </div>
            <div>
                <SectionTitle title="詳細" />
                <div className="px-[var(--spacing-16)]">
                    <TextInput value={detailText} onChange={setDetailText} placeholder="例：ReactのuseStateを使用している変数が変更されないタイミングがあるのはなぜ？" />
                </div>
            </div>
            <div>
                <SectionTitle title="タグ付け" />
                <TagSelector selectedTagIds={selectedTagIds} setSelectedTagIds={setSelectedTagIds} allTagData={tagsMock} />
            </div>
            <div className="flex items-center justify-center">
                <Button text="内容確認" onClick={() => setIsModalOpen(true)} />

            </div>
            {/* <Modal>

            </Modal> */}
        </div>
    );
}