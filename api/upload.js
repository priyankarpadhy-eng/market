import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
    },
});

export const config = {
    api: {
        bodyParser: false, // Disabling bodyParser to handle raw binary data
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const fileName = req.headers['x-file-name'];
        const contentType = req.headers['content-type'] || 'application/octet-stream';

        if (!fileName) {
            return res.status(400).json({ error: 'Missing x-file-name header' });
        }

        // Collect the chunks of the file
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const command = new PutObjectCommand({
            Bucket: process.env.VITE_R2_BUCKET,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
        });

        await r2Client.send(command);

        // Construct the public URL
        const publicUrl = `${process.env.VITE_R2_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;

        return res.status(200).json({ url: publicUrl });
    } catch (error) {
        console.error('R2 Proxy Upload Error:', error);
        return res.status(500).json({ error: 'Internal server error during upload' });
    }
}
