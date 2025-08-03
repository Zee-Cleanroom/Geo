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

// Helper function to capitalize meta types
export function capitalizeMetaType(metaType: string): string {
  return metaType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}