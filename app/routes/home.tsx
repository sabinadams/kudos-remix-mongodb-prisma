import { json, LoaderFunction } from '@remix-run/node'
import { getOtherUsers } from '~/utils/user.server'
import { requireUserId } from '~/utils/auth.server'
import { Layout } from '~/components/layout'
import { UserPanel } from '~/components/user-panel';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const users = await getOtherUsers(userId)

    return json({ users })
};

export default function Home() {
    const { users } = useLoaderData()
    return <Layout>
        <div className="h-full flex">
            <UserPanel users={users} />
            <div className="flex-1">
            </div>
        </div>
    </Layout >
}
