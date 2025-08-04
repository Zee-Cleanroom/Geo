import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMetaTypes, formatMetaType } from "@/lib/hints";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Metas = () => {
  const [metaTypes, setMetaTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadMetaTypes = async () => {
      try {
        setLoading(true);
        const types = await getAllMetaTypes();
        setMetaTypes(types);
      } catch (error) {
        console.error('Error loading meta types:', error);
        toast({
          title: "Error",
          description: "Failed to load meta types. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMetaTypes();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (metaTypes.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Meta Types</h1>
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No meta types found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Meta Types</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metaTypes.map((metaType) => (
            <Card 
              key={metaType}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border border-border bg-card"
              onClick={() => navigate(`/meta/${encodeURIComponent(metaType)}`)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium text-card-foreground">
                  {formatMetaType(metaType)}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metas;