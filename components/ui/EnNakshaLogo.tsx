interface Props {
  variant?: "light" | "dark";
  className?: string;
}

export default function EnNakshaLogo({ variant = "light", className = "h-12 w-auto" }: Props) {
  const dark = variant === "dark";

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Icon image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dark ? "/images/logo-icon-dark.png" : "/images/logo-icon-v3.png"}
        alt=""
        className="h-[70%] w-auto object-contain"
        style={{
          filter: dark ? "none" : "hue-rotate(-17deg) saturate(0.85) brightness(0.88)",
        }}
      />

      {/* Wordmark */}
      <div className="flex flex-col justify-center leading-none -ml-1">
        <span
          className="font-playfair font-bold"
          style={{ fontSize: "1.45em", letterSpacing: "-0.01em", lineHeight: 1.1 }}
        >
          <span style={{ color: dark ? "#FAC775" : "#7C4A1E" }}>En</span>
          <span style={{ color: dark ? "#FAF7F2" : "#2E1B0E" }}>Naksha</span>
        </span>
        <span
          className="font-inter font-normal uppercase mt-0.5"
          style={{
            fontSize: "0.38em",
            color: dark ? "#9A9080" : "#9A7D52",
            letterSpacing: "0.22em",
          }}
        >
          Interiors · Managed
        </span>
      </div>
    </div>
  );
}
