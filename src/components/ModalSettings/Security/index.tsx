import { useState } from "react";
import Switch from "@/components/Switch";
import Button from "@/components/Button";

const Security = ({}) => {
    const [authentication, setAuthentication] = useState(true);

    return (
        <div className="">
            <div className="flex justify-between gap-6 mb-3 pb-3 border-b border-stroke-soft-200">
                <div className="max-w-101">
                    <div className="text-label-md">
                        Mlti-factor authentication
                    </div>
                    <div className="text-sub-600">
                        Require an extra security challenge when logging in. If
                        you are unable to pass this challenge, you will have the
                        option to recover your account via email.
                    </div>
                </div>
                <Switch
                    checked={authentication}
                    onChange={setAuthentication}
                    isSmall
                />
            </div>
            <div className="flex justify-between gap-6 max-md:flex-col max-md:gap-3">
                <div className="max-w-101">
                    <div className="text-label-md">Log out of all devices</div>
                    <div className="text-sub-600">
                        Log out of all active sessions across all devices,
                        including your current session. It may take up to 30
                        minutes for other devices to be logged out.
                    </div>
                </div>
                <Button
                    className="shrink-0 !h-10 !rounded-[0.625rem] !bg-weak-50"
                    isStroke
                >
                    Log out all
                </Button>
            </div>
        </div>
    );
};

export default Security;
