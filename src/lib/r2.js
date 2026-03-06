/**
 * Upload a file to Cloudflare R2 using a **Pre-Signed PUT**.
 * 
 * @param {File} file - The file to upload
 * @param {string} folder - The folder prefix (e.g., 'avatars', 'posts')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToR2(file, folder = 'uploads') {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // 1. Ask Vercel backend for a Pre-Signed PUT configuration
        const presignRes = await fetch('/api/get-upload-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: fileName,
                contentType: file.type
            })
        });

        if (!presignRes.ok) {
            const err = await presignRes.json();
            throw new Error(`Failed to generate secure upload link: ${err.error || 'Unknown'}`);
        }

        const { url, publicUrl } = await presignRes.json();

        // 2. Upload the file DIRECTLY to Cloudflare R2 using standard PUT
        const uploadRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (!uploadRes.ok) {
            throw new Error(`Cloudflare rejected the upload. Status: ${uploadRes.status}`);
        }

        // Return the final formatted URL
        return publicUrl;
    } catch (error) {
        console.error('Upload Error:', error);
        throw new Error(error.message || 'Failed to upload image. Please try again.');
    }
}
