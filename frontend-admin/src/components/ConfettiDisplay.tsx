import React from 'react';
import Confetti from 'react-confetti';
import { useConfetti } from '../context/ConfettiContext';

const ConfettiDisplay = () => {
  const { showConfetti } = useConfetti(); // Lấy showConfetti từ Context

  if (!showConfetti) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <Confetti width={window.innerWidth} height={window.innerHeight} />
    </div>
  );
};

export default ConfettiDisplay;
