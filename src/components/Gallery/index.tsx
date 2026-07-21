import Preview from "./Preview";

const Gallery = ({}) => {
    return (
        <div className="relative h-160 bg-white-0 border border-stroke-soft-200 rounded-2xl p-1 overflow-hidden max-4xl:h-106 max-md:h-60">
            {[
                "/images/image-2.jpg",
                "/images/image-3.jpg",
                "/images/image-4.jpg",
            ].map((image, index) => (
                <Preview
                    className="w-[calc(50%-0.25rem)] first:top-1 first:left-1 first:bottom-1 not-first:h-[calc(50%-0.25rem)] not-first:right-1 nth-2:top-1 nth-3:bottom-1"
                    image={image}
                    key={index}
                    index={index}
                />
            ))}
        </div>
    );
};

export default Gallery;
