export default function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <div className="w-full max-w-[700px] mx-auto min-h-screen border-x border-gray-200">
                {children}
            </div>
        </div>
    );
}