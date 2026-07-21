"use client";

import { ThemeProvider } from "next-themes";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider defaultTheme="light" disableTransitionOnChange>
            {children}
        </ThemeProvider>
    );
};

export default Providers;
