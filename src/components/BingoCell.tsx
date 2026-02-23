import React from 'react';
import { BingoCell as BingoCellType } from '@/types/game';
import {
  Star, Check, Camera, Users, Utensils, Zap,
  Smile, Heart, Coffee, MapPin, Mountain, ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BingoCellProps {
  cell: BingoCellType;
  onClick: () => void;
  isInCompletedLine?: boolean;
  isJustCompleted?: boolean;
}

const getMissionIcon = (title: string) => {
  if (title.includes('단체') || title.includes('함께') || title.includes('팀원') || title.includes('팀')) return Users;
  if (title.includes('셀카') || title.includes('얼굴') || title.includes('사진') || title.includes('인증') || title.includes('네컷') || title.includes('찍')) return Camera;
  if (title.includes('먹방') || title.includes('빵') || title.includes('음식') || title.includes('간식')) return Utensils;
  if (title.includes('점프') || title.includes('자전거') || title.includes('활동') || title.includes('포즈') || title.includes('표현')) return Zap;
  if (title.includes('구입') || title.includes('아이템') || title.includes('쇼핑') || title.includes('소품')) return ShoppingBag;
  if (title.includes('커피') || title.includes('카페')) return Coffee;
  if (title.includes('길') || title.includes('앞에서') || title.includes('곳') || title.includes('어디') || title.includes('협업')) return MapPin;
  if (title.includes('산') || title.includes('풍경') || title.includes('자연') || title.includes('낙엽') || title.includes('꽃')) return Mountain;
  if (title.includes('사랑') || title.includes('하트') || title.includes('웃음') || title.includes('표정') || title.includes('미소')) return Heart;
  return Smile;
};

export const BingoCell: React.FC<BingoCellProps> = ({
  cell,
  onClick,
  isInCompletedLine,
  isJustCompleted,
}) => {
  const { mission, isCompleted, isBonusAwarded } = cell;
  const isBonus = mission.isBonus;
  const Icon = getMissionIcon(mission.title);

  // 빙고 줄에 속한 완료 칸 → 황금 스타일
  const isGold = isCompleted && isInCompletedLine;

  return (
    <button
      onClick={onClick}
      className={cn(
        'cell-tile relative w-full aspect-square flex flex-col items-center justify-center overflow-hidden select-none group',
        // 황금 줄 (보너스 포함)
        isGold && 'cell-tile-gold',
        // 일반 완료 (줄 미포함)
        isCompleted && !isBonus && !isGold && 'cell-tile-completed',
        // 보너스 완료 (줄 미포함)
        isBonus && isCompleted && !isGold && 'cell-tile-bonus-done',
        // 보너스 미완료
        isBonus && !isCompleted && 'cell-tile-bonus',
      )}
    >

      {/* ══ 황금 줄 칸 ══ */}
      {isGold && (
        <>
          <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 px-1 w-full">
            <div className="flex items-center justify-center rounded-full w-6 h-6 sm:w-7 sm:h-7 bg-white/50 border border-white/60">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A1E00] stroke-[3]" />
            </div>
            <span className="text-[8.5px] sm:text-[10px] font-black text-[#4A1E00] leading-tight break-keep text-center w-full px-0.5">
              {mission.isBonus ? 'BONUS ✓' : mission.title}
            </span>
          </div>
          {isBonusAwarded && (
            <div className="absolute top-1 left-1 z-20">
              <span className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-white/50 border border-white/60">
                <Star className="w-2 h-2 text-[#4A1E00] fill-[#4A1E00]" />
                <span className="text-[7px] font-black text-[#4A1E00] leading-none">+보너스</span>
              </span>
            </div>
          )}
        </>
      )}

      {/* ══ 일반 완료 칸 (줄 아님) ══ */}
      {isCompleted && !isBonus && !isGold && (
        <>
          <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 px-1 w-full">
            <div className="flex items-center justify-center rounded-full mb-0.5 w-6 h-6 sm:w-7 sm:h-7 bg-white/50 border border-white/60">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5A2010] stroke-[3]" />
            </div>
            <span className="text-[8.5px] sm:text-[10px] font-black text-[#5A2010] leading-tight break-keep text-center w-full px-0.5">
              {mission.title}
            </span>
          </div>
          {isBonusAwarded && (
            <div className="absolute top-1 left-1 z-20">
              <span className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-white/50 border border-white/60">
                <Star className="w-2 h-2 text-[#5A2010] fill-[#5A2010]" />
                <span className="text-[7px] font-black text-[#5A2010] leading-none">+보너스</span>
              </span>
            </div>
          )}
        </>
      )}

      {/* ══ 보너스 완료 (줄 미포함) ══ */}
      {isBonus && isCompleted && !isGold && (
        <>
          <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 px-1 w-full">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 mb-0.5">
              <Star className="absolute w-7 h-7 sm:w-8 sm:h-8 text-[#E09858] fill-[#E09858]" />
              <Check className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3.5] z-10" />
            </div>
            <span className="text-[8.5px] sm:text-[10px] font-black text-[#3A1A00] leading-tight break-keep text-center w-full px-0.5 tracking-tight">
              BONUS ✓
            </span>
          </div>
        </>
      )}

      {/* ══ 보너스 미완료 ══ */}
      {isBonus && !isCompleted && (
        <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 w-full h-full">
          <Star
            className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,220,80,0.9))' }}
          />
          <span className="text-[9px] sm:text-[10px] font-black text-white tracking-widest uppercase drop-shadow-sm">
            Bonus
          </span>
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.25) 0%, transparent 70%)' }}
          />
        </div>
      )}

      {/* ══ 미완료 일반 칸 ══ */}
      {!isBonus && !isCompleted && (
        <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 px-1 w-full">
          <div className={cn(
            'flex items-center justify-center rounded-full mb-0.5 transition-all duration-200',
            'w-6 h-6 sm:w-7 sm:h-7',
            'bg-[#E8462A]/10 group-hover:bg-[#E8462A]/20',
          )}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A83018] group-hover:text-[#7A1808] transition-colors" />
          </div>
          <span className={cn(
            'font-bold leading-snug break-keep text-center w-full transition-colors',
            'text-[8.5px] sm:text-[10px]',
            'text-[#5A1E0E] group-hover:text-[#3D1008]',
          )}>
            {mission.title}
          </span>
        </div>
      )}

      {/* ══ 미션 성공 오버레이 ══ */}
      {isJustCompleted && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center rounded-[inherit] overflow-hidden">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
          <span className="relative px-2 py-1 rounded-full bg-white text-[10px] font-black text-primary shadow-lg animate-bounce-in border border-primary/20">
            미션 성공! 🎉
          </span>
        </div>
      )}
    </button>
  );
};
