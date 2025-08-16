// D:\socialadify\frontend\src\services\postGeneratorService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// This defines the data we send TO the backend
export interface PostGenerationPayload {
    product_name: string;
    target_audience: string;
    key_features: string[];
    tone: string;
    platform: string;
    call_to_action: string;
    aspect_ratio: string; // *** THIS LINE IS NEW ***
}

// This defines the data we receive FROM the backend
export interface PostGenerationResult {
    image_data_url: string; // The base64 encoded image
    prompt_used: string;
}

// Error Handling Helper
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


// The API Call Function
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
