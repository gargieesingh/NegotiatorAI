import { Swiper, SwiperSlide } from "swiper/react";
import { items } from "./items";
import Image from "@/components/Image";
import { useState } from "react";

import "swiper/css";
import "swiper/css/effect-fade";
import { Autoplay } from "swiper/modules";

const SLIDE_DURATION = 3000;

const Slider = ({}) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    return (
        <div className="absolute bottom-15 left-10 right-10 z-2 max-2xl:bottom-8 max-2xl:left-8 max-2xl:right-8">
            <Swiper
                className="mySwiper !overflow-visible"
                spaceBetween={56}
                modules={[Autoplay]}
                autoplay={{
                    delay: SLIDE_DURATION,
                    disableOnInteraction: false,
                }}
                onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                speed={500}
            >
                {items.map((item, index) => (
                    <SwiperSlide
                        className="relative p-5.5 pl-45 border border-stroke-soft-200 rounded-[1.125rem] bg-[#99A0AE]/24 backdrop-blur-[0.625rem] max-xl:pl-5.5"
                        key={item.id}
                    >
                        <div className="absolute -left-1 bottom-3 max-xl:hidden">
                            <Image
                                className="w-46.5"
                                src={item.image}
                                width={186}
                                height={170}
                                alt={item.author}
                            />
                        </div>
                        <div className="flex items-center gap-3 mb-2 text-label-lg">
                            <div className="border border-stroke-soft-200 rounded-xl overflow-hidden rotate-[-10deg]">
                                <Image
                                    className="w-10 h-9.5 object-cover"
                                    src={item.avatar}
                                    width={40}
                                    height={38}
                                    alt={item.author}
                                />
                            </div>
                            {item.author}
                            <div className="ml-auto text-label-lg">
                                {index + 1}/{items.length}
                            </div>
                            <div className="w-6.5 h-6.5">
                                <svg
                                    className="w-full h-full transform -rotate-90"
                                    viewBox="0 0 36 36"
                                >
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="16"
                                        fill="none"
                                        stroke="rgba(255, 255, 255, 0.2)"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="16"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeDasharray={`${2 * Math.PI * 16}`}
                                        strokeDashoffset={`${2 * Math.PI * 16}`}
                                        strokeLinecap="round"
                                        className={`${
                                            index === currentSlide
                                                ? "animate-progress"
                                                : "opacity-50"
                                        }`}
                                        style={{
                                            animationDuration: `${SLIDE_DURATION}ms`,
                                            animationPlayState:
                                                index === currentSlide
                                                    ? "running"
                                                    : "paused",
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="min-h-12 line-clamp-2 text-label-sm text-[#CACFD8]">
                            {item.content}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Slider;
