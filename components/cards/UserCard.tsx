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

const router= useRouter();
const UserCard = ({id, username, imgUrl, personType, bio}: Props) => {
  return (
    <article className="user-card">
        <div className="user-card_avatar">
            <Image 
                src={imgUrl}
                alt="logo"
                width={48} height={48}
                className="rounded--full"
            />

            <div className="flex-1 text-ellipsis">
                <h4 className="text-base-semibold text-light-1">@{username}</h4>
                <p className="text-small-light text-gray-1">{bio}</p>
            </div>
        </div>

        <Button className="user-card_btn" onClick={() => router.push(`/profile/${id}`)}>
            view
        </Button>
    </article>
  )
}

export default UserCard