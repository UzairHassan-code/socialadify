// D:\socialadify\frontend\src\services\authService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface SignupData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserPublic {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_picture_url?: string | null; 
}

export interface UserProfileUpdateData { 
  firstname?: string;
  lastname?: string;
  new_email?: string; // Added new_email
}

// --- Error Handling ---
async function handleApiError(response: Response, defaultErrorMessage: string): Promise<never> {
  let processedErrorMessage = defaultErrorMessage;
  console.error(`AUTH_SERVICE_HANDLE_ERROR: Status: ${response.status}, Content-Type: ${response.headers.get('Content-Type')}`);
  try {
    const responseText = await response.text();
    console.error("AUTH_SERVICE_HANDLE_ERROR: Response Text:", responseText);
    try {
      const errorData = JSON.parse(responseText);
      console.error("AUTH_SERVICE_HANDLE_ERROR: Parsed JSON errorData:", errorData);
      if (errorData && errorData.detail) {
        const detail = errorData.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          const firstError = detail[0];
          if (typeof firstError === 'object' && firstError !== null && 'msg' in firstError && typeof (firstError as { msg: string }).msg === 'string') {
            processedErrorMessage = (firstError as { msg: string }).msg;
          } else {
            processedErrorMessage = `Multiple errors: ${JSON.stringify(detail)}`;
          }
        } else if (typeof detail === 'string') {
          processedErrorMessage = detail;
        } else if (typeof detail === 'object' && detail !== null) {
            if ('msg' in detail && typeof (detail as {msg: string}).msg === 'string') {
             processedErrorMessage = (detail as {msg: string}).msg;
           } else {
             processedErrorMessage = JSON.stringify(detail);
           }
        } else if (responseText) {
          processedErrorMessage = responseText;
        }
      } else if (responseText) {
        processedErrorMessage = responseText;
      }
    } catch (jsonParseError) {
      console.error("AUTH_SERVICE_HANDLE_ERROR: Failed to parse response as JSON.", jsonParseError);
      if (responseText) {
        processedErrorMessage = responseText;
      }
    }
  } catch (e) {
    console.error("AUTH_SERVICE_HANDLE_ERROR: Error reading response body.", e);
  }
  console.error("AUTH_SERVICE_THROWING_ERROR_MESSAGE:", processedErrorMessage);
  throw new Error(processedErrorMessage);
}


export async function signupUser(userData: SignupData): Promise<UserPublic> {
  console.log("Attempting signup with data:", userData);
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(userData),
  });
  if (!response.ok) { return handleApiError(response, 'Signup failed. Please check your details.'); }
  return response.json();
}

export async function loginUser(credentials: LoginFormData): Promise<TokenResponse> {
  console.log("Attempting login with credentials:", credentials.email);
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
    body: formData.toString(),
  });
  if (!response.ok) { return handleApiError(response, 'Login failed. Please check your credentials.'); }
  return response.json();
}

export async function getUserProfile(token: string): Promise<UserPublic> {
  console.log("authService: Attempting to fetch user profile.");
  const response = await fetch(`${API_BASE_URL}/auth/users/me`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', },
  });
  if (!response.ok) {
    console.error(`authService: getUserProfile failed with status ${response.status}`);
    return handleApiError(response, 'Failed to fetch user profile. Session might be invalid.');
  }
  const data: UserPublic = await response.json();
  console.log("authService: User profile fetched successfully:", data);
  return data;
}

export async function apiUpdateUserProfileText(token: string, profileData: UserProfileUpdateData): Promise<UserPublic> {
  console.log("authService: Attempting to update user profile text/email with data:", profileData);
  
  const formData = new URLSearchParams();
  if (profileData.firstname !== undefined) formData.append('firstname', profileData.firstname);
  if (profileData.lastname !== undefined) formData.append('lastname', profileData.lastname);
  if (profileData.new_email !== undefined) formData.append('new_email', profileData.new_email); // Add new_email

  const response = await fetch(`${API_BASE_URL}/auth/users/me/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded', 
    },
    body: formData.toString(), 
  });

  if (!response.ok) {
    console.error(`authService: apiUpdateUserProfileText failed with status ${response.status}`);
    return handleApiError(response, 'Failed to update profile information.');
  }
  const data: UserPublic = await response.json();
  console.log("authService: User profile information updated successfully:", data);
  return data;
}

export async function apiUploadProfilePicture(token: string, imageFile: File): Promise<UserPublic> {
    console.log("authService: Attempting to upload profile picture.");
    const formData = new FormData();
    formData.append('profile_picture', imageFile); 

    const response = await fetch(`${API_BASE_URL}/auth/users/me/profile-picture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        console.error(`authService: apiUploadProfilePicture failed with status ${response.status}`);
        return handleApiError(response, 'Failed to upload profile picture.');
    }
    const data: UserPublic = await response.json();
    console.log("authService: Profile picture uploaded successfully:", data);
    return data;
}
