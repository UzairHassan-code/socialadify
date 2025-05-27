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
    try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
            processedErrorMessage = errorData.detail;
        } else if (response.statusText) {
            processedErrorMessage = response.statusText;
        }
    } catch (parseError) { 
        console.warn("Scheduler Service: Could not parse error response as JSON.", parseError);
    }
    console.error("Scheduler Service API Error:", processedErrorMessage, "Status:", response.status);
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
        if (response.status !== 204) return handleSchedulerApiError(response, 'Failed to delete scheduled post.');
    }
}
