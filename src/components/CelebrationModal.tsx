import React from 'react';
import { Button } from '@/components/ui/button';
import { Gem, Sparkles } from 'lucide-react';
import mapaeImage from '@/assets/mapae-red.png';

interface CelebrationModalProps {
  type: 'line' | 'complete';
  lineCount: number;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ type, lineCount, onClose }) => {
  const isComplete = type === 'complete';
  const confettiPieces = Array.from({ length: 14 }, (_, i) => i);
  const mapaeCount = Math.floor(lineCount / 2);
  const cheerMessages = [
    '🎉 대단해요!',
    '🔥 최고의 팀!',
    '✨ 눈부신 활약!',
    '🏆 이 기세로!',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl animate-scale-in">
        {!isComplete && (
          <div className="absolute inset-0 pointer-events-none">
            {confettiPieces.map((piece) => (
              <span
                key={piece}
                className="absolute top-[-20%] w-1.5 h-4 rounded-full animate-confetti-fall"
                style={{
                  left: `${6 + piece * 6.3}%`,
                  backgroundColor: piece % 2 === 0 ? '#F5A623' : '#E8462A',
                  animationDelay: `${piece * 120}ms`,
                  animationDuration: `${2200 + (piece % 4) * 350}ms`,
                }}
              />
            ))}
          </div>
        )}

        {isComplete && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,235,173,0.4),transparent_65%)]" />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-yellow-200/25 blur-3xl animate-glow-pulse" />
          </div>
        )}

        <div className={`relative p-8 text-center ${
          isComplete
            ? 'bg-gradient-to-br from-[#3D1008] via-[#A02010] to-[#F5A623]'
            : 'bg-gradient-to-br from-[#E8462A] via-[#F07030] to-[#F5A623]'
        }`}>
          {!isComplete ? (
            <div className="inline-block mb-5 animate-bounce-in">
              <div className="w-20 h-20 bg-white/20 border-2 border-white/35 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg animate-wiggle">
                <Gem className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
          ) : (
            <div className="mb-6 relative">
              <img
                src={mapaeImage}
                alt="적토마 마패"
                className="w-36 h-36 mx-auto object-contain drop-shadow-2xl animate-float"
              />
              <Sparkles className="w-5 h-5 text-yellow-100 absolute left-1/2 -translate-x-16 top-4 animate-sparkle" />
              <Sparkles className="w-4 h-4 text-yellow-100 absolute left-1/2 translate-x-11 top-10 animate-sparkle" />
            </div>
          )}

          {isComplete ? (
            <>
              <h2 className="text-heading-1 text-white mb-1 drop-shadow">
                빙고 {lineCount}줄 달성!
              </h2>
              <p className="text-body-lg text-yellow-100 mb-1 drop-shadow-sm font-bold">
                적토마 마패 {mapaeCount}개 보유 🎖️
              </p>
              <p className="text-body text-white/80 mb-5">
                우리 조의 열정이 빛나는 순간입니다.<br />
                끝까지 함께 달려봐요!
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                {cheerMessages.map((msg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 border border-yellow-100/40 text-yellow-100 text-[12px] font-bold animate-bounce-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {msg}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-heading-1 text-white mb-1 drop-shadow">
                빙고 {lineCount}줄 달성!
              </h2>
              <p className="text-body-lg text-white/90 mb-2 drop-shadow-sm">
                {lineCount === 1 ? '첫 번째 라인을 완성했어요 🎊' : `${lineCount}번째 빙고 라인 완성! 🎊`}
              </p>
              <p className="text-body text-white/80 mb-6">
                이 기세를 이어가세요!<br />
                {lineCount % 2 === 1
                  ? `${lineCount + 1}줄을 완성하면 마패 ${Math.floor((lineCount + 1) / 2)}개가 됩니다!`
                  : '계속 빙고를 완성해 마패를 더 모으세요!'}
              </p>
            </>
          )}

          <Button
            onClick={onClose} size="lg"
            className="bg-white hover:bg-white/95 text-[#E8462A] font-bold rounded-full px-10 shadow-lg"
          >
            {isComplete ? '🏆 신나게 달리자!' : '🔥 계속 도전!'}
          </Button>
        </div>
      </div>
    </div>
  );
};
