import { ActionFunction, json } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { uploadAvatar } from "~/utils/s3.server";
import { prisma } from "~/utils/prisma.server";

export const action: ActionFunction = async ({ request }) => {
  // 1
  const userId = await requireUserId(request);
  // 2
  const imageUrl = await uploadAvatar(request);

  // 3
  await prisma.user.update({
    data: {
      profile: {
        update: {
          profilePicture: imageUrl,
        },
      },
    },
    where: {
      id: userId,
    },
  });

  // 4
  return json({ imageUrl });
};
