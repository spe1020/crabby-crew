import { useMemo } from "react";

/** Generates ambient floating bubbles via CSS animation. */
export default function Bubbles({ count = 18 }: { count?: number }) {
  const bubbles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 6 + Math.random() * 28;
      return {
        key: i,
        style: {
          width: size,
          height: size,
          left: `${Math.random() * 100}%`,
          bottom: `-${size}px`,
          animationDuration: `${8 + Math.random() * 14}s`,
          animationDelay: `${Math.random() * 10}s`,
        } as React.CSSProperties,
      };
    });
  }, [count]);

  return (
    <>
      {bubbles.map((b) => (
        <div key={b.key} className="landing-bubble" style={b.style} />
      ))}
    </>
  );
}
