import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function NeuralBackground() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const nodeCount = 20;
    const initialNodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      initialNodes.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    setNodes(initialNodes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none opacity-10 -z-10 overflow-hidden">
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Connections */}
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((otherNode, j) => {
            const distance = Math.sqrt(
              Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
            );

            if (distance < 30) {
              return (
                <motion.line
                  key={`${i}-${j}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${otherNode.x}%`}
                  y2={`${otherNode.y}%`}
                  stroke="#00FFA3"
                  strokeWidth="1"
                  opacity={0.3 - distance / 100}
                />
              );
            }
            return null;
          })
        )}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="3"
            fill="#00FFA3"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
