import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Gem, Sparkles, Star } from 'lucide-react';
import mapaeImage from '@/assets/mapae-red.png';

interface CelebrationModalProps {
  type: 'line' | 'complete';
  lineCount: number;
  rank?: number | null;
  onClose: () => void;
}

const RANK_LABELS: Record<number, { emoji: string; color: string; label: string }> = {
  1: { emoji: '🥇', color: 'from-yellow-400 to-amber-500', label: '1등' },
  2: { emoji: '🥈', color: 'from-slate-300 to-slate-500', label: '2등' },
  3: { emoji: '🥉', color: 'from-orange-400 to-amber-700', label: '3등' },
};

/* ── 마패 획득 (2줄, 4줄...) ─────────────────────────────── */
const MapaeCelebration: React.FC<{ lineCount: number; rank?: number | null; onClose: () => void }> = ({
  lineCount, rank, onClose,
}) => {
  const mapaeCount = Math.floor(lineCount / 2);
  const rl = rank && rank <= 3 ? RANK_LABELS[rank] : null;

  // 폭죽 조각 (48개, 다양한 색상과 크기)
  const confetti = Array.from({ length: 48 }, (_, i) => {
    const colors = ['#FFD700', '#F5A623', '#E8462A', '#FF6B6B', '#FFFFFF', '#FFF176', '#FF8C00', '#FFB347'];
    const shapes = ['rounded-full', 'rounded-sm', 'rounded-none'];
    return {
      id: i,
      color: colors[i % colors.length],
      left: `${2 + (i * 2.05) % 96}%`,
      delay: `${(i * 55) % 1400}ms`,
      duration: `${2000 + (i % 6) * 280}ms`,
      width: i % 3 === 0 ? '8px' : i % 3 === 1 ? '5px' : '10px',
      height: i % 3 === 0 ? '14px' : i % 3 === 1 ? '5px' : '5px',
      shape: shapes[i % 3],
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      />

      {/* 충격파 링 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full border-4 border-yellow-400/60" style={{ animation: 'shockwaveExpand 0.8s ease-out forwards' }} />
        <div className="absolute w-32 h-32 rounded-full border-2 border-amber-300/40" style={{ animation: 'shockwaveExpand 0.8s 0.15s ease-out forwards' }} />
      </div>

      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.35) 0%, rgba(232,70,42,0.15) 50%, transparent 70%)', animation: 'glowPulse 1.6s ease-in-out infinite' }} />
      </div>

      {/* 컨페티 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((p) => (
          <span
            key={p.id}
            className={`absolute top-[-5%] ${p.shape}`}
            style={{
              left: p.left,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animationName: 'confettiFall',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 별 파티클 */}
      {[...Array(8)].map((_, i) => (
        <Star
          key={i}
          className="absolute pointer-events-none text-yellow-300 fill-yellow-300"
          style={{
            width: `${12 + (i % 3) * 6}px`,
            height: `${12 + (i % 3) * 6}px`,
            top: `${10 + (i * 12) % 80}%`,
            left: `${5 + (i * 13) % 90}%`,
            animation: `sparkle ${1.2 + (i % 4) * 0.3}s ease-in-out ${i * 150}ms infinite`,
            opacity: 0.8,
          }}
        />
      ))}

      {/* 메인 카드 */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        style={{ animation: 'mapaePop 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="bg-gradient-to-br from-[#2D0A02] via-[#7A1508] to-[#D44010] p-6 text-center relative overflow-hidden">

          {/* 카드 내부 반짝임 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,220,100,0.3) 0%, transparent 70%)', animation: 'glowPulse 1.8s ease-in-out infinite' }} />
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400" />

          {/* 마패 이미지 */}
          <div className="relative mb-3" style={{ animation: 'mapaeFloat 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <img src={mapaeImage} alt="마패" className="w-40 h-40 mx-auto object-contain drop-shadow-[0_8px_24px_rgba(245,166,35,0.7)]" style={{ animation: 'floatMapae 3s ease-in-out infinite' }} />
            <Sparkles className="absolute left-1/2 -translate-x-20 top-2 w-6 h-6 text-yellow-300" style={{ animation: 'sparkle 1.4s ease-in-out infinite' }} />
            <Sparkles className="absolute left-1/2 translate-x-12 top-8 w-5 h-5 text-yellow-200" style={{ animation: 'sparkle 1.8s 0.4s ease-in-out infinite' }} />
            <Sparkles className="absolute left-1/2 -translate-x-4 bottom-2 w-4 h-4 text-amber-300" style={{ animation: 'sparkle 1.2s 0.8s ease-in-out infinite' }} />
          </div>

          {/* 순위 배지 */}
          {rl ? (
            <div className="mb-3" style={{ animation: 'rankReveal 0.7s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r ${rl.color} shadow-lg border border-white/30`}>
                <span className="text-2xl">{rl.emoji}</span>
                <span className="text-2xl font-black text-white drop-shadow">{rl.label} 달성!</span>
              </div>
              <p className="text-xs text-yellow-200/70 mt-1.5 font-medium">최종 순위가 확정되었습니다</p>
            </div>
          ) : (
            <div className="mb-3" style={{ animation: 'rankReveal 0.7s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 border border-yellow-300/40">
                <span className="text-xl">🏅</span>
                <span className="text-lg font-black text-yellow-100">마패 {mapaeCount}개 획득!</span>
              </div>
            </div>
          )}

          {/* 타이틀 */}
          <h2 className="text-2xl font-black text-white mb-1 drop-shadow-lg" style={{ animation: 'rankReveal 0.6s 0.6s both' }}>
            빙고 {lineCount}줄 달성! 🎖️
          </h2>
          <p className="text-sm text-yellow-100/80 mb-5 font-medium" style={{ animation: 'rankReveal 0.6s 0.7s both' }}>
            {rl
              ? `우리 조가 ${rl.label}를 차지했습니다!\n끝까지 달려봐요!`
              : `적토마 마패 ${mapaeCount}개 보유!\n계속 이 기세로 달려봐요!`}
          </p>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-900 font-black rounded-full px-10 py-3 shadow-lg shadow-amber-500/40 text-base border-0"
            style={{ animation: 'rankReveal 0.6s 0.9s both' }}
          >
            🏆 신나게 달리자!
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ── 일반 빙고 줄 달성 ────────────────────────────────────── */
const LineCelebration: React.FC<{ lineCount: number; onClose: () => void }> = ({ lineCount, onClose }) => {
  const confettiPieces = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((piece) => (
          <span
            key={piece}
            className="absolute top-[-20%] w-1.5 h-4 rounded-full animate-confetti-fall"
            style={{
              left: `${6 + piece * 5.8}%`,
              backgroundColor: piece % 2 === 0 ? '#F5A623' : '#E8462A',
              animationDelay: `${piece * 120}ms`,
              animationDuration: `${2200 + (piece % 4) * 350}ms`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-br from-[#E8462A] via-[#F07030] to-[#F5A623] p-8 text-center">
          <div className="inline-block mb-5 animate-bounce-in">
            <div className="w-20 h-20 bg-white/20 border-2 border-white/35 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg animate-wiggle">
              <Gem className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-1 drop-shadow">
            빙고 {lineCount}줄 달성!
          </h2>
          <p className="text-base text-white/90 mb-2 drop-shadow-sm">
            {lineCount === 1 ? '첫 번째 라인을 완성했어요 🎊' : `${lineCount}번째 빙고 라인 완성! 🎊`}
          </p>
          <p className="text-sm text-white/80 mb-6">
            이 기세를 이어가세요!<br />
            {lineCount % 2 === 1
              ? `${lineCount + 1}줄을 완성하면 마패 ${Math.floor((lineCount + 1) / 2)}개가 됩니다!`
              : '계속 빙고를 완성해 마패를 더 모으세요!'}
          </p>

          <Button
            onClick={onClose}
            className="bg-white hover:bg-white/95 text-[#E8462A] font-bold rounded-full px-10 shadow-lg"
          >
            🔥 계속 도전!
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ── 진입점 ───────────────────────────────────────────────── */
export const CelebrationModal: React.FC<CelebrationModalProps> = ({ type, lineCount, rank, onClose }) => {
  const timerRef = useRef<number | null>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // 마패 축하는 10초 후 자동 닫기
  useEffect(() => {
    if (type === 'complete') {
      timerRef.current = window.setTimeout(onClose, 10000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [type, onClose]);

  if (type === 'complete') {
    return <MapaeCelebration lineCount={lineCount} rank={rank} onClose={onClose} />;
  }
  return <LineCelebration lineCount={lineCount} onClose={onClose} />;
};
