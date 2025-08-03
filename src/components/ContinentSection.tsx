import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ContinentSectionProps {
  continent: string;
  countries: string[];
}

export const ContinentSection = ({ continent, countries }: ContinentSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold uppercase text-foreground">{continent}</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {countries.map((country) => (
          <Card 
            key={country}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border border-border bg-card"
            onClick={() => navigate(`/country/${encodeURIComponent(country)}`)}
          >
            <CardContent className="p-4">
              <p className="text-center font-medium text-card-foreground">{country}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};