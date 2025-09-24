// D:\socialadify\frontend\src\services\postGeneratorService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// --- Types for the API communication ---

export interface PostGenerationPayload {
    product_name: string;
    target_audience: string;
    key_features: string[];
    tone: string;
    platform: string;
    call_to_action: string;
    aspect_ratio: string;
}

export interface PostGenerationResult {
    image_data_url: string;
    prompt_used: string;
}

// *** NEW TYPE for the save request payload ***
export interface SavePostPayload {
    image_data_url: string;
    prompt_used: string;
    original_request: PostGenerationPayload;
}


// --- Error Handling Helper ---
async function handleApiError(response: Response, defaultErrorMessage: string): Promise<never> {
    let processedErrorMessage = defaultErrorMessage;
    try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
            processedErrorMessage = errorData.detail;
        }
    } catch (e) {
        // Ignore if the response is not JSON
    }
    throw new Error(processedErrorMessage);
}


// --- API Call Functions ---
export async function generateVisualPost(token: string, payload: PostGenerationPayload): Promise<PostGenerationResult> {
    console.log("postGeneratorService: Sending payload to backend:", payload);
    
    const response = await fetch(`${API_BASE_URL}/post-generator/generate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: Your session may have expired. Please log in again.");
        }
        return handleApiError(response, 'Failed to generate visual post.');
    }

    return response.json();
}

// *** NEW FUNCTION to save the post ***
export async function saveVisualPost(token: string, payload: SavePostPayload): Promise<{ message: string }> {
    console.log("postGeneratorService: Saving post to DB.");
    
    const response = await fetch(`${API_BASE_URL}/post-generator/save`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: Your session may have expired. Please log in again.");
        }
        return handleApiError(response, 'Failed to save the post.');
    }

    return response.json();
}
