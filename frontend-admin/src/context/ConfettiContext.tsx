import { createContext, useState, useContext, ReactNode } from 'react';

const ConfettiContext = createContext({
  showConfetti: false,
  handleShowConfetti: () => {},
});

interface ConfettiProviderProps {
  children: ReactNode; 
}

export const ConfettiProvider = ({ children }: ConfettiProviderProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleShowConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  return (
    <ConfettiContext.Provider value={{ showConfetti, handleShowConfetti }}>
      {children}
    </ConfettiContext.Provider>
  );
};

export const useConfetti = () => useContext(ConfettiContext);