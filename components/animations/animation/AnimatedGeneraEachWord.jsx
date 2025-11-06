import LoadingThreeDotsJumping from "@/containers/botAI/components/LoadingThreeDotsJumping";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

const AnimatedGeneraEachWord = ({
    className = "",
    delay = 0,
    style = {},
    children,
    classNameWrapper = "",
    cursorColor = "#21B972",
    typingSpeed = 70,
    text = "",
}) => {
    const fullText = text
        ? Array.isArray(text)
            ? text.filter(Boolean).join(" ") // lọc bỏ phần tử null/undefined
            : String(text)
        : "";
    const [displayedText, setDisplayedText] = useState("");
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const animationRef = useRef(null);
    const [showDots, setShowDots] = useState(true);
    const currentIndexRef = useRef(0);
    useEffect(() => {
        // Reset state when component mounts or text changes
        setDisplayedText("");
        setIsTypingComplete(false);
        setShowCursor(true);
        currentIndexRef.current = 0;

        // Clear any existing timers
        if (animationRef.current) {
            clearTimeout(animationRef.current);
        }
        currentIndexRef.current = 0;

        const typeNextCharacter = () => {
            const currentChar = fullText[currentIndexRef.current] ?? "";
            if (currentIndexRef.current < fullText.length) {
                setDisplayedText((prev) => prev + currentChar);
                currentIndexRef.current++;
                animationRef.current = setTimeout(typeNextCharacter, typingSpeed);
            } else {
                setIsTypingComplete(true);
            }
        };

        animationRef.current = setTimeout(() => {
            typeNextCharacter();
        }, delay * 1000);

        // Fallback sau 10s
        const fallbackTimer = setTimeout(() => {
            setDisplayedText(fullText);
            setIsTypingComplete(true);
        }, 10000);

        // Cleanup function
        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
            clearTimeout(fallbackTimer);
        };
    }, [fullText, delay, typingSpeed]);

    // Handle cursor blinking after typing completes
    useEffect(() => {
        let cursorBlinkInterval;

        if (isTypingComplete) {
            cursorBlinkInterval = setInterval(() => {
                setShowCursor((prev) => !prev);
            }, 530); // Cursor blink interval
        }

        return () => {
            if (cursorBlinkInterval) {
                clearInterval(cursorBlinkInterval);
            }
        };
    }, [isTypingComplete]);
    // Animation từ phải qua trái
    const wordVariant = {
        hidden: {
            opacity: 0,
            x: 20, // Từ phải qua
        },
        visible: {
            opacity: 1,
            x: 0, // Về vị trí ban đầu
            transition: {
                duration: 0.25,
                ease: "easeOut",
            },
        },
    };

    // Process special words (like "Fimo" that should be bold)
    const processedText = () => {
        // Split by word boundaries but keep spaces
        const segments = displayedText.split(/(\s+)/);
        return segments.map((segment, index) => {
            if (segment === "Fimo") {
                return <b key={index}>{segment}</b>;
            }
            return <span key={index}>{segment !== undefined ? segment : ""}</span>;
        });
    };

    return (
        <div
            className={twMerge("relative inline-flex items-center", classNameWrapper)}
            style={{
                minWidth: "50px",
                whiteSpace: "nowrap",
                ...style,
            }}
        >
            <h2
                className={twMerge(
                    "relative z-10 font-deca text-xs font-normal w-full whitespace-nowrap overflow-hidden text-ellipsis ",
                    className
                )}
            >
                {processedText()}
                <motion.span
                    className="inline-block ml-[1px] -mr-[1px]"
                    animate={{ opacity: showCursor ? 1 : 0 }}
                    transition={{ duration: 0.1 }}
                    variants={wordVariant}
                    initial="hidden"
                />
                {!isTypingComplete && (
                    <motion.div
                        className="inline-block ml-1 flex-shrink-0"
                        // className="absolute left-0 top-full mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    >
                        <LoadingThreeDotsJumping
                            classNameDot1="bg-[#54E79E]"
                            classNameDot2="bg-[#21B972]"
                            classNameDot3="bg-[#027A48]"
                        />
                    </motion.div>
                )}
            </h2>
        </div>
    );
};

export default AnimatedGeneraEachWord;
