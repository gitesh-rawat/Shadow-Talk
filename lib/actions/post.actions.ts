"use server"

import { connectToDB } from "../mongoose";
import Post from "../models/post.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Community from "../models/community.model";

interface Params{
    text: string,
    author: string,
    communityId: string|null,
    path: string,
}

export async function createPost({text,author,communityId,path}: Params){
    try {
        connectToDB();
     const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdPost = await Post.create({
        text,
        author,
        community: communityIdObject,
    });

     // Update user model
    await User.findByIdAndUpdate(author,{
        $push: { posts: createdPost._id }
    })
    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdPost._id },
      });
    }
    revalidatePath(path);
    } catch (error: any) {
     throw new Error(`Error creating post: ${error.message}`)  
    }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    //Calc the no. of posts to skip
    const skipAmount = (pageNumber -1) * pageSize;

    //Fetch the posts with no parents(top-level-post..)
    const postsQuery = Post.find({ parentId: { $in: [null, undefined]}})
    .sort({createdAt: "desc"})
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path:"author", model: User})
    .populate({
        path: "community",
        model: Community,
      })
    .populate({
        path: 'children',
        populate:{
            path: "author",
            model: User,
            select: "_id name parentId image"
        }
    })
    const totalPostsCount = await Post.countDocuments({
        parentId: { $in: [null, undefined]}})
        const posts = await postsQuery.exec();

        const isNext = totalPostsCount > skipAmount + posts.length;
        return{ posts, isNext};
}

export async function fetchPostById(id: string) {
    connectToDB();

    try{

    // TODO: Populate Community
        const post = await Post.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Post,
                    populate: {
                        path: 'author',
                        model: User,  
                        select: "_id id name parentId image"
                    }
                }
            ]
        }).exec();

        return post;
    } catch (error: any) {
        throw new Error(`Error fetching post: ${error.message}`)
    }
}
export async function addCommentToPost(
    postId:string, commentText:string, userId:string, path:string,) {
        connectToDB();

        try {
            const originalPost = await Post.findById(postId);

            if(!originalPost){
                throw new Error("Post Not Found")
            }

            const commentPost = new Post({
                text: commentText,
                author: userId,
                parentId: postId,
            })

            const savedCommentPost = await commentPost.save();
            originalPost.children.push(savedCommentPost._id);
            await originalPost.save();
            revalidatePath(path);
        } catch (error:any) {
            throw new Error(`Error adding comment to post: ${error.message}`)
        }
}
async function fetchAllChildPosts(postId: string): Promise<any[]> {
    const childPosts = await Post.find({ parentId: postId });
  
    const descendantPosts = [];
    for (const childPost of childPosts) {
      const descendants = await fetchAllChildPosts(childPost._id);
      descendantPosts.push(childPost, ...descendants);
    }
  
    return descendantPosts;
  }
export async function deletePost(id: string, path: string): Promise<void> {
    try {
      connectToDB();
  
      // Find the Post to be deleted (the main Post)
      const mainPost = await Post.findById(id).populate("author community");
  
      if (!mainPost) {
        throw new Error("Post not found");
      }
  
      // Fetch all child Posts and their descendants recursively
      const descendantPosts = await fetchAllChildPosts(id);
  
      // Get all descendant Post IDs including the main Post ID and child Post IDs
      const descendantPostIds = [
        id,
        ...descendantPosts.map((post) => post._id),
      ];
  
      // Extract the authorIds and communityIds to update User and Community models respectively
      const uniqueAuthorIds = new Set(
        [
          ...descendantPosts.map((post) => post.author?._id?.toString()), // Use optional chaining to handle possible undefined values
          mainPost.author?._id?.toString(),
        ].filter((id) => id !== undefined)
      );
  
    //   const uniqueCommunityIds = new Set(
    //     [
    //       ...descendant[Post]s.map((post) => [post].community?._id?.toString()), // Use optional chaining to handle possible undefined values
    //       mainPost.community?._id?.toString(),
    //     ].filter((id) => id !== undefined)
    //   );
  
      // Recursively delete child Posts and their descendants
      await Post.deleteMany({ _id: { $in: descendantPostIds } });
  
      // Update User model
      await User.updateMany(
        { _id: { $in: Array.from(uniqueAuthorIds) } },
        { $pull: { posts: { $in: descendantPostIds } } }
      );
  
    //   // Update Community model
    //   await Community.updateMany(
    //     { _id: { $in: Array.from(uniqueCommunityIds) } },
    //     { $pull: { posts: { $in: descendantPostIds } } }
    //   );
  
      revalidatePath(path);
    } catch (error: any) {
      throw new Error(`Failed to delete Post: ${error.message}`);
    }
  }