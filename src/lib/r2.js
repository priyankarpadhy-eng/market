/**
 * Upload a file to Cloudflare R2 using a **Pre-Signed POST form**.
 * This forces the browser to treat the upload as a "Simple Request" via standard HTML
 * form data (multipart/form-data), thereby entirely circumventing the broken CORS
 * OPTIONS Preflight checks failing on the Cloudflare bucket.
 * 
 * @param {File} file - The file to upload
 * @param {string} folder - The folder prefix (e.g., 'avatars', 'posts')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToR2(file, folder = 'uploads') {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // 1. Ask Vercel backend for a Pre-Signed POST configuration
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

        const { url, fields, publicUrl } = await presignRes.json();

        // 2. Build the exact multipart/form-data form requested by AWS S3/Cloudflare API
        const formData = new FormData();

        // AWS S3 / Cloudflare REQUIRES all signature fields to be appended FIRST.
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // The exact file stream must be appended LAST.
        formData.append('file', file);

        // 3. Upload the file DIRECTLY to Cloudflare R2 using standard POST
        // This makes the browser view it as a normal HTML form submit—NO OPTIONS preflight.
        const uploadRes = await fetch(url, {
            method: 'POST',
            // DO NOT set 'Content-Type' manually!
            // When passing FormData, the browser auto-generates the boundary (e.g. multipart/form-data; boundary=----WebKitFormBoundary...)
            body: formData
        });

        if (!uploadRes.ok) {
            throw new Error(`Cloudflare rejected the upload POST. Status: ${uploadRes.status}`);
        }

        // Return the final formatted URL
        return publicUrl;
    } catch (error) {
        console.error('Presigned POST R2 Upload Error:', error);
        throw new Error(error.message || 'Failed to upload image. Please try again.');
    }
}
