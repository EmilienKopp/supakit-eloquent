import { SupabaseClient, createClient } from '@supabase/supabase-js';

let instance: SupabaseClient;

export function getSupabaseClient(
    supabaseURL: string,
    supabaseKey: string
) {
  if (!instance) {
    instance = createClient(supabaseURL, supabaseKey);
  }
  return instance;
}

/**
 * Determines whether a value exists in a table's column
 * @param supabase the supabase client to use
 * @param tableOrComposite a table name, or a composite of table.column
 * @param value the value to look for
 * @param column the column to look in
 * @returns whether the value exists in the table
 */
export async function exists (
  supabase: SupabaseClient, 
  tableOrComposite: string, 
  value?: any,
  column?: string) : Promise<boolean>
{

  let [table, col] = tableOrComposite.split(".");
  column = column ?? col;

  const query = supabase
          .from(table)
          .select(column)
  
  if(value) {
      query.eq(column, value);
  }

  const result = await query;

  return !!result?.data?.length;           
}