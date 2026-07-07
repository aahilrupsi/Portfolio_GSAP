import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface JelloTextProps {
  text: string;
  onClick?: () => void;
}

const JelloText: React.FC<JelloTextProps> = ({ text, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const mouseInitialY = useRef(0);
  const charIndexSelected = useRef(0);
  const charH = useRef(0);

  const weightInit = 600;
  const weightTarget = 300;
  const weightDiff = weightInit - weightTarget;
  const stretchInit = 100;
  const stretchTarget = 75;
  const stretchDiff = stretchInit - stretchTarget;
  const maxYScale = 2.0;
  const elasticDropOff = 0.8;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const charElements = charsRef.current.filter(el => el !== null) as HTMLSpanElement[];
      if (charElements.length === 0 || !containerRef.current) return;

      charH.current = containerRef.current.offsetHeight;

      gsap.set(charElements, {
        transformOrigin: 'center bottom',
      });

      // Initial fall-in animation
      gsap.from(charElements, {
        y: -500,
        fontWeight: weightTarget,
        fontVariationSettings: `'wdth' ${stretchTarget}`,
        scaleY: 2,
        ease: "elastic.out(1, 0.3)",
        duration: 1.5,
        stagger: {
          each: 0.05,
          from: 'random'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [text]);

  const calcfracDispersion = (index: number, dragYScale: number, numChars: number) => {
    const dispersion = 1 - (Math.abs(index - charIndexSelected.current) / (numChars * elasticDropOff));
    return dispersion * dragYScale;
  };

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    mouseInitialY.current = e.clientY;
    charIndexSelected.current = index;
    setIsMouseDown(true);
    document.body.classList.add("grab");
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;

      const numChars = text.length;
      const maxYDragDist = charH.current * (maxYScale - 1);
      const distY = mouseInitialY.current - e.clientY;
      let dragYScale = distY / maxYDragDist;

      if (dragYScale > (maxYScale - 1)) dragYScale = maxYScale - 1;
      else if (dragYScale < -0.3) dragYScale = -0.3;

      const charElements = charsRef.current.filter(el => el !== null);

      gsap.to(charElements, {
        y: (index: number) => calcfracDispersion(index, dragYScale, numChars) * -40,
        fontWeight: (index: number) => weightInit - (calcfracDispersion(index, dragYScale, numChars) * weightDiff),
        fontVariationSettings: (index: number) => `'wdth' ${stretchInit - (calcfracDispersion(index, dragYScale, numChars) * stretchDiff)}`,
        scaleY: (index: number) => {
          let sY = 1 + calcfracDispersion(index, dragYScale, numChars);
          return sY < 0.7 ? 0.7 : sY;
        },
        ease: "power4.out",
        duration: 0.6
      });
    };

    const handleMouseUp = () => {
      if (!isMouseDown) return;
      setIsMouseDown(false);
      document.body.classList.remove("grab");

      const charElements = charsRef.current.filter(el => el !== null);

      gsap.to(charElements, {
        y: 0,
        fontWeight: weightInit,
        fontVariationSettings: `'wdth' ${stretchInit}`,
        scaleY: 1,
        ease: "elastic.out(1, 0.3)",
        duration: 1.2,
        stagger: {
          each: 0.02,
          from: charIndexSelected.current
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown, text]);

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center w-full h-full select-none"
      onClick={onClick}
      style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: '140px',
          color: 'white',
      }}
    >
      <div className="flex cursor-pointer transition-transform hover:scale-105 active:scale-95">
        {text.split('').map((char, index) => (
          <span
            key={index}
            ref={el => { charsRef.current[index] = el }}
            className="inline-block relative"
            onMouseDown={(e) => handleMouseDown(e, index)}
            style={{
                fontWeight: weightInit,
                fontVariationSettings: `'wdth' ${stretchInit}`,
                letterSpacing: '-0.03em',
                padding: '0 0.02em',
                textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                willChange: 'font-weight, font-variation-settings, transform'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default JelloText;
