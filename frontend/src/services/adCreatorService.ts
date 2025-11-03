// D:\socialadify\frontend\src\services\adCreatorService.ts
import { UserPublic } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// --- Error Handling (copied from your schedulerService) ---
// --- UPDATED TO HANDLE 422 VALIDATION ERRORS ---
async function handleApiError(response: Response, defaultErrorMessage: string): Promise<never> {
    let processedErrorMessage = defaultErrorMessage;
    try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
            // Check if detail is an array (FastAPI 422 error)
            if (Array.isArray(errorData.detail)) {
                processedErrorMessage = errorData.detail
                    .map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`)
                    .join('; ');
            } 
            // Check if detail is a simple string
            else if (typeof errorData.detail === 'string') {
                processedErrorMessage = errorData.detail;
            }
        }
    } catch (e) { /* Ignore */ }
    throw new Error(processedErrorMessage);
}

// --- Interface Definitions ---

export interface GoogleAudience {
    locations: string[];
    age_min?: number | null;
    age_max?: number | null;
    genders: string[];
    interests: string[];
}

export interface AdCreativePayload {
    campaign_name: string;
    ad_goal: string;
    headline: string;
    body_text: string;
    // image_url is no longer part of this payload, it's sent as a file
    platform: 'GOOGLE' | 'META';
    audience: GoogleAudience;
}

// --- NEW PAYLOAD FOR THE FORM ---
export interface AdCreativeFormPayload {
    ad_data: AdCreativePayload;
    image_file: File;
}
// ---

export interface AdCreativePublic {
    id: string;
    user_id: string;
    campaign_name: string;
    ad_goal: string;
    headline: string;
    body_text: string;
    image_url?: string | null;
    platform: string;
    audience: GoogleAudience;
    status: 'DRAFT' | 'PUBLISHED' | 'FAILED';
    created_at: string;
    updated_at: string;
    error_message?: string | null;
}

export interface AIPlatformSuggestionRequest {
    ad_goal: string;
    audience: GoogleAudience;
    product_description: string;
}

export interface AIPlatformSuggestionResponse {
    recommendation: string;
    recommended_platform: 'GOOGLE' | 'META';
}

// --- API Functions ---

/**
 * Fetches an AI-powered platform recommendation.
 */
export async function getAIPlatformSuggestion(
    token: string, 
    payload: AIPlatformSuggestionRequest
): Promise<AIPlatformSuggestionResponse> {
    const response = await fetch(`${API_BASE_URL}/ads/recommend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return handleApiError(response, 'Failed to get AI platform suggestion.');
    }
    return response.json();
}

/**
 * Creates a new Ad Creative draft.
 * --- UPDATED TO HANDLE FILE UPLOAD ---
 */
export async function createAdCreative(
    token: string, 
    payload: AdCreativeFormPayload // <-- Use new payload
): Promise<AdCreativePublic> {
    
    // Create FormData
    const formData = new FormData();
    
    // Append the image file
    formData.append('image_file', payload.image_file);
    
    // Append the rest of the ad data as a JSON string
    // This matches the pattern in your schedulerService
    formData.append('ad_data_json', JSON.stringify(payload.ad_data));

    const response = await fetch(`${API_BASE_URL}/ads/`, {
        method: 'POST',
        headers: {
            // 'Content-Type' is NOT set here.
            // The browser will automatically set it to 'multipart/form-data'
            // and include the boundary.
            'Authorization': `Bearer ${token}`,
        },
        body: formData, // <-- Send FormData
    });

    if (!response.ok) {
        return handleApiError(response, 'Failed to create ad draft.');
    }
    return response.json();
}

/**
 * Fetches all ad creatives for the user.
 */
export async function fetchAdCreatives(
    token: string, 
    skip: number = 0, 
    limit: number = 100
): Promise<AdCreativePublic[]> {
    const response = await fetch(`${API_BASE_URL}/ads/?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        return handleApiError(response, 'Failed to fetch ad creatives.');
    }
    return response.json();
}

/**
 * Deletes an ad creative draft.
 */
export async function deleteAdCreative(token: string, adId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ads/${adId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        return handleApiError(response, 'Failed to delete ad draft.');
    }
}

/**
 * Publishes a saved ad draft to the Google Ads API.
 * (This is the function we will build in the next major step)
 */
export async function publishAdToGoogle(token: string, adId: string): Promise<AdCreativePublic> {
    // This endpoint doesn't exist yet, but we'll create it.
    // This is our "Step 6" from the original plan.
    const response = await fetch(`${API_BASE_URL}/ads/publish/google/${adId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return handleApiError(response, 'Failed to publish ad to Google.');
    }
    return response.json();
}

