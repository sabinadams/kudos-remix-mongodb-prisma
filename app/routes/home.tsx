import { json, LoaderFunction } from '@remix-run/node'
import { getOtherUsers } from '~/utils/user.server'
import { requireUserId, getUser } from '~/utils/auth.server'
import { Layout } from '~/components/layout'
import { UserPanel } from '~/components/user-panel';
import { useLoaderData, Outlet } from '@remix-run/react';

import { Kudo } from '~/components/kudo';
import { Kudo as IKudo, Profile, Prisma } from '@prisma/client'
import { SearchBar } from '~/components/search-bar';
import { getFilteredKudos, getRecentKudos } from '~/utils/kudos.server'
import { RecentBar } from '~/components/recent-bar';

interface KudoWithAuthor extends IKudo {
    author: {
        profile: Profile
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const users = await getOtherUsers(userId)

    // Pull out our search & sort criteria
    const url = new URL(request.url);
    const sort = url.searchParams.get("sort");
    const filter = url.searchParams.get("filter");
    let sortOptions: Prisma.KudoOrderByWithRelationInput = {}
    if (sort) {
        if (sort === 'date') {
            sortOptions = {
                createdAt: 'desc'
            }
        }
        if (sort === 'sender') {
            sortOptions = {
                author: {
                    profile: {
                        firstName: 'asc'
                    }
                }
            }
        }
        if (sort === 'emoji') {
            sortOptions = {
                style: {
                    emoji: 'asc'
                }
            }
        }
    }

    let textFilter: Prisma.KudoWhereInput = {}
    if (filter) {
        textFilter = {
            OR: [
                {
                    message: {
                        mode: 'insensitive',
                        contains: filter
                    }
                },
                {
                    author: {
                        OR: [
                            { profile: { is: { firstName: { mode: 'insensitive', contains: filter } } } },
                            { profile: { is: { lastName: { mode: 'insensitive', contains: filter } } } },
                        ]
                    }
                },
            ]
        }
    }
    const kudos = await getFilteredKudos(userId, sortOptions, textFilter)
    const recentKudos = await getRecentKudos();
    const user = await getUser(request);
    return json({ user, users, kudos, recentKudos })
};

export default function Home() {
    const { users, kudos, recentKudos, user } = useLoaderData()
    return <Layout>
        <Outlet />
        <div className="h-full flex">
            <UserPanel users={users} />
            <div className="flex-1 flex flex-col">
                <SearchBar profile={user.profile} />
                <div className="flex-1 flex">
                    <div className="w-full p-10 flex flex-col gap-y-4">
                        {
                            kudos.map((kudo: KudoWithAuthor) =>
                                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
                            )
                        }
                    </div>
                    <RecentBar kudos={recentKudos} />
                </div>
            </div>
        </div>
    </Layout >
}
