import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Logo } from "./Logo";

interface IntroScreenProps {
  /** Chamado quando a animação termina ou o usuário pula. */
  onFinish: () => void;
  /** Duração total em ms. */
  duracao?: number;
}

interface No {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Abertura da plataforma: rede neural que se forma, converge para o centro
 * e revela a marca.
 *
 * É pulável com clique ou qualquer tecla, e respeita a preferência de
 * movimento reduzido do sistema — quem tem essa opção ligada vê apenas
 * um fade curto.
 */
export function IntroScreen({ onFinish, duracao = 2800 }: IntroScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [saindo, setSaindo] = useState(false);

  const movimentoReduzido =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const duracaoReal = movimentoReduzido ? 600 : duracao;

  // Encerramento: dispara o fade e avisa o App quando ele acaba.
  useEffect(() => {
    const encerrar = () => setSaindo(true);
    const timer = setTimeout(encerrar, duracaoReal);

    window.addEventListener("keydown", encerrar);
    window.addEventListener("click", encerrar);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", encerrar);
      window.removeEventListener("click", encerrar);
    };
  }, [duracaoReal]);

  useEffect(() => {
    if (!saindo) return;
    const timer = setTimeout(onFinish, 500);
    return () => clearTimeout(timer);
  }, [saindo, onFinish]);

  // Rede de nós em canvas: leve, e mais fluida que animar SVG nó a nó.
  useEffect(() => {
    if (movimentoReduzido) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;
    ctx.scale(dpr, dpr);

    const nos: No[] = Array.from({ length: 46 }, () => ({
      x: Math.random() * largura,
      y: Math.random() * altura,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
    }));

    const centroX = largura / 2;
    const centroY = altura / 2;
    const inicio = performance.now();
    let frame = 0;

    const desenhar = (agora: number) => {
      const t = Math.min((agora - inicio) / duracaoReal, 1);
      ctx.clearRect(0, 0, largura, altura);

      for (const no of nos) {
        no.x += no.vx;
        no.y += no.vy;
        if (no.x < 0 || no.x > largura) no.vx *= -1;
        if (no.y < 0 || no.y > altura) no.vy *= -1;

        // Na segunda metade, os nós são puxados para o centro.
        if (t > 0.5) {
          const forca = (t - 0.5) * 0.06;
          no.x += (centroX - no.x) * forca;
          no.y += (centroY - no.y) * forca;
        }
      }

      // Conexões entre nós próximos.
      const alcance = 170;
      for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
          const dx = nos[i].x - nos[j].x;
          const dy = nos[i].y - nos[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > alcance) continue;

          const forca = (1 - dist / alcance) * Math.min(t * 2.2, 1);
          ctx.strokeStyle = `rgba(0, 255, 163, ${forca * 0.34})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nos[i].x, nos[i].y);
          ctx.lineTo(nos[j].x, nos[j].y);
          ctx.stroke();
        }
      }

      for (const no of nos) {
        ctx.fillStyle = `rgba(108, 92, 231, ${Math.min(t * 2, 1) * 0.75})`;
        ctx.beginPath();
        ctx.arc(no.x, no.y, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(desenhar);
    };

    frame = requestAnimationFrame(desenhar);
    return () => cancelAnimationFrame(frame);
  }, [duracaoReal, movimentoReduzido]);

  return (
    <motion.div
      animate={{ opacity: saindo ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#081419]"
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {/* Halo central */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,163,0.13) 0%, rgba(108,92,231,0.06) 45%, transparent 70%)",
        }}
      />

      <div className="relative text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo size="lg" className="mb-7 justify-center" />
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.9, ease: "easeInOut" }}
          className="mx-auto h-px w-72 origin-center bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.25 }}
          className="mt-6 text-sm uppercase tracking-[0.32em] text-[rgba(255,255,255,0.62)]"
        >
          Inteligência em Saúde Pública
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="mt-10 text-[11px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.3)]"
        >
          Clique para entrar
        </motion.p>
      </div>
    </motion.div>
  );
}
