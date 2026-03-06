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

        const { uploadUrl, publicUrl } = await presignRes.json();

        // 2. Upload the file DIRECTLY to Cloudflare R2 using the Pre-Signed URL
        // Content-Type strictly passed here to match the generated AWS signature
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (!uploadRes.ok) {
            throw new Error(`Cloudflare rejected the upload PUT. Please thoroughly verify your CORS policies. Status: ${uploadRes.status}`);
        }

        // Return the final formatted URL
        return publicUrl;
    } catch (error) {
        console.error('Presigned PUT R2 Upload Error:', error);
        throw new Error(error.message || 'Failed to upload image. Please try again.');
    }
}
