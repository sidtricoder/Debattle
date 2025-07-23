import React, { useRef, useEffect } from "react";

const RainbowTrailBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("RainbowTrailBackground: canvas not found");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("RainbowTrailBackground: context not found");
      return;
    }
    console.log("RainbowTrailBackground: effect running");

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    let mouse = { x: width / 2, y: height / 2 };
    let lastMoveTime = 0;
    let smoothX = mouse.x;
    let smoothY = mouse.y;
    let hue = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMoveTime = Date.now();
    };
    document.addEventListener("mousemove", onMouseMove);

    function drawLight(x: number, y: number, color: string) {
      if (!ctx) return;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    function animate() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      smoothX += (mouse.x - smoothX) * 0.1;
      smoothY += (mouse.y - smoothY) * 0.1;

      let now = Date.now();
      if (now - lastMoveTime < 200) {
        hue = (hue + 2) % 360;
        const color = `hsla(${hue}, 100%, 70%, 0.6)`;
        drawLight(smoothX, smoothY, color);
      }

      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};

export default RainbowTrailBackground; 