import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, speedMs: number = 20) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    // Initialize immediately with the first character to prevent layout shifts or empty skips
    setDisplayedText(text.substring(0, 1));
    let currentIndex = 1;

    if (text.length <= 1) {
      setIsTyping(false);
      return;
    }

    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, currentIndex + 1));
      currentIndex++;
      
      if (currentIndex >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [text, speedMs]);

  return { displayedText, isTyping };
}
