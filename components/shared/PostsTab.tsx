import { redirect } from "next/navigation";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";
import { fetchAllChildPosts } from "@/lib/actions/post.actions";
import PostCard from "../cards/PostCard";

interface Result {
  username: string;
  name: string;
  image: string;
  id: string;
  posts: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      username: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      username: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function PostsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;
  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  return (
    <section className='mt-9 flex flex-col gap-10'>

      {result.posts.map((post) => (
        <PostCard
          key={post._id}
          id={post._id}
          currentUserId={currentUserId}
          parentId={post.parentId}
          content={post.text}
          author={
            accountType === "User"
              ? { username: result.username , image: result.image, id: result.id }
              : {
                  username: post.author.username,
                  image: post.author.image,
                  id: post.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { id: result.id, username: result.username, image: result.image }
              : post.community
          }
          createdAt={post.createdAt}
          comments={post.children}
        />
      ))}
    </section>
  );
}

export default PostsTab;