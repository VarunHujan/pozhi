const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        uploads: {
            id: string;
            storage_provider: string;
            storage_url: string;
            file_size_bytes: number;
            original_filename: string;
        }[];
        storage_provider: string;
    };
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
    return localStorage.getItem('access_token');
}

/**
 * Upload a single image file
 * @param file - Image file to upload
 * @returns Upload metadata including ID and URL
 */
export async function uploadImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('files', file);

    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percentCompleted = Math.round((e.loaded * 100) / e.total);
                onProgress(percentCompleted);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response: UploadResponse = JSON.parse(xhr.responseText);
                    if (!response.success || response.data.uploads.length === 0) {
                        reject(new Error('Upload failed'));
                        return;
                    }
                    const upload = response.data.uploads[0];
                    resolve({
                        id: upload.id,
                        url: upload.storage_url,
                    });
                } catch (error) {
                    reject(new Error('Failed to parse upload response'));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `${API_BASE_URL}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
}

/**
 * Delete an uploaded image
 * @param uploadId - ID of the upload to delete
 */
export async function deleteUpload(uploadId: string): Promise<void> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/upload/${uploadId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete upload: ${response.status}`);
    }
}
