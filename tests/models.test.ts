import * as pluralizer from 'pluralize';

import { BookmarkedPost, Candidate, DiaryEntry, Post } from './setup.ts';
import { Model, Relationship } from '../lib/Model';
import { describe, expect, expectTypeOf, test } from 'vitest';
import { singularPascalToPluralSnake, toSnakeCase } from '../lib/strings';

import { Collection } from '../lib/Collection';
import { SupabaseClient } from '@supabase/supabase-js';
import { createModel } from './../lib/createModel';
import { getSupabaseClient } from '../lib/client';
import { isEmpty } from '../lib/Objects';

test('Connection is created', () => {
    expect(DiaryEntry.getConnection()).toBeDefined();
    expect(DiaryEntry.getConnection()).toBeInstanceOf(SupabaseClient);
});

test('Table name is set statically', () => {
    const tableName = DiaryEntry.getTableName();
    expect(tableName).toBe('diary_entries');
    expect(Post.getTableName()).toBe('posts');
});

test('Table name is set on instance', () => {
    const entry = new DiaryEntry({ title: 'Hello World', content: 'This is a test entry' });
});

test('Can fetch schema', async () => {
    const schema = await DiaryEntry.getSchema();
    expect(schema).toBeTruthy();
});

test('Load Schema defines the fields', async () => {
    const keys = Object.keys(DiaryEntry).filter(key => !key.startsWith("_"));
    expect(keys).toBeInstanceOf(Array);
    expect(keys?.length).toBeGreaterThan(0);
});

test('.all() returns the same number of rows as the native supabase call', async () => {
    const entry1 = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const entry2 = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const entries = await DiaryEntry.all();
    const tableName = DiaryEntry.getTableName();
    const supabase = getSupabaseClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);
    const { data, status} = await supabase.from(tableName).select('*');
    expect(entries.length).toBe(data?.length);
    await entry1.delete();
    await entry2.delete();
});

test('the default select query can be customized', async () => {
    const columns = ['id', 'created_at'];
    DiaryEntry.setSelectQuery(columns.join(', '));
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const found = await DiaryEntry.find(entry.id);
    expect(found).toBeInstanceOf(Object);
    expect(found.title).toBeUndefined();
    expect(found.content).toBeUndefined();
    expect(found.created_at).toBeDefined();
    expect(found.id).toBeDefined();
    expect(found.attributes()).toBeDefined();
    expect(Object.keys(found.attributes()).length).toBe(columns.length);
    expect(found.response()).toBeDefined();
    expect(found.response().status).toBeGreaterThanOrEqual(200);
    expect(found.response().status).toBeLessThan(300);
    expect(found.response().data).toBeDefined();
    DiaryEntry.setSelectQuery('*');
    entry.delete();
});


test('.all() returns a 2** response', async () => {
    const entries = await DiaryEntry.all();
    expect(entries).toBeInstanceOf(Collection);
    expect(entries.response.status).toBeGreaterThanOrEqual(200);
    expect(entries.response.status).toBeLessThan(300);
});

test('.create() returns a 2** response with non-empty data', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    expect(entry).toBeInstanceOf(Object);
    const ids = DiaryEntry.getIdColumn();
    if(ids instanceof Array) {
        expect(ids.every(id => !!entry[id])).toBeTruthy();
    } else {
        expect(entry[ids]).toBeDefined();
    }
    expect(entry.title).toBe('Hello World');
    expect(entry.content).toBe('This is a test entry');
    expect(entry.response()).toBeDefined();
    expect(entry.response().status).toBeGreaterThanOrEqual(200);
    expect(entry.response().status).toBeLessThan(300);
    expect(entry.response().data).toBeDefined();
    expect(isEmpty(entry.response().data)).toBeFalsy();
    await entry.delete();
});

test('.find() returns a 2** response with non-empty data', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const found = await DiaryEntry.find(entry.id);
    expect(found).toBeInstanceOf(Object);
    expect(found.title).toBe('Hello World');
    expect(found.content).toBe('This is a test entry');
    expect(found.response()).toBeDefined();
    expect(found.response().status).toBeGreaterThanOrEqual(200);
    expect(found.response().status).toBeLessThan(300);
    expect(found.response().data).toBeDefined();
    expect(isEmpty(found.response().data)).toBeFalsy();
    await entry.delete();
});

