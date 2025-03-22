import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BorderTrail } from '@/components/mp/border-trail';

export default function CardCurrentDay() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);

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
      className="w-full bg-stone-950 border-stone-800 text-white hover:bg-stone-900 transition-colors cursor-pointer relative overflow-hidden"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="flex flex-col items-left justify-between h-full px-6 py-0 relative z-10">
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
      {isHovered && (
        <BorderTrail
          style={{
            boxShadow:
              '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
          }}
          size={100}
        />
      )}
    </Card>
  );
}