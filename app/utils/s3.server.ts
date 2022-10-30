import {
  unstable_parseMultipartFormData,
  type UploadHandler,
} from "@remix-run/node";
import S3 from "aws-sdk/clients/s3";
import cuid from "cuid";

const s3 = new S3({
  accessKeyId: process.env.KUDOS_ACCESS_KEY_ID,
  secretAccessKey: process.env.KUDOS_SECRET_ACCESS_KEY,
});

const uploadHandler: UploadHandler = async ({ name, filename, data }) => {
  if (name !== 'profile-pic') return

    let image: Uint8Array = new Uint8Array([])

    for await (const x of data) {
        image = new Uint8Array([...image, ...x])
    }

  const { Location } = await s3
    .upload({
      Bucket: process.env.KUDOS_BUCKET_NAME || "",
      Key: `${cuid()}.${filename?.split(".").slice(-1)}`,
      Body: data,
    })
    .promise();

  return Location;
};

export async function uploadAvatar(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("profile-pic")?.toString() || "";

  return file;
}
