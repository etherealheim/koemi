import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BorderTrail } from '@/components/mp/border-trail';
import { MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CardNewChat() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai");

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

  const generateRandomId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  };

  const handleClick = () => {
    const chatId = generateRandomId();
    router.push(`/chat/${chatId}`);
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
            className="text-3xl font-semibold text-stone-300 mt-2"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Start a new conversation
          </motion.p>
        </div>
        <motion.div
          className="mt-4"
          variants={textVariants}
          initial="hidden"
          animate="visible" 
          custom={2}
          onClick={(e) => e.stopPropagation()}
        >
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full bg-stone-900 border-stone-700">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
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