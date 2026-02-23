import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="w-full max-w-md">
        <div className="game-container">
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary to-secondary/85 px-6 py-5 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 rounded-full mb-2 backdrop-blur-sm">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-heading-1 text-white">관리자 로그인</h1>
            <p className="text-body-sm text-white/65">관리자 계정으로 로그인하세요</p>
          </div>

          {/* Form */}
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/8 border border-destructive/15 rounded-lg text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-body-sm">{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="adminId" className="text-body-sm font-medium text-foreground/65">아이디</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="adminId" type="text" placeholder="관리자 아이디" value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    className="h-11 pl-10 rounded-lg border-border bg-muted/30 focus:bg-card" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-body-sm font-medium text-foreground/65">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 rounded-lg border-border bg-muted/30 focus:bg-card" required />
                </div>
              </div>

              <Button type="submit" size="xl"
                className="w-full mt-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-full h-12 shadow-lg shadow-secondary/15"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    로그인 중...
                  </span>
                ) : '로그인'}
              </Button>
            </form>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-caption text-muted-foreground hover:text-primary transition-colors">
            ← 게임 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};
