import { supabase } from "@/integrations/supabase/client";

export interface Hint {
  id: string;
  country: string;
  continent: string;
  meta_type: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export interface AddHintData {
  country: string;
  continent: string;
  meta_type: string;
  description: string;
  image_url?: string;
}

// 1. Get all hints
export async function getAllHints(): Promise<Hint[]> {
  const { data, error } = await supabase
    .from('hints')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

// 2. Get all continents (unique)
export async function getAllContinents(): Promise<string[]> {
  const { data, error } = await supabase
    .from('hints')
    .select('continent')
    .order('continent');
    
  if (error) throw error;
  
  const uniqueContinents = [...new Set(data?.map(item => item.continent) || [])];
  return uniqueContinents;
}

// 3. Get countries by continent
export async function getCountriesByContinent(continent: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('hints')
    .select('country')
    .eq('continent', continent)
    .order('country');
    
  if (error) throw error;
  
  const uniqueCountries = [...new Set(data?.map(item => item.country) || [])];
  return uniqueCountries;
}

// 4. Get hints by country, grouped by meta_type
export async function getHintsByCountry(country: string): Promise<Record<string, Hint[]>> {
  const { data, error } = await supabase
    .from('hints')
    .select('*')
    .eq('country', country)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  const grouped: Record<string, Hint[]> = {};
  (data || []).forEach(hint => {
    if (!grouped[hint.meta_type]) {
      grouped[hint.meta_type] = [];
    }
    grouped[hint.meta_type].push(hint);
  });
  
  return grouped;
}

// 5. Get all meta types (unique)
export async function getAllMetaTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('hints')
    .select('meta_type')
    .order('meta_type');
    
  if (error) throw error;
  
  const uniqueMetaTypes = [...new Set(data?.map(item => item.meta_type) || [])];
  return uniqueMetaTypes;
}

// 6. Get hints by meta type, grouped by country, sorted desc
export async function getHintsByMeta(meta_type: string): Promise<Record<string, Hint[]>> {
  const { data, error } = await supabase
    .from('hints')
    .select('*')
    .eq('meta_type', meta_type)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  const grouped: Record<string, Hint[]> = {};
  (data || []).forEach(hint => {
    if (!grouped[hint.country]) {
      grouped[hint.country] = [];
    }
    grouped[hint.country].push(hint);
  });
  
  // Sort countries alphabetically
  const sortedGrouped: Record<string, Hint[]> = {};
  Object.keys(grouped)
    .sort()
    .forEach(country => {
      sortedGrouped[country] = grouped[country];
    });
  
  return sortedGrouped;
}

// 7. Add a new hint
export async function addHint(hintData: AddHintData): Promise<Hint> {
  const { data, error } = await supabase
    .from('hints')
    .insert([hintData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Enhanced search with keyword support
export async function searchHints(query: string): Promise<Record<string, Record<string, Hint[]>>> {
  const keywords = query.toLowerCase().split(' ').filter(k => k.length > 0);
  
  // First try exact phrase match
  const exactResults = await supabase
    .from('hints')
    .select('*')
    .or(`description.ilike.%${query}%,country.ilike.%${query}%,meta_type.ilike.%${query}%`)
    .order('created_at', { ascending: false });
    
  if (exactResults.error) throw exactResults.error;
  
  // Then try keyword match if no exact results or if using multiple keywords
  let finalResults = exactResults.data || [];
  
  if (keywords.length > 1) {
    const keywordResults = await supabase
      .from('hints')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (keywordResults.error) throw keywordResults.error;
    
    // Filter results that contain all keywords
    const keywordFiltered = (keywordResults.data || []).filter(hint => {
      const searchText = `${hint.description} ${hint.country} ${hint.meta_type}`.toLowerCase();
      return keywords.every(keyword => searchText.includes(keyword));
    });
    
    // Prioritize exact matches by putting them first
    const exactIds = new Set(finalResults.map(h => h.id));
    const keywordOnly = keywordFiltered.filter(h => !exactIds.has(h.id));
    finalResults = [...finalResults, ...keywordOnly];
  }
  
  // Group by meta_type then by country
  const grouped: Record<string, Record<string, Hint[]>> = {};
  finalResults.forEach(hint => {
    if (!grouped[hint.meta_type]) {
      grouped[hint.meta_type] = {};
    }
    if (!grouped[hint.meta_type][hint.country]) {
      grouped[hint.meta_type][hint.country] = [];
    }
    grouped[hint.meta_type][hint.country].push(hint);
  });
  
  return grouped;
}

// Get all countries (unique)
export async function getAllCountries(): Promise<string[]> {
  const { data, error } = await supabase
    .from('hints')
    .select('country')
    .order('country');
    
  if (error) throw error;
  
  const uniqueCountries = [...new Set(data?.map(item => item.country) || [])];
  return uniqueCountries;
}

// Helper function to format meta types
export function formatMetaType(metaType: string): string {
  return metaType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Legacy function for backward compatibility
export function capitalizeMetaType(metaType: string): string {
  return formatMetaType(metaType);
}

// Get a random hint for quiz mode
export async function getRandomHint(): Promise<Hint> {
  const { data, error } = await supabase
    .from('hints')
    .select('*')
    .order('id')
    .limit(1000); // Get a reasonable sample size
    
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No hints available');
  
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}