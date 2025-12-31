// lib/supabase.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Creamos la instancia fuera de cualquier función para que sea única
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Si necesitas mantener la función por compatibilidad:
export const createClient = () => supabase;
