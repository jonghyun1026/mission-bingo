import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import mapaeImage from '@/assets/mapae-red.png';

export const AdminLoginForm: React.FC = () => {
  const { signIn } = useAdminAuth();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const { error: signInError } = await signIn(adminId, password);
    if (signInError) setError(signInError);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="glass-card-premium rounded-3xl overflow-hidden relative">
          {/* 상단 컬러 바 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          {/* 헤더 */}
          <div className="bg-gradient-to-r from-[#3A1E08]/90 to-[#6A3818]/80 backdrop-blur-sm px-6 py-5 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-3xl mb-3 border border-white/20 shadow-lg">
              <Shield className="w-7 h-7 text-white/90" />
            </div>
            <h1 className="text-lg font-black text-white leading-tight">관리자 로그인</h1>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <img src={mapaeImage} alt="" className="w-3 h-3 object-contain opacity-60" />
              <p className="text-[11px] text-white/50">관리자 계정으로 로그인하세요</p>
            </div>
          </div>

          {/* 폼 */}
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/8 border border-destructive/20 rounded-2xl text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="adminId" className="text-xs font-bold text-foreground/60 ml-1">아이디</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="adminId"
                    type="text"
                    placeholder="관리자 아이디"
                    value={adminId}
                    onChange={e => setAdminId(e.target.value)}
                    className="h-11 pl-10 rounded-2xl border-white/60 bg-white/50 focus:bg-white/80 font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-foreground/60 ml-1">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-11 pl-10 rounded-2xl border-white/60 bg-white/50 focus:bg-white/80 font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-1 h-12 rounded-2xl bg-gradient-to-r from-[#3A1E08] to-[#6A3818] hover:from-[#4A2A10] hover:to-[#7A4020] text-white font-black text-sm shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    로그인 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    로그인
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            게임 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};
