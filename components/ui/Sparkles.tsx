// Decorative twinkling sparkles scattered around a container. Purely
// cosmetic — absolutely positioned, non-interactive, and safe to drop over
// any relatively-positioned wrapper.
const SPARKLE_POSITIONS = [
  { top: "4%", left: "8%", size: 18, delay: "0s", color: "#D4A24C" },
  { top: "12%", left: "88%", size: 14, delay: "0.4s", color: "#C97B4A" },
  { top: "85%", left: "12%", size: 16, delay: "0.9s", color: "#C97B4A" },
  { top: "78%", left: "90%", size: 20, delay: "1.3s", color: "#D4A24C" },
  { top: "45%", left: "3%", size: 12, delay: "1.7s", color: "#D4A24C" },
  { top: "40%", left: "95%", size: 14, delay: "0.6s", color: "#C97B4A" },
];

function SparkleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z"
        fill={color}
      />
    </svg>
  );
}

export default function Sparkles() {
  return (
    <div className="absolute inset-0 overflow-visible" aria-hidden="true">
      {SPARKLE_POSITIONS.map((s, i) => (
        <span
          key={i}
          className="sparkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        >
          <SparkleIcon size={s.size} color={s.color} />
        </span>
      ))}
    </div>
  );
}
