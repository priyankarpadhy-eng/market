import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

        const command = new PutObjectCommand({
            Bucket: process.env.VITE_R2_BUCKET,
            Key: fileName,
            ContentType: contentType,
        });

        // 1. Generate a pre-signed URL that the browser can use to directly upload the file
        // This avoids Vercel's 4.5MB limit because the file doesn't pass through Vercel.
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        // 2. Construct the final public URL where the file will be accessible
        const publicUrl = `${process.env.VITE_R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;

        return res.status(200).json({ uploadUrl: signedUrl, publicUrl });
    } catch (error) {
        console.error('Presigned URL Error:', error);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
}