test('.find() returns a 4** response for inexitant data', async () => {
    const entry = await DiaryEntry.find(999999);
    expect(entry).toBeInstanceOf(Object);
    expect(entry.response()).toBeDefined();
    expect(entry.response().status).toBeGreaterThanOrEqual(400);
    expect(entry.response().status).toBeLessThan(500);
});



test('.save() saves a new record from a newly created object', async () => {
    const entry = new DiaryEntry({ title: 'Hello World', content: 'This is a test entry' });
    const saved = await entry.save();
    expect(saved).toBeInstanceOf(Object);
    expect(saved.title).toBe('Hello World');
    expect(saved.content).toBe('This is a test entry');
    expect(saved.response()).toBeDefined();
    expect(saved.response().status).toBeGreaterThanOrEqual(200);
    expect(saved.response().status).toBeLessThan(300);
    expect(saved.response().data).toBeDefined();
    expect(isEmpty(saved.response().data)).toBeFalsy();
    await saved.delete();
});

test('.save({data}) saves a new record with aditional data', async () => {
    const entry = new DiaryEntry({ title: 'Hello World', content: 'This is a test entry' });
    const saved = await entry.save({mood_score: 50 });
    expect(saved).toBeInstanceOf(Object);
    expect(saved.title).toBe('Hello World');
    expect(saved.content).toBe('This is a test entry');
    expect(saved.mood_score).toBe(50);
    expect(saved.response()).toBeDefined();
    expect(saved.response().status).toBeGreaterThanOrEqual(200);
    expect(saved.response().status).toBeLessThan(300);
    expect(saved.response().data).toBeDefined();
    expect(isEmpty(saved.response().data)).toBeFalsy();
    await saved.delete();
});

test('.update() instance method updates a record', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const updated = await entry.update({ title: 'NEW TITLE', content: 'This is a test entry' });
    expect(updated).toBeInstanceOf(Object);
    expect(updated.title).toBe('NEW TITLE');
    expect(updated.content).toBe('This is a test entry');
    expect(updated.response()).toBeDefined();
    expect(updated.response().status).toBeGreaterThanOrEqual(200);
    expect(updated.response().status).toBeLessThan(300);
    expect(updated.response().data).toBeDefined();
    expect(isEmpty(updated.response().data)).toBeFalsy();
    await entry.delete();
});

test('.update() static method updates a record', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const updated = await DiaryEntry.update(entry.id, { title: 'NEW TITLE', content: 'This is a test entry' });
    expect(updated).toBeInstanceOf(Object);
    expect(updated.title).toBe('NEW TITLE');
    expect(updated.content).toBe('This is a test entry');
    expect(updated.response()).toBeDefined();
    expect(updated.response().status).toBeGreaterThanOrEqual(200);
    expect(updated.response().status).toBeLessThan(300);
    expect(updated.response().data).toBeDefined();
    expect(isEmpty(updated.response().data)).toBeFalsy();
    await entry.delete();
});

test(' .duplicate() duplicates a record', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const duplicated = await entry.duplicate();
    expect(duplicated).toBeInstanceOf(Object);
    expect(duplicated.title).toBe('Hello World');
    expect(duplicated.content).toBe('This is a test entry');
    expect(duplicated.response()).toBeDefined();
    expect(duplicated.response().status).toBeGreaterThanOrEqual(200);
    expect(duplicated.response().status).toBeLessThan(300);
    expect(duplicated.response().data).toBeDefined();
    expect(isEmpty(duplicated.response().data)).toBeFalsy();
    await entry.delete();
    await duplicated.delete();
});

test(' static .duplicate() duplicates a record', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const duplicated = await DiaryEntry.duplicate(entry.id);
    expect(duplicated).toBeInstanceOf(Object);
    expect(duplicated.title).toBe('Hello World');
    expect(duplicated.content).toBe('This is a test entry');
    expect(duplicated.response()).toBeDefined();
    expect(duplicated.response().status).toBeGreaterThanOrEqual(200);
    expect(duplicated.response().status).toBeLessThan(300);
    expect(duplicated.response().data).toBeDefined();
    expect(isEmpty(duplicated.response().data)).toBeFalsy();
    await entry.delete();
    await duplicated.delete();
});

