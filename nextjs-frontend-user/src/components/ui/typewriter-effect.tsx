"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string | React.ReactNode;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => {
    if (typeof word.text === "string") {
      return {
        ...word,
        text: word.text.split(""),
      };
    } else {
      return {
        ...word,
        text: word.text, // Bọc icon trong <span>
      };
    }
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        }
      );
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {Array.isArray(word.text) ? ( // Kiểm tra xem word.text có phải là mảng không
                word.text.map((char, index) => (
                  <motion.span
                    initial={{}}
                    key={`char-${index}`}
                    className={cn(
                      ` text-white opacity-0 hidden`,
                      word.className
                    )}
                  >
                    {char}
                  </motion.span>
                ))
              ) : (
                <motion.span // Nếu không phải mảng, render trực tiếp
                  initial={{}}
                  className={cn(` text-white opacity-0 hidden`, word.className)}
                >
                  {word.text}
                </motion.span>
              )}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div className={cn("text-[35px] font-semibold", className)}>
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-[#101010]",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
