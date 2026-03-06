/**
 * Upload a file to Cloudflare R2 via our Backend Proxy (/api/upload)
 * This avoids CORS issues and keeps credentials secure on the server.
 * 
 * @param {File} file - The file to upload
 * @param {string} folder - The folder prefix (e.g., 'avatars', 'posts')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToR2(file, folder = 'uploads') {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Call our Vercel Serverless Function instead of R2 directly
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'x-file-name': fileName,
                'content-type': file.type
            },
            body: file // Send file as raw binary
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const { url } = await response.json();
        return url;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
}
