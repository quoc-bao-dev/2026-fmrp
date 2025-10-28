"use client";
import { motion } from "framer-motion";
import React from "react";
const AnimatedGeneraText = ({
    heroPerTitle,
    className,
    delay = 0,
    style,
    children,
    onAnimationComplete,
}) => {
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
            },
        },
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 20,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 20,
            },
        },
    };
    const words = [];

    const wrapWords = (node) => {
        if (typeof node === "string") {
            node.split(" ").forEach((word) => words.push(word));
        } else if (React.isValidElement(node)) {
            React.Children.forEach(node.props.children, wrapWords);
        }
    };
    wrapWords(children);

    const renderWords = (node, keyPrefix = "") => {
        if (typeof node === "string") {
            const wordArray = node.split(" ");
            return wordArray.map((word, i) => (
                <motion.span
                    key={`${keyPrefix}-${i}`}
                    variants={child}
                    onAnimationComplete={i === wordArray.length - 1 ? onAnimationComplete : undefined}
                >
                    {word}{" "}
                </motion.span>
            ));
        }

        if (React.isValidElement(node)) {
            const children = React.Children.map(node.props.children, (child, i) =>
                renderWords(child, `${keyPrefix}-${i}`)
            );
            return React.cloneElement(node, { key: keyPrefix }, children);
        }

        return null;
    };

    return (
        <motion.span
            className={className}
            variants={container}
            initial="hidden"
            animate="visible"
            style={{ ...style }}
            onAnimationComplete={onAnimationComplete}
        >
            {React.Children.map(children, (child, i) =>
                renderWords(child, `text-${i}`)
            )}
        </motion.span>
    );
};

export default AnimatedGeneraText;
