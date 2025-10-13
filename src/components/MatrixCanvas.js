import React, { useRef, useEffect } from "react";

export default function MatrixCanvas() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "010011001010101101010101101111001101010101JKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 15;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1); // initial positions

    const speed = 1; // slower classic rain

    const draw = () => {
      // translucent background for trailing effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(6, 232, 6, 1)"; // classic green
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 1; // move down slowly
      }

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    />
  );
}