test('can delete with static .delete()', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry' });
    const deleted = await DiaryEntry.delete(entry.id);
    const found = await DiaryEntry.find(entry.id);
    expect(deleted.response()).toBeDefined();
    expect(deleted.response().status).toBeGreaterThanOrEqual(200);
    expect(deleted.response().status).toBeLessThan(300);
    expect(deleted.response().data).toBeDefined();
    expect(isEmpty(deleted.response().data)).toBeFalsy();
    expect(found).toBeInstanceOf(Object);
    expect(found.response()).toBeDefined();
    expect(found.response().status).toBeGreaterThanOrEqual(400);
});

test('can delete with static delete on composite key', async () => {
    const candidate = await Candidate.create({ name: 'John Doe' });
    const post = await Post.create({ title: 'Hello World', content: 'This is a test entry' });
    const bookmark = await BookmarkedPost.create({ post_id: post.id, candidate_id: candidate.id });
    const deleted = await BookmarkedPost.delete({ post_id: post.id, candidate_id: candidate.id });
    await candidate.delete();
    await post.delete();
    expect(deleted.response()).toBeDefined();
    expect(deleted.response().status).toBeGreaterThanOrEqual(200);
    expect(deleted.response().status).toBeLessThan(300);
    expect(deleted.response().data).toBeDefined();
});

test('.but() returns a new collection excluding rows matching the condition', async () => {
    const matchingEntry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry', mood_score: 50 });
    const unmatchingEntry = await DiaryEntry.create({ title: 'Unmatching Entry', content: 'This is a test entry', mood_score: 10 });
    const entries = await DiaryEntry.but('mood_score', 10);
    expect(entries).toBeInstanceOf(Collection);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every(entry => entry.mood_score !== 10)).toBeTruthy();

    await matchingEntry.delete();
    await unmatchingEntry.delete();
});

test('.but() returns a new collection excluding rows matching the condition', async () => {
    const matchingEntry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry', mood_score: 50 });
    const unmatchingEntry = await DiaryEntry.create({ title: 'Unmatching Entry', content: 'This is a test entry', mood_score: 10 });
    const entries = await DiaryEntry.but('mood_score', 10);
    expect(entries).toBeInstanceOf(Collection);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every(entry => entry.mood_score !== 10)).toBeTruthy();
    await matchingEntry.delete();
    await unmatchingEntry.delete();
});


test('.where() returns a new collection with EQUAL condition by default', async () => {
    const matchingEntry = await DiaryEntry.create({ title: 'Hello World !', content: 'This is a test entry', mood_score: 50 });
    const otherMatchingEntry = await DiaryEntry.create({ title: 'Hello People !', content: 'Other entry', mood_score: 50 });
    const unmatchingEntry = await DiaryEntry.create({ title: 'Unmatching Entry !', content: 'This is a test entry', mood_score: 10 });
    const entries = await DiaryEntry.where([{column: 'mood_score', value: 50}]);
    expect(entries).toBeInstanceOf(Collection);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry: any) => entry.mood_score === 50)).toBeTruthy();
    await matchingEntry.delete();
    await otherMatchingEntry.delete();
    await unmatchingEntry.delete();
});

test('.where() returns a new collection matching conditions with operators', async () => {
    const unmatchingEntry = await DiaryEntry.create({ title: 'A', content: 'This is a test entry', mood_score: 50 });
    const matchingEntry = await DiaryEntry.create({ title: 'B', content: 'This is a test entry', mood_score: 10 });
    const otherMatchingEntry = await DiaryEntry.create({ title: 'C', content: 'Other entry', mood_score: 20 });
    const entries = await DiaryEntry.where([{column: 'mood_score', operator: '<=', value: 20}]);
    expect(entries).toBeInstanceOf(Collection);

    expect(entries.length).toBe(2);
    expect(entries.every((entry: any) => entry.mood_score <= 20)).toBeTruthy();
    await matchingEntry.delete();
    await otherMatchingEntry.delete();
    await unmatchingEntry.delete();
});

