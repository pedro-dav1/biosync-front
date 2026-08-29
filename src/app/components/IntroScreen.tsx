import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import simbolo from "../../imports/biosyn-mark.png";

interface IntroScreenProps {
  onFinish: () => void;
  duracao?: number;
}

interface Particula {
  /** posição atual */
  x: number;
  y: number;
  /** destino: um ponto da silhueta do símbolo */
  dx: number;
  dy: number;
  atraso: number;
}

/**
 * Abertura da plataforma.
 *
 * As partículas nascem espalhadas e convergem para a silhueta do símbolo
 * do BIOSYN — os destinos são extraídos do próprio PNG da marca, então a
 * forma montada é sempre fiel ao logo, mesmo que o arquivo mude.
 *
 * Depois de montada, a marca real aparece por cima e as partículas se
 * apagam. Pulável com clique ou tecla; respeita movimento reduzido.
 */
export function IntroScreen({ onFinish, duracao = 5000 }: IntroScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [montado, setMontado] = useState(false);

  const movimentoReduzido =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const duracaoReal = movimentoReduzido ? 700 : duracao;

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
    const timer = setTimeout(onFinish, 600);
    return () => clearTimeout(timer);
  }, [saindo, onFinish]);

  // A marca real entra quando as partículas terminam de se montar.
  useEffect(() => {
    if (movimentoReduzido) {
      setMontado(true);
      return;
    }
    const timer = setTimeout(() => setMontado(true), duracaoReal * 0.62);
    return () => clearTimeout(timer);
  }, [duracaoReal, movimentoReduzido]);

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

    let frame = 0;
    let cancelado = false;

    const img = new Image();
    img.src = simbolo;

    img.onload = () => {
      if (cancelado) return;

      // Lê o PNG num canvas auxiliar e coleta pixels opacos: são os destinos.
      const lado = Math.min(280, Math.min(largura, altura) * 0.32);
      const escala = lado / Math.max(img.width, img.height);
      const lg = Math.round(img.width * escala);
      const at = Math.round(img.height * escala);

      const aux = document.createElement("canvas");
      aux.width = lg;
      aux.height = at;
      const auxCtx = aux.getContext("2d");
      if (!auxCtx) return;
      auxCtx.drawImage(img, 0, 0, lg, at);
      const dados = auxCtx.getImageData(0, 0, lg, at).data;

      const offsetX = largura / 2 - lg / 2;
      const offsetY = altura / 2 - at / 2 - 30;

      const destinos: Array<{ x: number; y: number }> = [];
      const passo = 3;
      for (let y = 0; y < at; y += passo) {
        for (let x = 0; x < lg; x += passo) {
          if (dados[(y * lg + x) * 4 + 3] > 130) {
            destinos.push({ x: offsetX + x, y: offsetY + y });
          }
        }
      }

      const particulas: Particula[] = destinos.map((d, i) => {
        const angulo = Math.random() * Math.PI * 2;
        const raio = Math.max(largura, altura) * (0.35 + Math.random() * 0.45);
        return {
          x: largura / 2 + Math.cos(angulo) * raio,
          y: altura / 2 + Math.sin(angulo) * raio,
          dx: d.x,
          dy: d.y,
          atraso: (i / Math.max(destinos.length, 1)) * 0.28 + Math.random() * 0.12,
        };
      });

      const inicio = performance.now();
      const fase = duracaoReal * 0.62;

      const suavizar = (t: number) => 1 - Math.pow(1 - t, 3);

      const desenhar = (agora: number) => {
        const t = Math.min((agora - inicio) / fase, 1);
        ctx.clearRect(0, 0, largura, altura);

        // Linhas de blueprint: enquadram a marca enquanto ela se monta.
        const guia = Math.min(Math.max((t - 0.25) / 0.4, 0), 1);
        if (guia > 0) {
          const opacidade = guia * (1 - Math.max((t - 0.85) / 0.15, 0)) * 0.28;
          ctx.strokeStyle = `rgba(0,255,163,${opacidade})`;
          ctx.lineWidth = 1;
          const m = 46;
          const l = offsetX - m;
          const c = offsetX + lg + m;
          const cima = offsetY - m;
          const baixo = offsetY + at + m;
          ctx.beginPath();
          ctx.moveTo(l, cima + (baixo - cima) * (1 - guia));
          ctx.lineTo(l, baixo);
          ctx.moveTo(c, cima);
          ctx.lineTo(c, baixo - (baixo - cima) * (1 - guia));
          ctx.moveTo(l + (c - l) * (1 - guia), cima);
          ctx.lineTo(c, cima);
          ctx.moveTo(l, baixo);
          ctx.lineTo(c - (c - l) * (1 - guia), baixo);
          ctx.stroke();
        }

        for (const p of particulas) {
          const local = Math.min(Math.max((t - p.atraso) / (1 - p.atraso), 0), 1);
          const e = suavizar(local);
          const x = p.x + (p.dx - p.x) * e;
          const y = p.y + (p.dy - p.y) * e;

          // Verde ao chegar, roxo enquanto viaja.
          const cor = e > 0.9 ? "0,255,163" : "108,92,231";
          ctx.fillStyle = `rgba(${cor},${0.25 + e * 0.7})`;
          ctx.fillRect(x, y, 1.7, 1.7);
        }

        frame = requestAnimationFrame(desenhar);
      };

      frame = requestAnimationFrame(desenhar);
    };

    return () => {
      cancelado = true;
      cancelAnimationFrame(frame);
    };
  }, [duracaoReal, movimentoReduzido]);

  return (
    <motion.div
      animate={{ opacity: saindo ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#081419]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: montado ? 0 : 1 }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,163,0.12) 0%, rgba(108,92,231,0.05) 45%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <motion.img
          src={simbolo}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={montado ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "min(280px, 32vmin)",
            filter: "drop-shadow(0 0 30px rgba(0,255,163,0.4))",
          }}
        />

        <motion.div
          initial={{ scaleX: 0 }}
          animate={montado ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeInOut" }}
          className="mt-9 h-px w-72 origin-center bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent"
        />

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={montado ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 text-2xl font-bold uppercase tracking-[0.5em] text-white"
        >
          Biosyn
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={montado ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-3 text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.55)]"
        >
          Inteligência em Saúde Pública
        </motion.p>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={montado ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute bottom-12 text-[11px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.28)]"
      >
        Clique para entrar
      </motion.p>
    </motion.div>
  );
}
