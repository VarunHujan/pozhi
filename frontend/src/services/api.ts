// ==========================================
// API SERVICE - Fetch pricing from backend
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ==========================================
// PRICING API
// ==========================================

export interface PassPhotoCategory {
    id: string;
    label: string;
    columns: number;
    rows: number;
    aspectLabel: string;
    packs: PassPhotoPack[];
}

export interface PassPhotoPack {
    id: string;
    label: string;
    copies: number;
    price: number;
    description?: string;
}

export interface PhotoCopySingle {
    id: string;
    sizeLabel: string;
    sizeKey: string;
    copies: string;
    price: number;
    aspectRatio: string;
}

export interface PhotoCopySet {
    id: string;
    sizeLabel: string;
    sizeKey: string;
    pricePerPiece: number;
    aspectRatio: string;
    copiesPerUnit: number;
}

export interface FrameMaterial {
    id: string;
    label: string;
    description: string;
}

export interface FrameSize {
    id: string;
    sizeLabel: string;
    dimensions: string;
    price: number;
    aspectRatio: string;
    orientation: 'portrait' | 'landscape';
}

export interface AlbumCapacity {
    id: string;
    label: string;
    images: number;
    price: number;
}

export interface SnapnPrintCategory {
    id: string;
    label: string;
    description?: string;
    packages: SnapnPrintPackage[];
}

export interface SnapnPrintPackage {
    id: string;
    label: string;
    price: number;
}

// ==========================================
// API UTILITIES (Cache & Retry)
// ==========================================

// Simple in-memory cache
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch with retry and caching logic
 */
async function fetchWithCache<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
        const cached = apiCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data as T;
        }
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // If server error or rate limit, throw to trigger retry
            if (response.status >= 500 || response.status === 429) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            // For client errors (4xx), don't retry, just throw
            throw new Error(`Client error: ${response.status}`);
        }

        const json = await response.json();

        // Cache successful GET responses
        if (!options.method || options.method === 'GET') {
            apiCache.set(url, { data: json.data, timestamp: Date.now() });
        }

        return json.data as T; // Assuming unified response structure { status: 'success', data: ... }

    } catch (error) {
        if (retries > 0) {
            // Exponential backoff: 500ms, 1000ms
            const delay = 500 * (3 - retries);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithCache<T>(endpoint, options, retries - 1);
        }
        throw error;
    }
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch PassPhoto pricing (categories and packs)
 */
export async function fetchPassPhotoPricing(): Promise<PassPhotoCategory[]> {
    const data = await fetchWithCache<{ categories: PassPhotoCategory[] }>('/pricing/passphoto');
    return data.categories;
}

/**
 * Fetch PhotoCopies pricing (single and set options)
 */
export async function fetchPhotoCopiesPricing(): Promise<{
    single: PhotoCopySingle[];
    set: PhotoCopySet[];
}> {
    return await fetchWithCache<{ single: PhotoCopySingle[]; set: PhotoCopySet[] }>('/pricing/photocopies');
}

/**
 * Fetch Frames pricing (materials and sizes)
 */
export async function fetchFramesPricing(): Promise<{
    materials: FrameMaterial[];
    sizes: FrameSize[];
}> {
    return await fetchWithCache<{ materials: FrameMaterial[]; sizes: FrameSize[] }>('/pricing/frames');
}

/**
 * Fetch Album pricing (capacities)
 */
export async function fetchAlbumPricing(): Promise<AlbumCapacity[]> {
    const data = await fetchWithCache<{ capacities: AlbumCapacity[] }>('/pricing/albums');
    return data.capacities;
}

/**
 * Fetch Snap'n'Print pricing (categories and packages)
 */
export async function fetchSnapnPrintPricing(): Promise<SnapnPrintCategory[]> {
    const data = await fetchWithCache<{ categories: SnapnPrintCategory[] }>('/pricing/snapnprint');
    return data.categories;
}

/**
 * Fetch ALL pricing at once (convenience method for caching)
 */
export async function fetchAllPricing(): Promise<{
    passphoto: PassPhotoCategory[];
    photocopies: { single: PhotoCopySingle[]; set: PhotoCopySet[] };
    frames: { materials: FrameMaterial[]; sizes: FrameSize[] };
    albums: AlbumCapacity[];
    snapnprint: SnapnPrintCategory[];
}> {
    return await fetchWithCache<any>('/pricing/all');
}

// ==========================================
// UPLOAD API (Placeholder - To be implemented)
// ==========================================

export async function uploadFiles(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
            // Authorization header will be added when auth is implemented
        }
    });

    if (!response.ok) {
        throw new Error('Failed to upload files');
    }

    return await response.json();
}

// ==========================================
// ORDERS API (Placeholder - To be implemented)
// ==========================================

export async function createOrder(orderData: any) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        throw new Error('Failed to create order');
    }

    return await response.json();
}

// ==========================================
// AUTH HELPERS
// ==========================================

function getStoredToken(): string | null {
    return localStorage.getItem('access_token');
}

function authHeaders(): Record<string, string> {
    const token = getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==========================================
// AUTH API
// ==========================================

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

export interface AuthSession {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export interface LoginResponse {
    user: AuthUser;
    session: AuthSession;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Login failed');
    return json.data;
}

export async function signup(data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
}): Promise<{ user: { id: string; email: string; full_name: string } }> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Signup failed');
    return json.data;
}

export async function logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { ...authHeaders() },
    });
}

export async function getCurrentUser(): Promise<{ user: AuthUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { ...authHeaders() },
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Not authenticated');
    return json.data;
}

export async function refreshToken(refresh_token: string): Promise<{ session: AuthSession }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Token refresh failed');
    return json.data;
}

// ==========================================
// PASSKEY API
// ==========================================

export interface PasskeyInfo {
    id: string;
    friendly_name: string;
    device_type: string;
    backed_up: boolean;
    transports: string[] | null;
    last_used_at: string | null;
    created_at: string;
}

export async function getPasskeyRegistrationOptions(friendlyName?: string) {
    const response = await fetch(`${API_BASE_URL}/auth/passkey/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ friendly_name: friendlyName }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to get registration options');
    return json.data.options;
}

export async function verifyPasskeyRegistration(credential: any) {
    const response = await fetch(`${API_BASE_URL}/auth/passkey/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ credential }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Passkey registration failed');
    return json.data;
}

export async function getPasskeyLoginOptions(email?: string) {
    const response = await fetch(`${API_BASE_URL}/auth/passkey/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to get login options');
    return json.data;
}

export async function verifyPasskeyLogin(challengeId: string, credential: any): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/passkey/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, credential }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Passkey login failed');
    return json.data;
}

export async function listPasskeys(): Promise<PasskeyInfo[]> {
    const response = await fetch(`${API_BASE_URL}/auth/passkey`, {
        headers: { ...authHeaders() },
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to fetch passkeys');
    return json.data.passkeys;
}

export async function deletePasskey(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/passkey/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Failed to delete passkey');
}
