import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, speedMs: number = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    setIsTyping(true);
    
    if (!text) {
      setIsTyping(false);
      return;
    }

    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [text, speedMs]);

  return { displayedText, isTyping };
}
