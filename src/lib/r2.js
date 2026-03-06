import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Direct AWS SDK Implementation. 
// Now that the Cloudflare bucket has a wildcard (*) CORS policy, 
// the SDK can perfectly manage the complex signature headers natively.

const S3_BUCKET = import.meta.env.VITE_R2_BUCKET || 'market-media';
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

let r2Client = null;

if (R2_ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
    try {
        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: ACCESS_KEY_ID,
                secretAccessKey: SECRET_ACCESS_KEY,
            },
            // Enforce path-style to prevent cross-origin signature failures
            forcePathStyle: true,
        });
    } catch (e) {
        console.error('Failed to initialize R2 Client:', e);
    }
}

/**
 * Upload a file to Cloudflare R2
 * @param {File} file - The file to upload
 * @param {string} folder - The folder prefix (e.g., 'avatars', 'posts')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToR2(file, folder = 'uploads') {
    if (!r2Client) {
        console.warn('R2 Client is not initialized. Check your environment variables.');
        return URL.createObjectURL(file);
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
        });

        await r2Client.send(command);

        if (PUBLIC_URL) {
            return `${PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;
        } else {
            return `https://${S3_BUCKET}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;
        }
    } catch (error) {
        console.error('Direct R2 Upload Error:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
}
