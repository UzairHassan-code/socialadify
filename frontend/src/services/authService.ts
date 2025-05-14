// D:\socialadify\frontend\src\services\authService.ts

// Use environment variable for the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Interface for signup data
// Ensure 'export' keyword is present
export interface SignupData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

// Interface for login data
// Ensure 'export' keyword is present
export interface LoginFormData {
  email: string;
  password: string;
}

// Interface for the token response from the backend
// Ensure 'export' keyword is present
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Interface for public user data
// Ensure 'export' keyword is present
export interface UserPublic {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

// Helper function to process API error responses
async function handleApiError(response: Response, defaultErrorMessage: string): Promise<never> {
  let processedErrorMessage = defaultErrorMessage;
  try {
    const errorData = await response.json();
    console.error("AUTH_SERVICE_RECEIVED_ERROR_DATA:", errorData);

    if (errorData && errorData.detail) {
      const detail = errorData.detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const firstError = detail[0];
        if (typeof firstError === 'object' && firstError !== null && 'msg' in firstError && typeof (firstError as { msg: unknown }).msg === 'string') {
          processedErrorMessage = (firstError as { msg: string }).msg;
        } else {
          processedErrorMessage = `Multiple validation errors occurred. (Details: ${JSON.stringify(detail)})`;
        }
      } else if (typeof detail === 'string') {
        processedErrorMessage = detail;
      } else if (typeof detail === 'object' && detail !== null) {
        if ('msg' in detail && typeof (detail as {msg: unknown}).msg === 'string') {
            processedErrorMessage = (detail as {msg: string}).msg;
        } else {
            processedErrorMessage = JSON.stringify(detail);
        }
      }
    }
  } catch (e) {
    console.error("AUTH_SERVICE_ERROR_PARSING_JSON or UNEXPECTED_ERROR_STRUCTURE:", e);
  }
  console.error("AUTH_SERVICE_THROWING_ERROR_MESSAGE:", processedErrorMessage);
  throw new Error(processedErrorMessage);
}

// Function to sign up a user
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
    // If the response is not OK, parse the error and throw
    await handleApiError(response, 'Signup failed. Please check your details.');
  }
  // If response is OK, parse and return the JSON (UserPublic)
  return response.json();
}

// Function to log in a user
export async function loginUser(credentials: LoginFormData): Promise<TokenResponse> {
  console.log("Attempting login with credentials:", credentials);
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // Backend expects 'username' for email
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    // If the response is not OK, parse the error and throw
    await handleApiError(response, 'Login failed. Please check your credentials.');
  }
  // If response is OK, parse and return the JSON (TokenResponse)
  return response.json();
}
