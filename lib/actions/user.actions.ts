"use server"

import { FilterQuery, SortOrder } from "mongoose";
import Post from "../models/post.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { skip } from "node:test";

interface Params{
    userID:string;
    username: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser
({userID, username, bio, image, path}: Params):Promise<void> {
    connectToDB();

try{
    await User.findOneAndUpdate(
        { id: userID },
        {username: username.toLowerCase(),
         bio,
         image,
         onboarded: true,},
        {upsert: true}
        );
    if(path === '/profile/edit'){
        revalidatePath(path);
    }}
catch (error: any){
    throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchUser(userId:string) {
    try{
        connectToDB();

        return await User.findOne({ id:userId})
        // .populate({ path: 'communities', model: 'Community'})
    } catch (error: any){
        throw new Error(`Failted to fetch user: ${error.message}`)
    } 
}

export async function fetchUserPosts(userId: string){
    try{
        connectToDB();
        //TODO: populate community
        const posts = await User.findOne({ id: userId })
            .populate({
                path: 'posts',
                model: Post,
                populate: {
                    path: 'children',
                    model: Post,
                    populate: {
                        path: 'author',
                        model: User,
                        select:'username image id'
                    }
                }
            })
            return posts;
    } catch(error:any){
        throw new Error(`Failed to fetch user posts: ${error.message}`)
    }
}

export async function fetchUsers({
    userId,
    searchString= "",
    pageNumber= 1,
    pageSize= 20,
    sortBy= "desc" } :{

    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}){
    try {
        connectToDB();

        const skipAmount =(pageNumber -1) * pageSize;
        const regex = new RegExp(searchString, "i");
        const query: FilterQuery<typeof User> = {
            id: {$ne: userId}
        }

        if(searchString.trim() !== ''){
            query.$or =[
                { username: { $regex: regex }}
            ]
        }

        const sortOptions = { createdAt: sortBy};

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();
        const isNext = totalUsersCount > skipAmount + users.length;

        return {users, isNext};
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string){
    try {
        connectToDB();

        const userPosts = await Post.find({ author: userId })
        const childPostIds = userPosts.reduce((acc, userPost) =>{
            return acc.concat(userPost.children)
        }, [])

        const replies = await Post.find({
            _id: { $in: childPostIds },
            author: { $ne: userId }
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies;
    } catch (error: any) {
        throw new Error(`Failed to fetch activity: ${error.message}`)
    }
}