import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addHint, getAllCountries, getAllMetaTypes, addMetaType } from "@/lib/hints";

const formSchema = z.object({
  country: z.string().min(1, "Country is required"),
  meta_type: z.string().min(1, "Meta type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const Add = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [metaTypes, setMetaTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCustomMetaType, setIsCustomMetaType] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "",
      meta_type: "",
      description: "",
      image_url: "",
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const [countriesData, metaTypesData] = await Promise.all([
          getAllCountries(),
          getAllMetaTypes(),
        ]);
        
        // Filter out empty strings, null, or undefined values
        const filteredCountries = countriesData.filter(country => country && country.trim() !== '');
        const filteredMetaTypes = metaTypesData.filter(metaType => metaType && metaType.trim() !== '');
        
        console.log('Countries data:', filteredCountries);
        console.log('Meta types data:', filteredMetaTypes);
        
        setCountries(filteredCountries);
        setMetaTypes(filteredMetaTypes);
      } catch (error) {
        console.error('Error loading form options:', error);
        toast({
          title: "Error",
          description: "Failed to load form options. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [toast]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      
      // If it's a custom meta type, add it to the meta_types table first
      if (isCustomMetaType) {
        await addMetaType(data.meta_type);
      }
      
      // Find continent for the selected country
      const continentMap: Record<string, string> = {
        // This is a simplified approach - in a real app, you'd query the database
        // For now, we'll use a basic mapping
      };
      
      const hintData = {
        country: data.country,
        continent: "Unknown", // Simplified for now
        meta_type: data.meta_type,
        description: data.description,
        image_url: data.image_url || undefined,
      };
      
      await addHint(hintData);
      
      toast({
        title: "Success",
        description: "Hint added successfully!",
      });
      
      form.reset();
    } catch (error) {
      console.error('Error adding hint:', error);
      toast({
        title: "Error",
        description: "Failed to add hint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="bg-card border rounded-lg p-6">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <PlusCircle className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Add New Hint</h1>
        </div>

        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Submit a GeoGuessr Hint</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.filter(country => country && country.trim()).map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="meta_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Type</FormLabel>
                      {isCustomMetaType ? (
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new meta type..."
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsCustomMetaType(false);
                                field.onChange("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </FormControl>
                      ) : (
                        <Select 
                          onValueChange={(value) => {
                            if (value === "__ADD_NEW__") {
                              setIsCustomMetaType(true);
                              field.onChange("");
                            } else {
                              field.onChange(value);
                            }
                          }} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a meta type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {metaTypes.filter(metaType => metaType && metaType.trim()).map((metaType) => (
                              <SelectItem key={metaType} value={metaType}>
                                {metaType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                            <SelectItem value="__ADD_NEW__" className="text-primary font-medium">
                              + Add New Meta Type
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the hint or meta feature..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Adding Hint..." : "Add Hint"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Add;