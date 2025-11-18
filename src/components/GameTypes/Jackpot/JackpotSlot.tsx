
import React from "react";
import { motion } from "framer-motion";

interface JackpotSlotProps {
  symbol: string;
  isRolling: boolean;
  slotSize: number;
  slotBorderColor: string;
  slotBorderWidth: number;
  slotBackgroundColor: string;
}

const JackpotSlot: React.FC<JackpotSlotProps> = ({
  symbol,
  isRolling,
  slotSize,
  slotBorderColor,
  slotBorderWidth,
  slotBackgroundColor
}) => {
  return (
    <motion.div 
      style={{
        width: slotSize,
        height: slotSize,
        borderRadius: 12,
        border: `${slotBorderWidth}px solid ${slotBorderColor}`,
        backgroundColor: slotBackgroundColor,
        fontSize: Math.max(20, slotSize * 0.4),
        fontWeight: 700,
        // Effets 3D professionnels pour les slots
        boxShadow: `
          0 8px 24px rgba(0, 0, 0, 0.18),
          0 3px 10px rgba(0, 0, 0, 0.12),
          inset 0 2px 4px rgba(255, 255, 255, 0.25),
          inset 0 -2px 4px rgba(0, 0, 0, 0.15)
        `,
        background: `
          linear-gradient(145deg, 
            ${slotBackgroundColor}, 
            ${slotBackgroundColor}f5
          )
        `,
      }} 
      animate={{
        scale: isRolling ? [1, 0.96, 1] : 1,
        rotateY: isRolling ? [0, 5, -5, 0] : 0,
      }} 
      transition={{
        duration: 0.15,
        repeat: isRolling ? Infinity : 0,
        ease: "easeInOut"
      }} 
      className="flex items-center justify-center flex-shrink-0"
    >
      {symbol}
    </motion.div>

  );
};

export default JackpotSlot;
