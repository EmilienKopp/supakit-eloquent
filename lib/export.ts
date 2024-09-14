import { Model } from "./Model";
import { createModel } from "./createModel";
import { getSupabaseClient } from "./client";

const client = getSupabaseClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

export class TimeLog extends Model {}
TimeLog.init({client});