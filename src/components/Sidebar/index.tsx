import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import ModalShare from "@/components/ModalShare";
import ModalSettings from "@/components/ModalSettings";
import NavLink from "./NavLink";
import MyWorkspace from "./MyWorkspace";
import Upgrade from "./Upgrade";
import Button from "./Button";
import User from "./User";
import Folders from "./Folders";
import InvitePeople from "./InvitePeople";

type Props = {
    visible: boolean;
    onClose: () => void;
    onClickNewChat: () => void;
};

const Sidebar = ({ visible, onClose, onClickNewChat }: Props) => {
    const [open, setOpen] = useState(false);
    const [openModalShare, setOpenModalShare] = useState(false);
    const [openModalInvite, setOpenModalInvite] = useState(false);

    return (
        <>
            <div
                className={`fixed top-5 left-5 bottom-5 flex flex-col w-80 bg-white-0 rounded-3xl shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] max-3xl:w-65 max-lg:top-0 max-lg:left-0 max-lg:bottom-0 max-lg:z-20 max-lg:w-75 max-lg:shadow-2xl max-lg:rounded-none max-lg:transition-transform max-md:w-full max-md:p-4 ${
                    visible
                        ? "max-lg:translate-x-0"
                        : "max-lg:-translate-x-full"
                }`}
            >
                <div className="grow overflow-auto scrollbar-none p-5">
                    <div className="flex items-center gap-2 mb-5 max-lg:pr-2 max-md:mb-3">
                        <MyWorkspace />
                        <button
                            className="group hidden ml-4 max-lg:flex"
                            onClick={onClose}
                        >
                            <Icon
                                className="text-label-sm fill-strong-950 transition-colors group-hover:fill-blue-500"
                                name="close"
                            />
                        </button>
                    </div>
                    <Link
                        className="group relative flex items-center shrink-0 gap-2 h-10 px-3 rounded-xl text-label-sm transition-colors hover:text-blue-500 not-last:mb-2 dark:shadow-[0_0_0.1875rem_0_rgba(255,255,255,0.16)]"
                        href="/"
                        onClick={onClickNewChat}
                    >
                        <Icon
                            className="fill-strong-950 transition-colors group-hover:fill-blue-500"
                            name="chat"
                        />
                        Start a negotiation
                    </Link>
                    <div className="mb-auto">
                        <div className="mb-2 text-label-xs text-soft-400">
                            Today
                        </div>
                        <Link
                            className="flex items-center gap-2 h-10 mb-2 px-3 rounded-xl bg-weak-50 dark:shadow-[0_0_0.1875rem_0_rgba(255,255,255,0.16)]"
                            href="/write-copy"
                        >
                            <Icon className="fill-strong-950" name="document" />
                            <div className="text-label-sm">
                                Moving quote request
                            </div>
                        </Link>
                        <Folders />
                        <NavLink
                            href="/documents"
                            title="Documents"
                            icon="document"
                        />
                        <Button
                            title="Shared With Me"
                            icon="share"
                            onClick={() => setOpenModalShare(true)}
                        />
                        <NavLink
                            href="/templates"
                            title="Templates"
                            icon="template"
                        />
                        <NavLink
                            href="/history"
                            title="History"
                            icon="history"
                        />
                    </div>
                    <Upgrade />
                    <div className="mt-7 max-md:mt-4">
                        <Button
                            title="Feedback"
                            icon="comment"
                            onClick={() => {}}
                        />
                        <Button
                            title="Invite People"
                            icon="add-team"
                            onClick={() => setOpenModalInvite(true)}
                        />
                        <Button
                            title="Settings"
                            icon="settings"
                            onClick={() => setOpen(true)}
                        />
                    </div>
                </div>
                <User />
            </div>
            <ModalSettings open={open} onClose={() => setOpen(false)} />
            <ModalShare
                open={openModalShare}
                onClose={() => setOpenModalShare(false)}
            />
            <Modal
                classWrapper="max-w-100"
                open={openModalInvite}
                onClose={() => setOpenModalInvite(false)}
            >
                <InvitePeople />
            </Modal>
        </>
    );
};

export default Sidebar;
