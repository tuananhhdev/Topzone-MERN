"use client"

import { cn } from "@/lib/utils"
import { motion, stagger, useAnimate, useInView } from "motion/react"
import { useEffect, type ReactNode } from "react"

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
  showCursor = true,
}: {
  words: {
    text: string | ReactNode
    className?: string
  }[]
  className?: string
  cursorClassName?: string
  showCursor?: boolean
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: typeof word.text === "string" ? word.text.split("") : [word.text],
    }
  })

  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)
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
        },
      )
    }
  }, [isInView])

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{}}
                  key={`char-${index}`}
                  className={cn(`text-white opacity-0 hidden`, word.className)}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </motion.div>
    )
  }
  return (
    <div className={cn("text-4xl", className)}>
      {renderWords()}
      {showCursor && (
        <motion.span
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className={cn("inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500", cursorClassName)}
        ></motion.span>
      )}
    </div>
  )
}

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
  showCursor = true,
}: {
  words: {
    text: string | ReactNode
    className?: string
  }[]
  className?: string
  cursorClassName?: string
  showCursor?: boolean
}) => {
  // Handle both string and ReactNode
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: typeof word.text === "string" ? word.text.split("") : [word.text],
    }
  })

  // Update the renderWords function to handle ReactNode
  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span key={`char-${index}`} className={cn(`text-white `, word.className)}>
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{
          width: "0%",
        }}
        whileInView={{
          width: "fit-content",
        }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text:3xl xl:text-5xl font-bold"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {renderWords()}{" "}
        </div>{" "}
      </motion.div>
      {showCursor && (
        <motion.span
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,

            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className={cn("block rounded-sm w-[4px]  h-4 sm:h-6 xl:h-12 bg-blue-500", cursorClassName)}
        ></motion.span>
      )}
    </div>
  )
}

