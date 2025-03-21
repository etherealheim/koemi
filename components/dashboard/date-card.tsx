import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DateCard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const day = currentTime.toLocaleString("en-US", { weekday: "long" });
  const date = currentTime.getDate();
  const month = currentTime.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const formattedDate = currentTime.toISOString().split('T')[0];

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const handleClick = () => {
    router.push(`/journal/${formattedDate}`);
  };

  return (
    <Card 
      className="w-full bg-stone-950 border-stone-800 text-white hover:bg-stone-900 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="flex flex-col items-left justify-between h-full p-6">
        <div>
          <motion.p
            className="text-xl font-medium text-stone-400 align-left"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            {day}
          </motion.p>
          <motion.p
            className="text-6xl font-semibold text-stone-300 mt-2"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            {month} {date}
          </motion.p>
        </div>
        <motion.p
          className="text-lg font-regular italic text-stone-600"
        >
          &ldquo;Your users might not be humans anymore.&rdquo;
        </motion.p>
      </CardContent>
    </Card>
  );
}