import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

const AnimatedGeneraDiv = ({
    className,
    delay = 0,
    style,
    children,
    classNameWrapper,
}) => {
    return (
        <div
            className={twMerge(
                "relative inline-block overflow-hidden h-full bg-transparent",
                classNameWrapper
            )}
        >
            {/* Text h2 */}
            {/* <motion.h2
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                style={{ originX: 1 }}
                className={`relative z-10 ${className}`}
            >
                {children}
            </motion.h2> */}
            <motion.h2
                initial={{ clipPath: "inset(0 0 0 100%)" }}
                animate={{ clipPath: "inset(0 0 0 0%)" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className={`inline-block ${className}`}
            >
                {children}
            </motion.h2>

            {/* Nền trắng che phủ */}
            {/* <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 1 }}
                style={{ originX: 0 }}
                className="absolute inset-0 bg-white z-20"
            /> */}
        </div>
    );
};

export default AnimatedGeneraDiv;
