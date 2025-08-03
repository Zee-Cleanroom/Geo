import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHintsByMeta, capitalizeMetaType, Hint } from "@/lib/hints";
import { HintCard } from "@/components/HintCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MetaDetail = () => {
  const { meta_type } = useParams<{ meta_type: string }>();
  const [hintsByCountry, setHintsByCountry] = useState<Record<string, Hint[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const metaType = meta_type ? decodeURIComponent(meta_type) : '';

  useEffect(() => {
    const loadHints = async () => {
      if (!metaType) return;
      
      try {
        setLoading(true);
        const hints = await getHintsByMeta(metaType);
        setHintsByCountry(hints);
      } catch (error) {
        console.error('Error loading hints for meta type:', error);
        toast({
          title: "Error",
          description: "Failed to load hints. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHints();
  }, [metaType, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-32 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const countries = Object.keys(hintsByCountry);

  if (countries.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <ChevronRight className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              {capitalizeMetaType(metaType)}
            </h1>
          </div>
          
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No hints found for {capitalizeMetaType(metaType)}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <ChevronRight className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">
            {capitalizeMetaType(metaType)}
          </h1>
        </div>

        {countries.map((country) => (
          <div key={country} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {country}
            </h2>
            
            <div className="space-y-4">
              {hintsByCountry[country].map((hint) => (
                <HintCard key={hint.id} hint={hint} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetaDetail;