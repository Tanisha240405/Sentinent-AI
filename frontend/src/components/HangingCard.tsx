import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useAnimationControls, useMotionValue, useMotionValueEvent } from "framer-motion";
import { FaApple, FaAmazon, FaMicrosoft } from 'react-icons/fa';
import { SiTesla, SiNike, SiOpenai, SiMeta, SiGoogle } from 'react-icons/si';

interface HangingCardProps {
  frontImage?: string;
  ropeWidth?: number;
  ropeColor?: string;
  ropeLength?: number;
  bouncy?: number;
  cardRadius?: number;
  fitMode?: "cover" | "contain";
  imageScale?: number;
  className?: string;
}

export default function HangingCard({
  frontImage = "",
  ropeWidth = 4,
  ropeColor = "rgba(44, 108, 115, 0.4)", // Patina theme color
  ropeLength = 120,
  bouncy = 55,
  cardRadius = 12,
  fitMode = "cover",
  imageScale = 1,
  className = ""
}: HangingCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimationControls();
  
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [naturalSize, setNaturalSize] = useState({ width: 250, height: 350 });
  const [isDragging, setIsDragging] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const pointerOffsetRef = useRef({ x: 0, y: 0 });

  useMotionValueEvent(x, "change", v => setDx(v));
  useMotionValueEvent(y, "change", v => setDy(v));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      setViewportWidth(window.innerWidth || 1440);
      setViewportHeight(window.innerHeight || 900);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!frontImage) {
      setNaturalSize({ width: 250, height: 350 });
      return;
    }
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth || 250, height: img.naturalHeight || 350 });
    };
    img.src = frontImage;
  }, [frontImage]);

  const finalScale = Math.max(0.1, Math.min(3, imageScale));
  
  // Using fixed base dimensions if no image provided, otherwise natural image scale
  const baseWidth = naturalSize.width;
  const baseHeight = naturalSize.height;
  const cardWidth = baseWidth * finalScale;
  const cardHeight = baseHeight * finalScale;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    draggingRef.current = true;
    setIsDragging(true);
    const rect = cardRef.current.getBoundingClientRect();
    pointerOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    controls.stop();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !cardRef.current) return;
    const parentRect = cardRef.current.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
    const nextX = e.clientX - parentRect.left - pointerOffsetRef.current.x;
    const nextY = e.clientY - parentRect.top - pointerOffsetRef.current.y - ropeLength;
    x.set(nextX);
    y.set(nextY);
  };

  const endPointerDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setIsDragging(false);
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    const bounce = Math.max(0, Math.min(100, bouncy));
    const stiffness = 180 + bounce * 4;
    const damping = 32 - bounce * 0.18;
    const mass = 0.9 + (100 - bounce) * 0.002;
    controls.start({
      x: 0,
      y: 0,
      transition: { type: "spring", stiffness, damping: Math.max(10, damping), mass }
    });
  };

  const autoSwing = useMemo(() => {
    const safeRange = Math.max(viewportWidth * 0.28, 1);
    const normalized = Math.max(-1, Math.min(1, dx / safeRange));
    return normalized * 12;
  }, [dx, viewportWidth]);

  const frameWidth = cardWidth;
  const frameHeight = ropeLength + cardHeight;
  
  // Create generous overflow space for the rope to draw when swinging wildly
  const ropeOverflowX = viewportWidth + ropeWidth * 10;
  const ropeOverflowY = viewportHeight + ropeWidth * 10;
  
  const x0 = frameWidth / 2;
  const y0 = 0;
  const x1 = x0 + dx;
  const y1 = ropeLength + dy;
  
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const sag = Math.min(260, dist * 0.35 + ropeLength * 0.25);
  
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag;
  
  const localX0 = x0 + ropeOverflowX;
  const localY0 = y0 + ropeOverflowY;
  const localX1 = x1 + ropeOverflowX;
  const localY1 = y1 + ropeOverflowY;
  const localCx = cx + ropeOverflowX;
  const localCy = cy + ropeOverflowY;
  
  const path = `M ${localX0} ${localY0} Q ${localCx} ${localCy} ${localX1} ${localY1}`;

  return (
    <div className={className} style={{ width: frameWidth, height: frameHeight, position: "relative", overflow: "visible", background: "transparent" }}>
      <svg
        width={frameWidth + ropeOverflowX * 2}
        height={frameHeight + ropeOverflowY * 2}
        viewBox={`0 0 ${frameWidth + ropeOverflowX * 2} ${frameHeight + ropeOverflowY * 2}`}
        style={{ position: "absolute", left: -ropeOverflowX, top: -ropeOverflowY, pointerEvents: "none", overflow: "visible" }}
      >
        <path d={path} fill="none" stroke={ropeColor} strokeWidth={ropeWidth} strokeLinecap="round" />
      </svg>
      <motion.div
        ref={cardRef}
        animate={controls}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        style={{
          x,
          y,
          rotate: autoSwing,
          transformOrigin: "50% 0%",
          position: "absolute",
          left: 0,
          top: ropeLength,
          width: cardWidth,
          height: cardHeight,
          cursor: isDragging ? "grabbing" : "grab",
          background: "transparent",
          touchAction: "none",
          willChange: "transform",
        }}
      >
        <motion.div 
          style={{ width: "100%", height: "100%", overflow: "hidden", background: "transparent", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
          animate={{ 
            borderRadius: [
              "50% 40% 60% 30% / 40% 60% 40% 50%", 
              "40% 60% 30% 70% / 50% 40% 60% 40%", 
              "60% 30% 50% 50% / 40% 50% 40% 60%", 
              "50% 40% 60% 30% / 40% 60% 40% 50%"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          {frontImage ? (
            <img src={frontImage} alt="" style={{ width: "100%", height: "100%", objectFit: fitMode, objectPosition: "center", display: "block", userSelect: "none", pointerEvents: "none", background: "transparent" }} />
          ) : (
            <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-patina/20 to-canvas/80 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              {/* Decorative background glow */}
              <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none blur-xl"></div>
              
              <div className="relative z-10 w-full h-full p-2 flex flex-col justify-center">
                {/* Cluster of Brands */}
                <div className="flex justify-center items-center h-full w-full relative">
                  
                  {/* Apple */}
                  <motion.div 
                    className="absolute top-[10%] left-[15%] w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-text-main hover:bg-patina hover:text-white transition-colors duration-300"
                    style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
                    animate={{ borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaApple size={28} />
                  </motion.div>

                  {/* Tesla */}
                  <motion.div 
                    className="absolute top-[25%] right-[10%] w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-negative hover:bg-negative hover:text-white transition-colors duration-300"
                    style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
                    animate={{ borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%"], rotate: [0, -10, 5, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <SiTesla size={32} />
                  </motion.div>
                  
                  {/* Nike */}
                  <motion.div 
                    className="absolute bottom-[20%] left-[5%] w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-patina hover:bg-patina hover:text-white transition-colors duration-300"
                    style={{ borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%" }}
                    animate={{ borderRadius: ["50% 50% 20% 80% / 25% 80% 20% 75%", "80% 20% 50% 50% / 75% 20% 80% 25%", "50% 50% 20% 80% / 25% 80% 20% 75%"], rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  >
                    <SiNike size={24} />
                  </motion.div>

                  {/* OpenAI */}
                  <motion.div 
                    className="absolute bottom-[10%] right-[20%] w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-positive hover:bg-positive hover:text-white transition-colors duration-300"
                    style={{ borderRadius: "70% 30% 50% 50% / 30% 30% 70% 70%" }}
                    animate={{ borderRadius: ["70% 30% 50% 50% / 30% 30% 70% 70%", "30% 70% 50% 50% / 70% 70% 30% 30%", "70% 30% 50% 50% / 30% 30% 70% 70%"], rotate: [0, -5, 10, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  >
                    <SiOpenai size={28} />
                  </motion.div>

                  {/* Meta */}
                  <motion.div 
                    className="absolute top-[40%] left-[35%] w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-[#2C6C73] hover:bg-[#2C6C73] hover:text-white transition-colors duration-300"
                    style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
                    animate={{ borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"], scale: [1, 1.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <SiMeta size={36} />
                  </motion.div>
                  {/* Microsoft */}
                  <motion.div 
                    className="absolute top-[5%] right-[20%] w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-[#00a4ef] hover:bg-[#00a4ef] hover:text-white transition-colors duration-300"
                    style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
                    animate={{ borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "30% 70% 70% 30% / 30% 30% 70% 70%"], rotate: [0, 10, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <FaMicrosoft size={20} />
                  </motion.div>

                  {/* Amazon */}
                  <motion.div 
                    className="absolute bottom-[35%] left-[25%] w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-[#FF9900] hover:bg-[#FF9900] hover:text-white transition-colors duration-300 z-20"
                    style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
                    animate={{ borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%"], scale: [1, 1.15, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  >
                    <FaAmazon size={24} />
                  </motion.div>

                  {/* Google */}
                  <motion.div 
                    className="absolute bottom-[5%] left-[30%] w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-[#4285F4] hover:bg-[#4285F4] hover:text-white transition-colors duration-300"
                    style={{ borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%" }}
                    animate={{ borderRadius: ["50% 50% 20% 80% / 25% 80% 20% 75%", "80% 20% 50% 50% / 75% 20% 80% 25%", "50% 50% 20% 80% / 25% 80% 20% 75%"], rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  >
                    <SiGoogle size={28} />
                  </motion.div>
                </div>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-canvas via-canvas/80 to-transparent">
                <p className="text-center text-sm font-bold tracking-widest uppercase text-patina/80">
                  Drag to interact
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
