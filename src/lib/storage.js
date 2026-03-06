import { uploadToR2 } from './r2';

const MAX_FILE_SIZE_MB = 4; // 4MB limit for Vercel Serverless Functions

export async function uploadFile(file, folder = 'uploads', onProgress) {
    if (!file) throw new Error('No file provided');

    // 1. File Size Validation
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
        throw new Error(`File is too large (${fileSizeMB.toFixed(1)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
    }

    // 2. Try to update UI progress quickly since raw AWS-SDK v3 putObject doesn't stream progress natively in browser
    if (onProgress) {
        onProgress(30);
    }

    try {
        // 3. Upload to Cloudflare R2
        const url = await uploadToR2(file, folder);

        if (onProgress) {
            onProgress(100);
        }

        return url;
    } catch (err) {
        console.error('Upload Error:', err);
        throw new Error('Failed to upload file to storage.');
    }
}
