import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHintsByCountry, capitalizeMetaType, Hint } from "@/lib/hints";
import { HintCard } from "@/components/HintCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Country = () => {
  const { name } = useParams<{ name: string }>();
  const [hintsByMeta, setHintsByMeta] = useState<Record<string, Hint[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const countryName = name ? decodeURIComponent(name) : '';

  useEffect(() => {
    const loadHints = async () => {
      if (!countryName) return;
      
      try {
        setLoading(true);
        const hints = await getHintsByCountry(countryName);
        setHintsByMeta(hints);
      } catch (error) {
        console.error('Error loading hints for country:', error);
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
  }, [countryName, toast]);

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

  const metaTypes = Object.keys(hintsByMeta);

  if (metaTypes.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Map className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{countryName}</h1>
          </div>
          
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No hints found for {countryName}.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Map className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">{countryName}</h1>
        </div>

        {metaTypes.map((metaType) => (
          <div key={metaType} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {capitalizeMetaType(metaType)}
            </h2>
            
            <div className="space-y-4">
              {hintsByMeta[metaType].map((hint) => (
                <HintCard key={hint.id} hint={hint} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Country;