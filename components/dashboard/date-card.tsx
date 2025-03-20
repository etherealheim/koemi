// components/DateCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DateCard() {
  const router = useRouter();
  // State to store the current time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every 1000ms (1 second)

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Format the day (e.g., "Tuesday")
  const day = currentTime.toLocaleString("en-US", { weekday: "long" });

  // Format the time (e.g., "13:12")
  const time = currentTime.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });

  // Format the date (e.g., "20")
  const date = currentTime.getDate();

  // Format the month (e.g., "DEC")
  const month = currentTime.toLocaleString("en-US", { month: "short" }).toUpperCase();

  // Format the year (e.g., "2025")
  const year = currentTime.getFullYear();

  // Format date for URL (YYYY-MM-DD)
  const formattedDate = currentTime.toISOString().split('T')[0];

  // Animation variants for the reveal effect
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2, // Stagger the animation for each element
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
      <CardContent className="flex flex-col items-left justify-center p-6">
      <motion.p
          className="text-xl font-medium text-stone-400 align-left"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={0} // First element (day)
        >
          {day}
        </motion.p>
      <motion.p
          className="text-6xl font-semibold text-stone-300 mt-2"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={2} // Third element (month)
        >
          {month} {date}
        </motion.p>
        <motion.p
          className="text-lg font-regular italic text-stone-600 mt-10"
        >
          "Be the change you want to see in the world."
          - Mahatma Gandhi
        </motion.p>
        
      </CardContent>
    </Card>
  );
}