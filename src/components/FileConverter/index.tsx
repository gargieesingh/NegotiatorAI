import Chat from "@/components/Chat";
import Question from "@/components/Question";
import Answer from "@/components/Answer";
import File from "./File";
import Converter from "./Converter";

const FileConverter = () => {
    return (
        <Chat>
            <Question>
                <div className="mb-2 text-strong-950">
                    Convert this file from DOC to XLS please
                </div>
                <File name="Docment res.Doc" size="2.1 Mb" />
            </Question>
            <Answer>
                <div className="mb-2 text-sub-600">
                    Sure converting your document to xls now:
                </div>
                <Converter />
            </Answer>
        </Chat>
    );
};

export default FileConverter;

