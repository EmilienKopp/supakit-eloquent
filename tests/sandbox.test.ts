import { BookmarkedPost, Candidate, DiaryEntry, Post } from './setup';
import { Collect, Collection } from '../lib/Collection';
import { describe, expect, test } from 'vitest';

import { Model } from '../lib/Model';

class Test extends Model{}

test('with creates a new instance with the related foreign model', async () => {
    // const {data,error} = await Post.getConnection().from('posts').select('*, candidate:candidate_id(*)');
    // console.log(data,error);
    const candidate = (await Candidate.all()).first() 
    const post = await Post.create({ title: 'test', candidate_id: candidate.id, content: 'test'  });
    const bookmarkedPost = await BookmarkedPost.create({ post_id: post.id, candidate_id: candidate.id });
    
    const withRelated = await bookmarkedPost.with(Post);
    
    expect(withRelated).toBeDefined();
    expect(withRelated).toBeInstanceOf(BookmarkedPost);
    expect(withRelated.post).toBeDefined();
    expect(withRelated.post).toBeInstanceOf(Post);

    post.delete();
    bookmarkedPost.delete();
});

test('with attaches the related value to the instance', async () => {
    const candidate = (await Candidate.all()).first() 
    const post = await Post.create({ title: 'test', candidate_id: candidate.id, content: 'test'  });
    const bookmarkedPost = await BookmarkedPost.create({ post_id: post.id, candidate_id: candidate.id });
    
    await bookmarkedPost.with(Post);
    
    expect(bookmarkedPost.post).toBeDefined();
    expect(bookmarkedPost.post).toBeInstanceOf(Post);

    post.delete();
    bookmarkedPost.delete();
});

test('all() can use the with parameter to attach related models', async () => {
    const candidate = (await Candidate.all()).first() 
    const post = await Post.create({ title: 'test', candidate_id: candidate.id, content: 'test'  });
    const bookmarkedPost = await BookmarkedPost.create({ post_id: post.id, candidate_id: candidate.id });
    
    const withRelated = await BookmarkedPost.all({ with: [Post] });
    
    expect(withRelated).toBeDefined();
    expect(withRelated).toBeInstanceOf(Collection);


    post.delete();
    bookmarkedPost.delete();
});