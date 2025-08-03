import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchHints, capitalizeMetaType, Hint } from "@/lib/hints";
import { HintCard } from "@/components/HintCard";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, Record<string, Hint[]>>>({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults({});
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setHasSearched(true);
        const searchResults = await searchHints(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Error searching hints:', error);
        toast({
          title: "Error",
          description: "Failed to search hints. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, 500),
    [toast]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const metaTypes = Object.keys(results);
  const hasResults = metaTypes.length > 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <SearchIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Search Hints</h1>
        </div>

        <div className="relative mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by description, country, or meta type..."
            value={query}
            onChange={handleInputChange}
            className="pl-10 text-lg h-12"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {loading && hasSearched && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-4" />
                <Card className="mb-4">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2].map((j) => (
                        <Skeleton key={j} className="h-32 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {!loading && hasSearched && !hasResults && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Results Found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search terms or searching for different keywords.
            </p>
          </div>
        )}

        {!loading && hasSearched && hasResults && (
          <div className="space-y-8">
            {metaTypes.map((metaType) => (
              <div key={metaType} className="animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  {capitalizeMetaType(metaType)}
                </h2>

                {Object.entries(results[metaType]).map(([country, hints]) => (
                  <Card key={country} className="mb-6 border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg text-card-foreground">
                        {country}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {hints.map((hint) => (
                          <div key={hint.id} className="animate-fade-in">
                            <HintCard hint={hint} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Search GeoGuessr Hints</h2>
            <p className="text-muted-foreground">
              Enter keywords to search through hints by description, country, or meta type.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default Search;