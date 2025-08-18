// D:\socialadify\frontend\src\services\historyService.ts

import { SavedCaption } from './captionService';
import { PostGenerationPayload } from './postGeneratorService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface SavedPost {
    id: string;
    user_id: string;
    image_url: string;
    prompt_used: string;
    original_request: PostGenerationPayload; 
    created_at: string;
    item_type: "post";
}

export type HistoryItem = SavedCaption | SavedPost;

async function handleApiError(response: Response, defaultErrorMessage: string): Promise<never> {
    let processedErrorMessage = defaultErrorMessage;
    try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
            processedErrorMessage = errorData.detail;
        }
    } catch (e) { /* Ignore */ }
    throw new Error(processedErrorMessage);
}

export async function fetchUnifiedHistory(token: string): Promise<HistoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/history/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Your session may have expired.");
        return handleApiError(response, 'Failed to fetch history.');
    }
    return response.json();
}

// --- NEW FUNCTION TO DELETE A VISUAL POST ---
export async function deleteVisualPost(token: string, postId: string): Promise<void> {
    console.log(`historyService: Deleting visual post ID: ${postId}`);
    
    const response = await fetch(`${API_BASE_URL}/post-generator/${postId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Your session may have expired.");
        return handleApiError(response, 'Failed to delete the visual post.');
    }
    // A 204 No Content response has no body to parse
}
