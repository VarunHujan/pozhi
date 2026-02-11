// ==========================================
// CSRF TOKEN MANAGEMENT
// ==========================================
// Fetches and manages CSRF tokens for API requests

let csrfToken: string | null = null;

/**
 * Fetch CSRF token from backend
 */
export async function fetchCsrfToken(): Promise<string> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/csrf-token`, {
            method: 'GET',
            credentials: 'include' // Important: send cookies
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }

        const data = await response.json();
        csrfToken = data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('CSRF token fetch error:', error);
        throw error;
    }
}

/**
 * Get current CSRF token (fetch if not available)
 */
export async function getCsrfToken(): Promise<string> {
    if (!csrfToken) {
        await fetchCsrfToken();
    }
    return csrfToken!;
}

/**
 * Clear CSRF token (call on logout)
 */
export function clearCsrfToken(): void {
    csrfToken = null;
}

/**
 * Add CSRF token to fetch headers
 */
export async function getCsrfHeaders(): Promise<Record<string, string>> {
    const token = await getCsrfToken();
    return {
        'X-CSRF-Token': token
    };
}
