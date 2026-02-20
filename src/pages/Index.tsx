import { useGame } from '@/contexts/GameContext';
import { LoginForm } from '@/components/LoginForm';
import { BingoBoard } from '@/components/BingoBoard';

const Index = () => {
  const { user } = useGame();

  return user ? <BingoBoard /> : <LoginForm />;
};

export default Index;
