// D:\socialadify\frontend\src\services\insightsService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

import { UserPublic } from './authService';

// --- Interfaces ---

export interface GoogleAdAccount {
    id: string;
    name: string;
    is_manager: boolean;
    is_test_account: boolean;
}

interface GoogleAdAccountsResponse {
    accounts: GoogleAdAccount[];
}

export interface GoogleCampaign {
    id: string;
    name: string;
    status: string;
    clicks: number;
    impressions: number;
    ctr: number;
    average_cpc: number;
    cost: number;
}

interface GoogleCampaignsResponse {
    campaigns: GoogleCampaign[];
}


// --- Error Handling ---
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

// --- API Functions ---

export async function getGoogleAdAccounts(token: string): Promise<GoogleAdAccountsResponse> {
    const response = await fetch(`${API_BASE_URL}/insights/google/ad-accounts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) return handleApiError(response, 'Failed to fetch Google Ads accounts.');
    return response.json();
}

export async function saveGoogleAdAccount(token: string, adAccountId: string): Promise<UserPublic> {
    const response = await fetch(`${API_BASE_URL}/insights/google/set-ad-account`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ad_account_id: adAccountId }),
    });
    if (!response.ok) return handleApiError(response, 'Failed to save the selected Google Ad Account.');
    return response.json();
}

export async function getGoogleCampaigns(token: string): Promise<GoogleCampaignsResponse> {
    const response = await fetch(`${API_BASE_URL}/insights/google/campaigns`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) return handleApiError(response, 'Failed to fetch Google Ads campaigns.');
    return response.json();
}
