import { useEffect, useState } from "react";
import { getAllContinents, getCountriesByContinent } from "@/lib/hints";
import { ContinentSection } from "@/components/ContinentSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ContinentData {
  continent: string;
  countries: string[];
}

const Index = () => {
  const [continentData, setContinentData] = useState<ContinentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const continents = await getAllContinents();
        
        const continentDataPromises = continents.map(async (continent) => {
          const countries = await getCountriesByContinent(continent);
          return { continent, countries };
        });
        
        const data = await Promise.all(continentDataPromises);
        setContinentData(data);
      } catch (error) {
        console.error('Error loading continents and countries:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-80 mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (continentData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">No Data Available</h1>
          <p className="text-xl text-muted-foreground">No continents or countries found in the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">GeoGuessr Meta Tracker</h1>
        
        {continentData.map(({ continent, countries }) => (
          <ContinentSection 
            key={continent} 
            continent={continent} 
            countries={countries} 
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
