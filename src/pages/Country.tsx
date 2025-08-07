import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHintsByCountry, formatMetaType, Hint } from "@/lib/hints";
import { HintCard } from "@/components/HintCard";
import { CountryProgress } from "@/components/CountryProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Map, Plus, Info, Camera, Route, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Country = () => {
  const { name } = useParams<{ name: string }>();
  const [hintsByMeta, setHintsByMeta] = useState<Record<string, Hint[]>>({});
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Map className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{countryName}</h1>
          </div>
          <Button
            onClick={() => navigate(`/add?country=${encodeURIComponent(countryName)}`)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Hint
          </Button>
        </div>

        {/* Country Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Country Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CountryProgress country={countryName} />
              
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photography Notes
                </h3>
                <Textarea
                  placeholder="Add notes about camera coverage, quality, blur patterns, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meta Types:</span>
                  <span className="font-medium">{metaTypes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Hints:</span>
                  <span className="font-medium">
                    {Object.values(hintsByMeta).reduce((acc, hints) => acc + hints.length, 0)}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(countryName)}`)}
                >
                  <Route className="h-4 w-4" />
                  Search All Hints
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {metaTypes.map((metaType) => (
          <div key={metaType} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {formatMetaType(metaType)}
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