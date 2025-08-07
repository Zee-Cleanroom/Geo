import { Card, CardContent } from "@/components/ui/card";
import { Hint } from "@/lib/hints";
import { format } from "date-fns";

interface HintCardProps {
  hint: Hint;
}

export const HintCard = ({ hint }: HintCardProps) => {
  return (
    <Card className="mb-4 border border-border bg-card animate-fade-in">
      <CardContent className="p-4">
        <p className="text-card-foreground mb-3 leading-relaxed">{hint.description}</p>
        
        {hint.image_url && (
          <div className="mb-3">
            <img
              src={hint.image_url}
              alt="Hint image"
              className="rounded-md border border-border"
              style={{
                maxHeight: '160px',
                maxWidth: '300px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
      </CardContent>
    </Card>
  );
};