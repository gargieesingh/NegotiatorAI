"use client";

import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Icon from "@/components/Icon";
import Actions from "@/components/Actions";

import { content } from "./content";

const HistoryPage = () => {
    const actions = [
        { name: "View", onClick: () => {} },
        { name: "Hide", onClick: () => {} },
        { name: "Remove", onClick: () => {} },
    ];

    return (
        <Layout>
            <Chat
                hidePanelMessage
                titleHead={
                    <div className="flex items-center gap-2 text-label-sm text-strong-950">
                        <Icon name="history" className="fill-strong-950" />
                        History
                    </div>
                }
            >
                <div className="-my-2">
                    {content.map((item) => (
                        <div
                            className="not-last:mb-6.5 max-md:not-last:mb-4"
                            key={item.id}
                        >
                            <div className="mb-4 text-label-md text-sub-600 font-medium max-md:mb-2 max-md:text-label-sm">
                                {item.title}
                            </div>
                            <div className="flex flex-col">
                                {item.items.map((item) => (
                                    <div
                                        className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-white-0 border border-stroke-soft-200 shadow-sm not-last:mb-3 cursor-pointer transition-colors hover:border-stroke-sub-300 max-md:items-start max-md:rounded-xl"
                                        key={item.id}
                                    >
                                        <div className="flex justify-center items-center shrink-0 size-12 rounded-xl bg-weak-50 border border-stroke-soft-200 max-md:size-10 max-md:rounded-lg">
                                            <Icon
                                                className="!size-5 fill-strong-950"
                                                name={item.icon}
                                            />
                                        </div>
                                        <div className="grow">
                                            <div className="mb-0.5 text-label-md text-strong-950 font-medium max-md:text-label-sm">
                                                {item.title}
                                            </div>
                                            <div className="text-sub-600 text-body-sm">
                                                {item.description}
                                            </div>
                                        </div>
                                        <Actions
                                            classNameButton="rotate-90 [&_svg]:!size-6 max-md:hidden"
                                            items={actions}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Chat>
        </Layout>
    );
};

export default HistoryPage;
