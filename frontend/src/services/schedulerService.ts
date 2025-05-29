// D:\socialadify\frontend\src\services\schedulerService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export interface ScheduledPostPayload {
    caption: string;
    scheduled_at_str: string;
    target_platform?: string | null;
}

export interface ScheduledPost {
    id: string;
    user_id: string;
    caption: string;
    image_url: string;
    scheduled_at: string;
    target_platform?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

async function handleSchedulerApiError(response: Response, defaultErrorMessage: string): Promise<never> {
    let processedErrorMessage = defaultErrorMessage;
    console.error(`SCHEDULER_SERVICE_HANDLE_ERROR: Status: ${response.status}, Content-Type: ${response.headers.get('Content-Type')}`);
    try {
        // MODIFIED: Read responseText first, then try to parse as JSON
        const responseText = await response.text();
        console.error("SCHEDULER_SERVICE_HANDLE_ERROR: Response Text:", responseText);
        try {
            const errorData = JSON.parse(responseText);
            console.error("SCHEDULER_SERVICE_HANDLE_ERROR: Parsed JSON errorData:", errorData);
            if (errorData && typeof errorData.detail === 'string') {
                processedErrorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                const firstError = errorData.detail[0];
                if (typeof firstError === 'object' && firstError !== null && 'msg' in firstError) {
                    processedErrorMessage = (firstError as { msg: string }).msg;
                } else {
                    processedErrorMessage = `Validation errors: ${JSON.stringify(errorData.detail)}`;
                }
            } else if (responseText) {
                processedErrorMessage = responseText; // Fallback to raw text if no structured detail
            }
        } catch (jsonParseError) {
            console.error("SCHEDULER_SERVICE_HANDLE_ERROR: Failed to parse response as JSON.", jsonParseError);
            if (responseText) {
                processedErrorMessage = responseText; // Use raw text if JSON parsing fails
            }
        }
    } catch (e) {
        console.error("SCHEDULER_SERVICE_HANDLE_ERROR: Error reading response body.", e);
    }
    console.error("SCHEDULER_SERVICE_THROWING_ERROR_MESSAGE:", processedErrorMessage);
    throw new Error(processedErrorMessage);
}

export async function createScheduledPost(
    token: string,
    caption: string,
    scheduled_at_str: string,
    imageFile: File,
    target_platform?: string | null
): Promise<ScheduledPost> {
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('scheduled_at_str', scheduled_at_str);
    formData.append('image_file', imageFile);
    if (target_platform) {
        formData.append('target_platform', target_platform);
    }
    const response = await fetch(`${API_BASE_URL}/schedule/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Session may have expired. Please log in again.");
        return handleSchedulerApiError(response, 'Failed to schedule post.');
    }
    return response.json();
}

export async function fetchScheduledPosts(
    token: string,
    skip: number = 0,
    limit: number = 10
): Promise<ScheduledPost[]> {
    const response = await fetch(`${API_BASE_URL}/schedule/?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Session may have expired. Please log in again.");
        return handleSchedulerApiError(response, 'Failed to fetch scheduled posts.');
    }
    return response.json();
}

export async function fetchScheduledPostById(token: string, postId: string): Promise<ScheduledPost> {
    const response = await fetch(`${API_BASE_URL}/schedule/${postId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Session may have expired. Please log in again.");
        return handleSchedulerApiError(response, 'Failed to fetch scheduled post details.');
    }
    return response.json();
}

export async function updateScheduledPost(
    token: string,
    postId: string,
    payload: Partial<ScheduledPostPayload>
): Promise<ScheduledPost> {
    console.log(`schedulerService: Updating scheduled post ID: ${postId} with payload:`, payload);
    const response = await fetch(`${API_BASE_URL}/schedule/${postId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Session may have expired. Please log in again.");
        return handleSchedulerApiError(response, 'Failed to update scheduled post.');
    }
    return response.json();
}

export async function deleteScheduledPost(token: string, postId: string): Promise<void> {
    console.log(`schedulerService: Deleting scheduled post ID: ${postId}`);
    const response = await fetch(`${API_BASE_URL}/schedule/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Session may have expired. Please log in again.");
        // MODIFIED: Streamlined error handling for non-204 responses
        return handleSchedulerApiError(response, 'Failed to delete scheduled post.');
    }
    // If response.ok is true, and it's a 204 No Content, no further action needed.
    // If it's a 200 OK with an empty body (less common for DELETE), it's still considered successful.
    console.log(`schedulerService: Post ID ${postId} deleted successfully.`);
}
