import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

export const ConfettiAnimation: React.FC = () => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const pieces: ConfettiPiece[] = [];

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      });
    }

    setConfetti(pieces);

    // Clean up after animation
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              left: piece.x,
              top: piece.y,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
            }}
            initial={{
              y: -20,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: piece.rotation + 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 3,
              ease: 'easeOut',
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiAnimation;
