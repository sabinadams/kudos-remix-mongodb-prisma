import { User, Kudo } from '@prisma/client';
import { UserCircle } from './user-circle';
import { emojiMap } from '~/utils/constants'

interface KudoWithRecipient extends Kudo {
    recipient: User
}

export function RecentBar({ kudos }: { kudos: KudoWithRecipient[] }) {
    return (
        <div className="w-1/5 border-l-4 border-l-yellow-300 flex flex-col items-center">
            <h2 className="text-xl text-yellow-300 font-semibold my-6">Recent Kudos</h2>
            <div className="h-full flex flex-col gap-y-10 mt-10">
                {kudos.map((kudo) =>
                    <div className="h-24 w-24 relative" key={kudo.recipient.id}>
                        <UserCircle profile={kudo.recipient.profile} className="w-20 h-20" />
                        <div className="h-8 w-8 text-3xl bottom-2 right-4 rounded-full absolute flex justify-center items-center">
                            {emojiMap[kudo?.style?.emoji || 'THUMBSUP']}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}