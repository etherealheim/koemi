import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BorderTrail } from '@/components/mp/border-trail';
import Link from "next/link";

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
      className="w-full bg-stone-950 border-stone-800 text-white transition-colors cursor-pointer relative overflow-hidden p-0"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="flex flex-col h-full p-0">
        <div className="flex-1 w-full hover:bg-stone-900 hover:shadow-[inset_5px_5px_10px_#090909] hover:bg-gradient-to-br hover:from-[#23201D] hover:to-[#0A0807] px-6 pt-6">
          <Link href={`/journal/${formattedDate}`}>
            <motion.p
              className="text-lg font-medium text-stone-400"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              {day}
            </motion.p>
            <motion.p
              className="text-3xl font-semibold text-stone-300"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              {month} {date}
            </motion.p>
          </Link>
        </div>
        
        <div className="flex-1 w-full hover:bg-stone-900 hover:shadow-[inset_5px_5px_10px_#090909] hover:bg-gradient-to-br hover:from-[#23201D] hover:to-[#0A0807] border-t border-stone-800 px-6 pt-6">
            <Link href={`/memories/${formattedDate}`}>
              <motion.p
                className="text-lg font-medium text-stone-400"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                Create
              </motion.p>
              <motion.p
                className="text-3xl font-semibold text-stone-300"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                New Memory
              </motion.p>
            </Link>
        </div>
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