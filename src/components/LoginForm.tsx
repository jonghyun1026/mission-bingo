import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { lookupMember } from '@/lib/gameApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Gamepad2, Sparkles, Shield } from 'lucide-react';
import mapaeImage from '@/assets/mapae-red.png';

const cohortOptions = Array.from({ length: 11 }, (_, i) => `${i + 6}기`);

export const LoginForm: React.FC = () => {
  const { login, fetchTeams, teams, isLoading } = useGame();
  const [formData, setFormData] = useState({
    teamId: '', teamName: '', name: '', school: '', major: '', cohort: '',
  });
  const [autoFilled, setAutoFilled] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);
  useEffect(() => { setMounted(true); }, []);

  // 팀 또는 이름이 바뀔 때 DB에서 기존 멤버 정보 조회 (600ms 디바운스)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!formData.teamId || formData.name.trim().length < 2) {
      setAutoFilled(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLookingUp(true);
      try {
        const member = await lookupMember(formData.teamId, formData.name.trim());
        if (member) {
          setFormData((prev) => ({
            ...prev,
            school: member.school,
            major: member.major,
            cohort: member.cohort,
          }));
          setAutoFilled(true);
        } else {
          setAutoFilled(false);
        }
      } catch {
        setAutoFilled(false);
      } finally {
        setIsLookingUp(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.teamId, formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.teamId && formData.name && formData.school && formData.major && formData.cohort) {
      setIsSubmitting(true);
      setError(null);
      try {
        await login(formData.teamId, formData.teamName, formData.name, formData.school, formData.major, formData.cohort);
      } catch (err) {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTeamChange = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    setFormData({ ...formData, teamId, teamName: team?.name || '' });
  };

  const isValid = formData.teamId && formData.name && formData.school && formData.major && formData.cohort;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-8 sm:pt-4 pb-8 relative overflow-x-hidden overflow-y-auto">

      {/* 플로팅 장식 요소들 */}
      <div className="absolute top-[10%] left-[8%] w-16 h-16 bg-primary/8 rounded-full blur-xl animate-float" />
      <div className="absolute top-[20%] right-[12%] w-20 h-20 bg-accent/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[25%] left-[15%] w-12 h-12 bg-primary/6 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[15%] right-[8%] w-14 h-14 bg-accent/8 rounded-full blur-lg animate-float" style={{ animationDelay: '0.5s' }} />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* 메인 카드 */}
        <div className="glass-card-premium rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden">

          {/* 상단 그라데이션 바 */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

          {/* 장식용 배경 블러 */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-primary/8 rounded-full blur-3xl" />

          {/* 헤더 */}
          <div className="text-center mb-8 relative">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img
                src={mapaeImage} alt=""
                className="w-11 h-11 object-contain drop-shadow-md rotate-12 transition-transform hover:rotate-0 hover:scale-110 duration-300"
              />
              <div>
                <h1 className="text-display text-gradient drop-shadow-sm leading-tight">미션 빙고</h1>
              </div>
              <img
                src={mapaeImage} alt=""
                className="w-11 h-11 object-contain drop-shadow-md -rotate-12 scale-x-[-1] transition-transform hover:rotate-0 hover:scale-110 duration-300"
              />
            </div>
            <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              즐거운 빙고 게임을 시작해볼까요?
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive animate-fade-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <div className={`space-y-1.5 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.1s' }}>
              <Label className="text-sm font-bold text-foreground/70 ml-1">어떤 조인가요?</Label>
              <Select value={formData.teamId} onValueChange={handleTeamChange}>
                <SelectTrigger className="h-12 rounded-2xl border-2 border-border/60 bg-white/60 hover:bg-white/80 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm">
                  <SelectValue placeholder="조를 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-white/60 shadow-xl backdrop-blur-xl bg-white/95">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id} className="rounded-xl my-0.5 cursor-pointer focus:bg-primary/8 font-medium">
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`grid grid-cols-2 gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.15s' }}>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground/70 ml-1">이름</Label>
                <Input type="text" placeholder="홍길동" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-2xl border-2 border-border/60 bg-white/60 hover:bg-white/80 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground/70 ml-1">기수</Label>
                <Select value={formData.cohort} onValueChange={(v) => setFormData({ ...formData, cohort: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 border-border/60 bg-white/60 hover:bg-white/80 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-white/60 shadow-xl backdrop-blur-xl bg-white/95 max-h-[200px]">
                    {cohortOptions.map((c) => (
                      <SelectItem key={c} value={c} className="rounded-xl my-0.5 cursor-pointer focus:bg-primary/8 font-medium">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLookingUp && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-muted/60 border border-border text-muted-foreground text-xs font-medium">
                <div className="w-3 h-3 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
                등록된 정보 확인 중...
              </div>
            )}
            {!isLookingUp && autoFilled && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                <span>✓</span>
                등록된 정보로 자동으로 채워졌어요
              </div>
            )}

            <div className={`space-y-1.5 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.2s' }}>
              <Label className="text-sm font-bold text-foreground/70 ml-1">학교</Label>
              <Input type="text" placeholder="OO대학교" value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="h-12 rounded-2xl border-2 border-border/60 bg-white/60 hover:bg-white/80 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm" />
            </div>

            <div className={`space-y-1.5 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.25s' }}>
              <Label className="text-sm font-bold text-foreground/70 ml-1">전공</Label>
              <Input type="text" placeholder="컴퓨터공학과" value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="h-12 rounded-2xl border-2 border-border/60 bg-white/60 hover:bg-white/80 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm" />
            </div>

            <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0.3s' }}>
              <Button
                type="submit" size="lg"
                className="w-full mt-4 bg-gradient-to-r from-primary via-orange-500 to-primary text-white font-bold rounded-2xl h-14 text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:shadow-none"
                disabled={!isValid || isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    입장하는 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    게임 시작하기
                    <Gamepad2 className="w-5 h-5 text-white/90" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-border/30 text-center relative space-y-3">
            <p className="text-xs text-muted-foreground bg-accent/8 inline-block px-4 py-1.5 rounded-full font-medium border border-accent/15">
              💡 같은 조 친구들과 함께 빙고를 완성하세요!
            </p>
            <div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <Shield className="w-3 h-3" />
                관리자 페이지
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
