// src/components/Iridescence.tsx

import React, { useRef, useEffect } from 'react';

interface Props {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
}

const Iridescence: React.FC<Props> = ({
  color = [1.0, 0.0, 0.5],
  speed = 1.0,
  amplitude = 0.3,
  mouseReact = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouseX = 0;
    let mouseY = 0;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `rgb(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255})`);
    gradient.addColorStop(1, `rgb(${color[2] * 255}, ${color[0] * 255}, ${color[1] * 255})`);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < height; i += 2) {
        const sine =
          Math.sin((i / height) * Math.PI * 2 * speed + t * 0.002) * amplitude * 100;
        ctx.fillStyle = `hsl(${(t / 10 + i) % 360}, 100%, 60%)`;
        ctx.fillRect(
          sine + mouseX * 0.02,
          i,
          width + sine,
          2
        );
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseReact) {
        mouseX = e.clientX - width / 2;
        mouseY = e.clientY - height / 2;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationRef.current!);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color, speed, amplitude, mouseReact]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default Iridescence;
