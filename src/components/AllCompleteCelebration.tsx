import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import mapaeImage from '@/assets/mapae-red.png';

interface Props {
  onClose: () => void;
}

/* 폭죽 발사체 1개 */
const FireworkBurst: React.FC<{
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}> = ({ x, y, color, delay, size }) => {
  const particleCount = 14;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * 360;
    const dist = 55 + Math.random() * 45;
    const tx = Math.cos((angle * Math.PI) / 180) * dist;
    const ty = Math.sin((angle * Math.PI) / 180) * dist;
    return { angle, tx, ty };
  });

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}ms` }}
    >
      {/* 폭발 링 */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: color,
          animation: `fireworkBurst 0.7s ease-out forwards`,
          animationDelay: `${delay}ms`,
          opacity: 0,
        }}
      />
      {/* 파티클 */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="firework-particle -translate-x-1/2 -translate-y-1/2"
          style={{
            backgroundColor: i % 3 === 0 ? '#fff' : color,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animationDelay: `${delay}ms`,
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/* 캔버스 폭죽 (연속 랜덤 발사) */
const FireworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  const launchFirework = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const colors = [
      '#F5A623', '#E8462A', '#F07030', '#FAC860', '#D83A20',
      '#F5A623', '#C83018', '#F8BE50', '#E05020', '#F5A623',
    ];
    const x = random(w * 0.1, w * 0.9);
    const startY = h;
    const endY = random(h * 0.05, h * 0.45);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const particleCount = Math.floor(random(60, 100));

    // 파티클 생성
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      alpha: number; color: string; radius: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = random(2, 7);
      particles.push({
        x, y: endY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        radius: random(2, 4),
      });
    }

    // 발사체
    let rocketY = startY;
    let exploded = false;

    const animate = () => {
      if (!exploded) {
        // 발사체 꼬리
        ctx.beginPath();
        ctx.arc(x, rocketY, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, rocketY);
        ctx.lineTo(x, rocketY + 15);
        ctx.strokeStyle = `${color}88`;
        ctx.lineWidth = 2;
        ctx.stroke();

        rocketY -= random(14, 20);
        if (rocketY <= endY) {
          exploded = true;
        }
      } else {
        let alive = false;
        for (const p of particles) {
          if (p.alpha <= 0) continue;
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12; // gravity
          p.vx *= 0.97;
          p.alpha -= 0.016;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
        }
        if (!alive) return; // 이 폭죽 끝
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 연속 폭죽 발사 (겹쳐서 발사)
    const w = canvas.width;
    const h = canvas.height;

    const intervals: ReturnType<typeof setInterval>[] = [];

    const schedule = () => {
      launchFirework(ctx, canvas.width, canvas.height);
    };

    // 즉시 3발
    schedule();
    setTimeout(schedule, 400);
    setTimeout(schedule, 800);

    // 이후 주기적으로
    const id1 = setInterval(schedule, 700);
    const id2 = setInterval(() => {
      // fade 효과를 위한 반투명 clear
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 30);

    intervals.push(id1, id2);

    return () => {
      intervals.forEach(clearInterval);
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [launchFirework]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[51]"
    />
  );
};

/* ── 메인 컴포넌트 ── */
export const AllCompleteCelebration: React.FC<Props> = ({ onClose }) => {
  const stars = Array.from({ length: 12 }, (_, i) => i);

  return (
    <>
      {/* 폭죽 캔버스 (모달 뒤) */}
      <FireworkCanvas />

      {/* 오버레이 */}
      <div className="fixed inset-0 z-[52] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* CSS 폭죽 (보조) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { x: 15, y: 20, color: '#F5A623', delay: 200,  size: 80 },
            { x: 80, y: 15, color: '#E8462A', delay: 600,  size: 70 },
            { x: 50, y: 10, color: '#FAC860', delay: 100,  size: 90 },
            { x: 25, y: 35, color: '#E8462A', delay: 900,  size: 60 },
            { x: 75, y: 30, color: '#F5A623', delay: 400,  size: 75 },
            { x: 60, y: 20, color: '#F07030', delay: 750,  size: 65 },
          ].map((fw, i) => (
            <FireworkBurst key={i} {...fw} />
          ))}
        </div>

        {/* 모달 카드 */}
        <div className="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] animate-scale-in">

          {/* 상단 그라디언트 영역 */}
          <div className="relative bg-gradient-to-b from-[#1A0800] via-[#3D1008] to-[#6B1A08] px-6 pt-8 pb-6 text-center">

            {/* 별 파티클 */}
            {stars.map((_, i) => (
              <span
                key={i}
                className="absolute font-black pointer-events-none"
                style={{
                  color: i % 2 === 0 ? '#F5A623' : '#FAC860',
                  left: `${8 + (i * 7.5) % 85}%`,
                  top: `${5 + (i * 13) % 40}%`,
                  fontSize: `${10 + (i % 4) * 4}px`,
                  animation: `starPop 0.6s ease-out forwards`,
                  animationDelay: `${i * 80}ms`,
                  opacity: 0,
                }}
              >
                ★
              </span>
            ))}

            {/* 마패 이미지 */}
            <div
              className="mb-4 relative inline-block"
              style={{ animation: 'allCompleteFloat 3s ease-in-out infinite' }}
            >
              <img
                src={mapaeImage}
                alt="마패"
                className="w-28 h-28 mx-auto object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]"
              />
            </div>

            {/* 타이틀 */}
            <h1
              className="all-complete-title text-3xl font-black mb-1 tracking-tight"
              style={{ color: '#F5A623' }}
            >
              전체 완성! 🎉
            </h1>
            <p className="text-lg font-black text-white mb-1">
              25칸 빙고 달성!
            </p>
            <div
              className="all-complete-badge inline-block px-4 py-1 rounded-full text-black font-black text-sm mb-4"
            >
              🏆 최강 팀 등극!
            </div>

            <p className="text-white/80 text-sm leading-relaxed mb-5">
              모든 미션을 완료한 전설의 팀!<br />
              여러분의 열정과 팀워크가<br />
              완벽한 빙고를 만들어냈습니다. ✨
            </p>

            <Button
              onClick={onClose}
              size="lg"
              className="w-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#E8462A] hover:from-[#FAC860] hover:to-[#F06040] text-white font-black text-base shadow-[0_6px_20px_rgba(232,70,42,0.5)] border-0"
            >
              🎊 완벽한 마무리!
            </Button>
          </div>

          {/* 하단 컬러 바 */}
          <div className="h-2 all-complete-badge" />
        </div>
      </div>
    </>
  );
};