test('.first() returns the first row matching the condition', async () => {
    const matchingEntry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry', mood_score: 50 });
    const unmatchingEntry = await DiaryEntry.create({ title: 'Unmatching Entry', content: 'This is a test entry', mood_score: 10 });
    const entry = await DiaryEntry.first([{column: 'mood_score', value: 50}]);
    expect(entry).toBeInstanceOf(Object);
    expect(entry?.title).toBe('Hello World');
    expect(entry?.content).toBe('This is a test entry');
    expect(entry?.mood_score).toBe(50);
    await matchingEntry.delete();
    await unmatchingEntry.delete();
});

test('.select() returns a new collection with only the selected columns', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry', mood_score: 50 });
    const entries = await DiaryEntry.select('title,mood_score', );
    expect(entries).toBeInstanceOf(Collection);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry: any) => entry.title !== undefined)).toBeTruthy();
    await entry.delete();
});

test('.refresh() returns a new collection from the DB with no error', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry', mood_score: 50 });
    entry.refresh();
    expect(entry).toBeInstanceOf(DiaryEntry);
    await entry.delete();
});

test('.attributes() returns an object with the attributes', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry', mood_score: 50 });
    const attributes = entry.attributes();
    expect(attributes).toBeInstanceOf(Object);
    expect(attributes.title).toBe('Hello World');
    expect(attributes.content).toBe('This is a test entry');
    expect(attributes.mood_score).toBe(50);
    const keys = Object.keys(attributes);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.filter((item: any) => !item.startsWith('_')).length).toBe(Object.keys(attributes).length);

    await entry.delete();
});

test('.response() returns the response object', async () => {
    const entry = await DiaryEntry.create({ title: 'Hello World', content: 'This is a test entry', mood_score: 50 });
    const response = entry.response();
    expect(response).toBeInstanceOf(Object);
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('error');
    await entry.delete();
});

test('.getInstance() returns an empty instance', async () => {
    const instance = await DiaryEntry.getInstance();
    expect(instance).toBeInstanceOf(Object);
    expect(instance).toBeInstanceOf(DiaryEntry);
});

test('.connect() returns a new instance with the connection set', async () => {
    const instance = await DiaryEntry.getInstance();
    instance.connect();
    expect(instance).toBeInstanceOf(Object);
    expect(instance).toBeInstanceOf(DiaryEntry);
    expect(instance.getConnection()).toBeDefined();
    expect(instance.getConnection()).toBeInstanceOf(SupabaseClient);
});

test('.setConnection() sets the connection', async () => {
    DiaryEntry.setConnection({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    });
    expect(DiaryEntry.getConnection()).toBeDefined();
    expect(DiaryEntry.getConnection()).toBeInstanceOf(SupabaseClient);
});

test('.getConnection() returns the connection', async () => {
    expect(DiaryEntry.getConnection()).toBeDefined();
    expect(DiaryEntry.getConnection()).toBeInstanceOf(SupabaseClient);
});

test('.getTableName() returns the table name', async () => {
    const tableName = DiaryEntry.getTableName();
    expect(tableName).toBe('diary_entries');
});

test('.getSchema() returns the table schema', async () => {
    const schema = await DiaryEntry.getSchema();
    expect(schema).toBeTruthy();
});

test('.getIdColumn() returns the id column', async () => {
    class User extends Model {
        protected static _idColumn = 'user_id';
    }
    const idColumn = User.getIdColumn();
    expect(idColumn).toBe('user_id');
});

test('can build from the schema if it is provided an no argument is passed to constructor', async () => {
    const post = new Post();
    expect(post).toBeInstanceOf(Post);
    expect(Post.getConnection()).toBeDefined();
    expect(post.getConnection()).toBeInstanceOf(SupabaseClient);
    expect(Post.getTableName()).toBe('posts');
    expect(Post.getIdColumn()).toBe('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('content');
    expect(post).toHaveProperty('created_at');
    expect(post).toHaveProperty('candidate_id');
});

test('can define relationships', async () => {
    class MyPost extends Model {
        protected static _table = 'posts';
        protected static _useSoftDeletes = false;
        protected static _relations: Relationship[] = [
            { type: 'one-to-one', relation: 'Candidate', local_column: 'candidate_id', foreign_column: 'id' },
        ];
    }
    const user = new MyPost();
    expect(user).toBeInstanceOf(MyPost);
    
})

