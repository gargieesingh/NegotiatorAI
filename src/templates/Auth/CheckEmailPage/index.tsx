"use client";

import Link from "next/link";
import LayoutLogin from "@/components/LayoutLogin";
import Button from "@/components/Button";

const CheckEmailPage = () => {
    return (
        <LayoutLogin
            title="Check your email"
            description={
                <>
                    We sent a verification link to<br></br>Martin@gmail.com
                </>
            }
        >
            <>
                <Button
                    className="w-full !h-12 !rounded-xl"
                    isBlue
                    as="link"
                    href="/auth/enter-code"
                >
                    Enter the code Manually
                </Button>
                <div className="mt-5 text-center">
                    <Link
                        className="text-label-sm text-blue-500 transition-colors hover:text-blue-700"
                        href="/auth/sign-in"
                    >
                        Back to login page
                    </Link>
                </div>
            </>
        </LayoutLogin>
    );
};

export default CheckEmailPage;
