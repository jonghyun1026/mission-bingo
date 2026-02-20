import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Circle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  school: string;
  major: string;
  cohort: string;
  isOnline: boolean;
}

interface TeamMembersModalProps {
  teamName: string;
  members: TeamMember[];
  onClose: () => void;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({ 
  teamName, 
  members, 
  onClose 
}) => {
  const onlineCount = members.filter(m => m.isOnline).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-body-lg font-bold text-foreground">{teamName}</h2>
              <p className="text-caption text-muted-foreground">
                접속 {onlineCount}명 / 전체 {members.length}명
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-body text-muted-foreground">아직 접속한 조원이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <Circle className={`w-2.5 h-2.5 flex-shrink-0 ${member.isOnline ? 'text-success fill-success' : 'text-muted-foreground/30 fill-muted-foreground/30'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-bold text-foreground truncate">{member.name}</p>
                    <p className="text-caption text-muted-foreground truncate">
                      {member.school} · {member.major} · {member.cohort}
                    </p>
                  </div>
                  <span className={`text-caption font-bold px-2.5 py-0.5 rounded-full ${
                    member.isOnline 
                      ? 'bg-success/10 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {member.isOnline ? '접속 중' : '오프라인'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full"
            onClick={onClose}
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};
