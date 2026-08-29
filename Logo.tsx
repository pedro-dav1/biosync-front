import logoCompleta from "../../imports/biosyn-logo.png";
import simbolo from "../../imports/biosyn-mark.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** "completa" traz símbolo + palavra; "simbolo" traz só a marca. */
  variante?: "completa" | "simbolo";
}

const alturas = { sm: "h-7", md: "h-11", lg: "h-24" };

export function Logo({ className = "", size = "md", variante = "completa" }: LogoProps) {
  const src = variante === "simbolo" ? simbolo : logoCompleta;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={src}
        alt="BIOSYN"
        className={`${alturas[size]} object-contain`}
        style={{ filter: "drop-shadow(0 0 18px rgba(0, 255, 163, 0.35))" }}
      />
    </div>
  );
}
