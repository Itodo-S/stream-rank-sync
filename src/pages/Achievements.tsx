import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { mockAchievements } from "@/utils/mockData";
import { cn } from "@/lib/utils";

const Achievements = () => {
  const unlockedAchievements = mockAchievements.filter(a => a.unlockedAt);
  const lockedAchievements = mockAchievements.filter(a => !a.unlockedAt);

  const rarityColors = {
    common: "border-muted-foreground",
    rare: "border-primary",
    epic: "border-secondary",
    legendary: "border-warning"
  };

  const rarityGlows = {
    common: "",
    rare: "shadow-glow",
    epic: "shadow-lg shadow-secondary/30",
    legendary: "shadow-lg shadow-warning/50"
  };

  const AchievementCard = ({ achievement, isLocked }: { achievement: typeof mockAchievements[0], isLocked: boolean }) => (
    <Card 
      className={cn(
        "p-6 border-2 transition-all",
        isLocked ? "opacity-50 grayscale" : rarityGlows[achievement.rarity],
        rarityColors[achievement.rarity]
      )}
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-6xl",
            isLocked && "blur-sm"
          )}>
            {isLocked ? <Lock className="h-16 w-16 text-muted-foreground" /> : achievement.icon}
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium capitalize",
            achievement.rarity === 'common' && "bg-muted text-muted-foreground",
            achievement.rarity === 'rare' && "bg-primary/20 text-primary",
            achievement.rarity === 'epic' && "bg-secondary/20 text-secondary",
            achievement.rarity === 'legendary' && "bg-warning/20 text-warning"
          )}>
            {achievement.rarity}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{achievement.name}</h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>

        {/* Date */}
        {achievement.unlockedAt && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Award className="h-10 w-10 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground">Track your gaming milestones and unlock rare achievements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-primary/20 bg-gradient-glow">
            <p className="text-sm text-muted-foreground mb-1">Total Unlocked</p>
            <p className="text-3xl font-bold text-primary">{unlockedAchievements.length}/{mockAchievements.length}</p>
          </Card>
          <Card className="p-4 border-border">
            <p className="text-sm text-muted-foreground mb-1">Common</p>
            <p className="text-2xl font-bold">{mockAchievements.filter(a => a.rarity === 'common').length}</p>
          </Card>
          <Card className="p-4 border-border">
            <p className="text-sm text-muted-foreground mb-1">Rare</p>
            <p className="text-2xl font-bold text-primary">{mockAchievements.filter(a => a.rarity === 'rare').length}</p>
          </Card>
          <Card className="p-4 border-border">
            <p className="text-sm text-muted-foreground mb-1">Legendary</p>
            <p className="text-2xl font-bold text-warning">{mockAchievements.filter(a => a.rarity === 'legendary').length}</p>
          </Card>
        </div>

        {/* Unlocked Achievements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Unlocked</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} isLocked={false} />
            ))}
          </div>
        </div>

        {/* Locked Achievements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Locked</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} isLocked={true} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Achievements;
