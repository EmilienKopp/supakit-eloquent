import type { Database } from "./database.types";
import type { PostgrestResponse } from "@supabase/supabase-js"

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'] | PostgrestResponse<T>
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]