import Icon from "@/components/Icon";
import Button from "@/components/Button";
import { useState, useRef, useEffect } from "react";

type Props = {
    content: React.ReactNode;
    onBack: () => void;
};

const EditorArticle = ({ content, onBack }: Props) => {
    const [isTextSelected, setIsTextSelected] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({
        top: 0,
        left: 0,
    });
    const contentRef = useRef<HTMLDivElement>(null);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const contentRect = contentRef.current?.getBoundingClientRect();

            if (contentRect) {
                setSelectionPosition({
                    top: rect.top - contentRect.top - 50,
                    left: rect.left - contentRect.left + rect.width / 2 - 100,
                });
                setIsTextSelected(true);
            }
        } else {
            setIsTextSelected(false);
        }
    };

    const handleFormatText = (format: string) => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();

            if (selectedText) {
                let formattedText = selectedText;

                switch (format) {
                    case "bold":
                        formattedText = `<strong>${selectedText}</strong>`;
                        break;
                    case "italic":
                        formattedText = `<em>${selectedText}</em>`;
                        break;
                    case "underline":
                        formattedText = `<u>${selectedText}</u>`;
                        break;
                    case "strikethrough":
                        formattedText = `<s>${selectedText}</s>`;
                        break;
                }

                range.deleteContents();
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = formattedText;
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                range.insertNode(fragment);

                selection.removeAllRanges();
                setIsTextSelected(false);
            }
        }
    };

    useEffect(() => {
        document.addEventListener("selectionchange", handleTextSelection);
        return () => {
            document.removeEventListener(
                "selectionchange",
                handleTextSelection
            );
        };
    }, []);

    return (
        <div className="chat-wrapper p-5 max-md:p-0">
            <div className="flex justify-between items-center mb-5 max-md:mb-0 max-md:p-3">
                <button
                    className="group flex items-center gap-2 text-label-sm text-strong-950 max-md:text-0"
                    onClick={onBack}
                >
                    <div className="flex justify-center items-center size-9 bg-white-0 border border-stroke-soft-200 rounded-lg transition-colors group-hover:bg-soft-200">
                        <Icon
                            className="rotate-90 fill-strong-950"
                            name="chevron"
                        />
                    </div>
                    <span className="text-strong-950">Non-Disclosure Agreement Document</span>
                </button>
                <Button className="!h-8" isBlack onClick={onBack}>
                    Save Document
                </Button>
            </div>
            <div
                ref={contentRef}
                className="relative content grow bg-white-0 border border-stroke-soft-200 text-strong-950 px-18 py-16 rounded-xl shadow-[0_0.375rem_0.75rem_0_rgba(14,18,27,0.06)] overflow-y-auto scrollbar-none max-2xl:p-12 max-xl:p-8 max-md:px-3 max-md:py-4"
            >
                {content}
                {isTextSelected && (
                    <div
                        className="absolute z-10 bg-white-0 border border-stroke-soft-200 rounded-lg shadow-xl p-1 flex items-center gap-1 text-strong-950"
                        style={{
                            top: `${selectionPosition.top}px`,
                            left: `${selectionPosition.left}px`,
                        }}
                    >
                        <button
                            onClick={() => handleFormatText("bold")}
                            className="flex justify-center items-center size-7 text-sub-600 hover:text-strong-950 hover:bg-soft-200 rounded transition-colors"
                        >
                            <span className="font-bold text-sm">B</span>
                        </button>
                        <button
                            onClick={() => handleFormatText("italic")}
                            className="flex justify-center items-center size-7 text-sub-600 hover:text-strong-950 hover:bg-soft-200 rounded transition-colors"
                        >
                            <span className="italic text-sm">I</span>
                        </button>
                        <button
                            onClick={() => handleFormatText("underline")}
                            className="flex justify-center items-center size-7 text-sub-600 hover:text-strong-950 hover:bg-soft-200 rounded transition-colors"
                        >
                            <span className="underline text-sm">U</span>
                        </button>
                        <button
                            onClick={() => handleFormatText("strikethrough")}
                            className="flex justify-center items-center size-7 text-sub-600 hover:text-strong-950 hover:bg-soft-200 rounded transition-colors"
                        >
                            <span className="line-through text-sm">S</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorArticle;
