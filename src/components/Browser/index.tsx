import Chat from "@/components/Chat";
import Question from "@/components/Question";
import Answer from "@/components/Answer";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Actions from "@/components/Actions";

import { content } from "./content";

const actions = [
    { name: "Edit", onClick: () => {} },
    { name: "Delete", onClick: () => {} },
    { name: "Copy", onClick: () => {} },
];

const Browser = () => {
    return (
        <Chat>
            <Question>
                what is the most beatiful website made using{" "}
                <span className="font-medium text-strong-950">webflow</span>
            </Question>
            <Answer>
                <div className="mb-6 text-sub-600 max-md:mb-4">
                    If you&apos;re searching for the most beautiful websites
                    built with Webflow, there are several standout examples that
                    showcase the platform&apos;s capabilities in design,
                    interactivity, and storytelling. Here are some notable ones:
                </div>
                <div className="flex flex-col gap-6 max-md:gap-4">
                    {content.map((item, index) => (
                        <div key={item.id} className="bg-white-0 border border-stroke-soft-200 rounded-xl p-4">
                            <div className="text-label-sm text-strong-950 font-medium mb-1">
                                🌟 {index + 1}. {item.title}
                            </div>
                            <div className="text-sub-600 text-p-sm mb-2">{item.description}</div>
                            <a
                                className="text-label-sm text-blue-500 transition-colors hover:text-blue-600 underline block mb-3"
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {item.link}
                            </a>
                            <div className="relative max-w-92 mt-1 rounded-lg border border-stroke-soft-200 overflow-hidden bg-weak-50">
                                <Image
                                    className="w-full rounded-lg object-cover"
                                    src={item.image}
                                    alt={item.title}
                                    width={366}
                                    height={216}
                                />
                                <div className="absolute top-2 right-3.5 flex items-center gap-3 h-9 px-2.5 bg-white-0 border border-stroke-soft-200 rounded-xl max-md:right-2 shadow-xs">
                                    <button className="group text-0">
                                        <Icon
                                            className="!size-4 fill-icon-sub-600 transition-colors group-hover:fill-strong-950"
                                            name="share-1"
                                        />
                                    </button>
                                    <Actions items={actions} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Answer>
        </Chat>
    );
};

export default Browser;

