import { useGame } from '@/contexts/GameContext';
import { LoginForm } from '@/components/LoginForm';
import { BingoBoard } from '@/components/BingoBoard';

const Index = () => {
  const { user, sessionRestoring } = useGame();

  if (sessionRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return user ? <BingoBoard /> : <LoginForm />;
};

export default Index;
