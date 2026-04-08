import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoadingStore } from '../lib/loadingStore';

const LoadingBar: React.FC = () => {
  const location = useLocation();
  const { isLoading: globalLoading } = useLoadingStore();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(30);
    
    const timer1 = setTimeout(() => setProgress(70), 200);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 200);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgress(0);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (globalLoading) {
      setVisible(true);
      setProgress(30);
      const timer = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + Math.random() * 5 : prev));
      }, 500);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [globalLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: `${progress}%` }}
          exit={{ opacity: 0 }}
          transition={{ 
            width: { type: "spring", stiffness: 50, damping: 20 },
            opacity: { duration: 0.2 }
          }}
          className="fixed top-0 left-0 h-[2.5px] bg-[#006a4e] z-[9999] shadow-[0_0_8px_rgba(0,106,78,0.6)]"
        />
      )}
    </AnimatePresence>
  );
};

export default LoadingBar;
