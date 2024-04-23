"use client"

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props{
    id: string;
    username: string;
    imgUrl: string;
    personType: string;
    bio: string;
}
const UserCard = ({id, username, imgUrl, personType, bio}: Props) => {
    const router= useRouter();

    const isCommunity = personType === "Community";
  return (
    <article className="user-card">
        <div className="user-card_avatar">
            <div className="relative h-12 w-12">
                <Image 
                    src={imgUrl}
                    alt="user_logo"
                    width={48} height={48}
                    className="rounded-full object-cover"
                />
            </div>

            <div className="flex-1 text-ellipsis">
                <h4 className="text-base-semibold text-light-1">@{username}</h4>
                <p className="text-small-light text-gray-1">{bio}</p>
            </div>
        </div>

        <Button
        className='user-card_btn'
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`);
          } else {
            router.push(`/profile/${id}`);
          }
        }}
      >
        View
      </Button>
    </article>
  );
}

export default UserCard