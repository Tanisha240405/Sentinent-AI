import React, { useEffect, useRef, useState, startTransition } from "react";

interface ParticleTextProps {
  text: string;
  particleColor?: string;
  backgroundColor?: string;
  particleSize?: number;
  particleDensity?: number;
  mouseRadius?: number;
  returnSpeed?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  className?: string;
}

export default function ParticleText({
  text,
  particleColor = "#102221",
  backgroundColor = "transparent",
  particleSize = 1.5,
  particleDensity = 3,
  mouseRadius = 80,
  returnSpeed = 0.05,
  fontSize = 72,
  fontWeight = "bold",
  fontFamily = "'Space Grotesk', sans-serif",
  className = ""
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    
    document.fonts.ready.then(() => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const timeoutId = setTimeout(() => {
        if (!active) return;
      // Calculate responsive font size based on container width
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      // Smarter responsive sizing: find the longest line and scale font to perfectly fit it
      const linesForMath = text.replace(/\\n/g, "\n").split("\n");
      const maxChars = Math.max(...linesForMath.map(l => l.trim().length), 1);
      // 'Space Grotesk' bold characters average ~0.55em width. 
      // We divide the available width by the rough character count width.
      const safeFontSize = width / (maxChars * 0.52);
      
      const dynamicFontSize = Math.min(fontSize, Math.max(20, safeFontSize));

      ctx.fillStyle = particleColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontWeight} ${dynamicFontSize}px ${fontFamily}`;

      const padding = 10; // Tiny fixed padding so it maximizes size
      const maxTextWidth = width - padding * 2;

      const wrapText = (inputText: string) => {
        const inputLines = inputText.split("\\n");
        const wrappedLines: string[] = [];
        for (const line of inputLines) {
          if (!line.trim()) {
            wrappedLines.push("");
            continue;
          }
          const metrics = ctx.measureText(line);
          if (metrics.width <= maxTextWidth) {
            wrappedLines.push(line);
            continue;
          }
          const words = line.split(" ");
          let currentLine = "";
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testMetrics = ctx.measureText(testLine);
            if (testMetrics.width <= maxTextWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                wrappedLines.push(currentLine);
                currentLine = word;
              } else {
                wrappedLines.push(word);
              }
            }
          }
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
        }
        return wrappedLines;
      };

      // Handle literal \\n or actual newlines
      const parsedText = text.replace(/\\n/g, "\n");
      const lines = wrapText(parsedText);
      const lineHeight = dynamicFontSize * 1.05; // Tighter vertical spacing
      const totalHeight = lines.length * lineHeight;
      // Ensure the top line is never drawn off-screen by clamping startY
      const startY = Math.max(lineHeight / 2 + padding, (height - totalHeight) / 2 + lineHeight / 2);
      const textX = width / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, textX, startY + index * lineHeight);
      });

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const particles = [];
      const gap = Math.max(2, particleDensity);

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const index = (y * canvas.width + x) * 4;
          const alpha = pixels[index + 3];
          if (alpha > 128) {
            const px = x / dpr;
            const py = y / dpr;
            particles.push({
              x: px,
              y: py,
              baseX: px,
              baseY: py,
              vx: 0,
              vy: 0
            });
          }
        }
      }
      particlesRef.current = particles;
      startTransition(() => setIsInitialized(true));
      }, 100);

      // Cleanup for setTimeout is handled below, but we attach it to the closure
      // Note: we can't easily return the cleanup from a promise, so we'll just use active flag
    });

    return () => {
      active = false;
    };
  }, [text, particleColor, particleDensity, fontSize, fontWeight, fontFamily]);

  useEffect(() => {
    if (!isInitialized) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      if (backgroundColor !== "transparent") {
         ctx.fillStyle = backgroundColor;
         ctx.fillRect(0, 0, width, height);
      }
      
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      ctx.fillStyle = particleColor;
      ctx.beginPath();
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          particle.vx -= Math.cos(angle) * force * 2;
          particle.vy -= Math.sin(angle) * force * 2;
        }

        particle.vx += (particle.baseX - particle.x) * returnSpeed;
        particle.vy += (particle.baseY - particle.y) * returnSpeed;

        particle.vx *= 0.85; // more damping so it doesn't jitter
        particle.vy *= 0.85;

        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.moveTo(particle.x, particle.y);
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
      }
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, particleColor, particleSize, mouseRadius, returnSpeed, backgroundColor]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    mouseRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseLeave}
      className={className}
      style={{ touchAction: "none" }}
    />
  );
}
