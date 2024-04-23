import mongoose from "mongoose";
import { string } from "zod";

const communitySchema = new mongoose.Schema({
    id: { type: String, required: true},
    username: { type: String, required: true, unique: true},
    bio: String,
    image: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    members:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;