"use client";

import { useEffect, useState } from "react";

// Three tea-plant leaves turning around a stem. `delay` hides it for quick
// loads so fast screens don't flash a spinner.
export function LeafLoader({ label, delay = 0 }: { label: string; delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="leaf-loader" role="status">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        {[0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 24 24)`} className="leaf">
            <path d="M24 23C18.5 19 17.6 10.5 24 4c6.4 6.5 5.5 15 0 19Z" />
            <path d="M24 21V7" className="leaf-vein" />
          </g>
        ))}
        <circle cx="24" cy="24" r="2.2" />
      </svg>
      <p className="sub">{label}</p>
    </div>
  );
}
