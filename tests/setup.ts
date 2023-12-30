import { Model } from "../lib/Model";

export class DiaryEntry extends Model {
    protected static _useSoftDeletes = false;
    protected static _useTimestamps = true;   
}

export class BookmarkedPost extends Model {
    protected static _useSoftDeletes = false;
    protected static _useTimestamps = true;
    protected static _idColumn = ['post_id', 'candidate_id'];
}

export class Post extends Model {
    protected static _useSoftDeletes = false;
    protected static _useTimestamps = false;   
}

export class Candidate extends Model {
    protected static _useSoftDeletes = false;
    protected static _useTimestamps = false;   
}


DiaryEntry.setConnection({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
});

Candidate.setConnection({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
});

Post.setConnection({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
});