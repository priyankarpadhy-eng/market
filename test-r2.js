import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
    },
});

async function test() {
    try {
        const { url, fields } = await createPresignedPost(r2Client, {
            Bucket: process.env.VITE_R2_BUCKET,
            Key: 'test/file.jpg',
            Fields: {
                'Content-Type': 'image/jpeg',
            },
            Expires: 3600,
            Conditions: [
                ['content-length-range', 0, 50 * 1024 * 1024]
            ],
        });
        console.log("SUCCESS");
        console.log(url);
        console.log(fields);
    } catch (e) {
        console.error("ERROR", e);
    }
}
test();
