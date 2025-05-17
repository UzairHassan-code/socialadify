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
}

// Improved helper function to process API error responses
async function handleApiError(response: Response, defaultErrorMessage: string): Promise<never> {
  let processedErrorMessage = defaultErrorMessage;
  
  // Log status and content type for debugging
  console.error(`AUTH_SERVICE_HANDLE_ERROR: Status: ${response.status}, Content-Type: ${response.headers.get('Content-Type')}`);

  try {
    // First, try to get the response as text, as it might not be JSON
    const responseText = await response.text();
    console.error("AUTH_SERVICE_HANDLE_ERROR: Response Text:", responseText);

    // Try to parse it as JSON
    try {
      const errorData = JSON.parse(responseText);
      console.error("AUTH_SERVICE_HANDLE_ERROR: Parsed JSON errorData:", errorData);

      if (errorData && errorData.detail) {
        const detail = errorData.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          const firstError = detail[0];
          // Handle FastAPI validation errors which are arrays of objects
          if (typeof firstError === 'object' && firstError !== null && 'msg' in firstError && typeof (firstError as { msg: unknown }).msg === 'string') {
            processedErrorMessage = (firstError as { msg: string }).msg;
          } else {
            // Fallback for array of details if not in expected FastAPI validation format
            processedErrorMessage = `Multiple errors: ${JSON.stringify(detail)}`;
          }
        } else if (typeof detail === 'string') {
          // Handle simple string detail (like "Email already registered")
          processedErrorMessage = detail;
        } else if (typeof detail === 'object' && detail !== null) {
          // Handle cases where detail itself is an object (e.g. from other error structures)
          if ('msg' in detail && typeof (detail as {msg: unknown}).msg === 'string') {
              processedErrorMessage = (detail as {msg: string}).msg;
          } else {
              processedErrorMessage = JSON.stringify(detail); // Stringify the detail object
          }
        } else if (responseText) {
            // If detail is not useful but responseText has content, use that.
            // This handles cases where the error is plain text or non-standard JSON.
            processedErrorMessage = responseText;
        }
      } else if (responseText) {
        // If errorData or errorData.detail is not present, but we have raw text
        processedErrorMessage = responseText;
      }
    } catch (jsonParseError) {
      // If JSON.parse fails, but we have the raw text, use it.
      console.error("AUTH_SERVICE_HANDLE_ERROR: Failed to parse response as JSON. Raw text:", responseText, jsonParseError);
      if (responseText) {
        processedErrorMessage = responseText;
      }
      // If responseText is also empty, the defaultErrorMessage will be used.
    }
  } catch (e) {
    // Catch errors from response.text() itself or other unexpected issues
    console.error("AUTH_SERVICE_HANDLE_ERROR: Error reading response body or unexpected error:", e);
  }

  console.error("AUTH_SERVICE_THROWING_ERROR_MESSAGE:", processedErrorMessage);
  throw new Error(processedErrorMessage);
}


export async function signupUser(userData: SignupData): Promise<UserPublic> {
  console.log("Attempting signup with data:", userData);
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    // The handleApiError function is designed to always throw, satisfying Promise<never>
    return handleApiError(response, 'Signup failed. Please check your details.');
  }
  return response.json(); // For successful response
}

export async function loginUser(credentials: LoginFormData): Promise<TokenResponse> {
  console.log("Attempting login with credentials:", credentials);
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    return handleApiError(response, 'Login failed. Please check your credentials.');
  }
  return response.json();
}
