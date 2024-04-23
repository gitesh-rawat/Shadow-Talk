import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchCommunities({
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  return (
    <>
      <h1 className='head-text mb-10'>Communities</h1>

      <Searchbar routeType='communities' />

      <section className='mt-14 flex flex-col gap-9'>
        {result.communities.length === 0 ? (
          <p className='no-result'>No Result</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard
                    key={community.id}
                    id={community.id}
                    username={community.username}
                    imgUrl={community.image}
                    bio={community.bio}
                    members={community.members}
              />
            ))}
          </>
        )}
      </section>
      <Pagination
        path='communities'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
  </>
  );
}

export default Page;