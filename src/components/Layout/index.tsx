import Header from "@/components/Header";

type Props = {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
    return (
        <div className="min-h-screen max-w-6xl mx-auto px-5 overflow-hidden">
            <div className="pt-9.5 pb-5 max-md:pt-4 max-md:pb-4">
                <Header onOpenSidebar={() => {}} onToggleTools={() => {}} />
                {children}
            </div>
        </div>
    );
};

export default Layout;
