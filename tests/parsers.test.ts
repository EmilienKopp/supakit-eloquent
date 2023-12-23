import { expect, test } from 'vitest';

import { Model } from '../lib/Model';
import { parseTableDescription } from '../lib/parsers';

test('parseTableDescription() can take a dable description and return an object', async () => {
    class DiaryEntry extends Model { }

    DiaryEntry.setConnection({
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY as string,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string, })
    const description = await DiaryEntry.getSchema();
    console.log(parseTableDescription(description));
    expect(parseTableDescription(description)).toEqual({
        created_at: {
            type: 'timestamp without time zone',
            nullable: true,
        },
        id: {
            type: 'bigint',
            nullable: false,
        },
        title: {
            type: 'character varying',
            nullable: true,
        },
        updated_at: {
            type: 'timestamp without time zone',
            nullable: true,
        },
        mood_score: {
            type: 'integer',
            nullable: true,
        },
        content: {
            type: 'text',
            nullable: true,
        },
    });
});