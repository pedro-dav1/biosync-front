import logoImg from "../../imports/Gemini_Generated_Image_cxoluwcxoluwcxol.png";

export function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-10",
    lg: "h-16"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoImg}
        alt="BIOSYN"
        className={`${sizeClasses[size]} object-contain`}
        style={{ filter: "drop-shadow(0 0 20px rgba(0, 255, 163, 0.5))" }}
      />
    </div>
  );
}
