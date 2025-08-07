import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getHintsByCountry } from "@/lib/hints";

interface CountryProgressProps {
  country: string;
  plonkitTotal?: number;
}

const CountryProgress = ({ country, plonkitTotal = 100 }: CountryProgressProps) => {
  const [hintCount, setHintCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHintCount = async () => {
      try {
        setLoading(true);
        const hints = await getHintsByCountry(country);
        const totalHints = Object.values(hints).reduce((acc, metaHints) => acc + metaHints.length, 0);
        setHintCount(totalHints);
      } catch (error) {
        console.error('Error loading hint count:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHintCount();
  }, [country]);

  if (loading) {
    return <div className="h-2 bg-muted rounded animate-pulse" />;
  }

  const progress = Math.min((hintCount / plonkitTotal) * 100, 100);
  const progressColor = progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Coverage Progress</span>
        <Badge variant="secondary" className="text-xs">
          {hintCount}/{plonkitTotal}
        </Badge>
      </div>
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-2"
        />
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {progress.toFixed(1)}% complete vs Plonkit reference
      </div>
    </div>
  );
};

export { CountryProgress };