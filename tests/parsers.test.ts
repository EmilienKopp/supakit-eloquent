import { expect, test } from 'vitest';

import { Model } from '../lib/Model';
import { parseTableDescription } from '../lib/parsers';
import { stat } from 'fs';

test('parseTableDescription() can take a dable description and return an object', async () => {
    class DiaryEntry extends Model { }

    DiaryEntry.setConnection({
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY as string,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string, })
    
    const { data: description, error, status } = await DiaryEntry.getConnection().schema('public').rpc('describe_table', { tablename: 'diary_entries' });
    console.log(description, error,status);

    expect(parseTableDescription(description)).toEqual({
        created_at: {
            type: 'timestamp without time zone',
            nullable: true,
            name: 'created_at',
        },
        id: {
            type: 'bigint',
            nullable: false,
            name: 'id',
        },
        title: {
            type: 'character varying',
            nullable: true,
            name: 'title',
        },
        updated_at: {
            type: 'timestamp without time zone',
            nullable: true,
            name: 'updated_at',
        },
        mood_score: {
            type: 'integer',
            nullable: true,
            name: 'mood_score',
        },
        content: {
            type: 'text',
            nullable: true,
            name: 'content',
        },
    });
});