type TestProps = {
    title?: string;
    description?: string;
    className?: string;
};

const Test = ({
    title = "Test Component",
    description = "Neuratalk White Theme Test",
    className = "",
}: TestProps) => (
    <div
        className={`bg-white-0 border border-stroke-soft-200 rounded-xl p-4 text-strong-950 ${className}`}
    >
        <h3 className="text-strong-950 font-semibold text-base mb-1">
            {title}
        </h3>
        <p className="text-sub-600 text-sm">{description}</p>
    </div>
);

export default Test;
