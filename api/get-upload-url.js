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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { fileName, contentType } = req.body;

        if (!fileName || !contentType) {
            return res.status(400).json({ error: 'Missing fileName or contentType' });
        }

        // Generate a Pre-signed POST instead of a PUT URL.
        // A POST request using 'multipart/form-data' is considered a "Simple Request" by browsers,
        // meaning it completely bypasses the CORS OPTIONS preflight check that Cloudflare is blocking.
        const { url, fields } = await createPresignedPost(r2Client, {
            Bucket: process.env.VITE_R2_BUCKET,
            Key: fileName,
            Fields: {
                'Content-Type': contentType,
            },
            Expires: 3600,
            Conditions: [
                ['content-length-range', 0, 50 * 1024 * 1024] // Support up to 50MB
            ],
        });

        const publicUrl = `${process.env.VITE_R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;

        return res.status(200).json({ url, fields, publicUrl });
    } catch (error) {
        console.error('Presigned POST Error:', error);
        return res.status(500).json({ error: 'Failed to generate upload form generation' });
    }
}
