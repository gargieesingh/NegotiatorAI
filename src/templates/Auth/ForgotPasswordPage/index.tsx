"use client";

import { useState } from "react";
import Link from "next/link";
import LayoutLogin from "@/components/LayoutLogin";
import Button from "@/components/Button";
import Image from "@/components/Image";
import Field from "@/components/Field";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");

    return (
        <LayoutLogin
            title="Forget password ?"
            description={
                <>Lost Your Key? Reset Your Password and Regain Control!</>
            }
        >
            <div className="">
                <Button
                    className="gap-4.5 w-full !h-12 !rounded-xl !text-label-md text-sub-600"
                    isStroke
                >
                    <Image
                        className="w-5 opacity-100"
                        src="/images/google.svg"
                        width={20}
                        height={20}
                        alt="Google"
                    />
                    Continue with Google
                </Button>
                <div className="flex items-center gap-3.5 my-6 text-center text-label-md text-soft-400 before:grow before:h-0.25 before:bg-stroke-soft-200 after:grow after:h-0.25 after:bg-stroke-soft-200 max-md:my-3">
                    Or
                </div>
                <div className="flex flex-col gap-4.5">
                    <Field
                        placeholder="Enter email"
                        value={email}
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button
                        className="w-full !h-12 !rounded-xl"
                        isBlue
                        as="link"
                        href="/auth/check-email"
                    >
                        Reset Password
                    </Button>
                </div>
                <div className="mt-5 text-center">
                    <Link
                        className="text-label-sm text-blue-500 transition-colors hover:text-blue-700"
                        href="/auth/sign-in"
                    >
                        Back to login page
                    </Link>
                </div>
            </div>
        </LayoutLogin>
    );
};

export default ForgotPasswordPage;
