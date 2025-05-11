// src/api/apiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_TOKEN_KEY, API_BASE_URL } from '../constants/appConstants'; // Corrected path

const getApiToken = async () => {
  try {
    const userTokenString = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (userTokenString) {
      const userToken = JSON.parse(userTokenString);
      // Ensure this path matches how you store the API token within your userToken object
      return userToken?.apiToken || null;
    }
  } catch (e) {
    console.error('Failed to get API token from storage', e);
  }
  return null;
};

const request = async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
  const token = await getApiToken();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    config.body = JSON.stringify(body);
  }

  try {
    // Minimal logging for production, or more verbose for dev
    // console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`, body ? `Body (partial): ${JSON.stringify(body).substring(0,100)}...` : '');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json();
    } else {
        if (response.status === 204) { // No Content
            responseData = { success: true, data: {} }; 
        } else { // Potentially text or other non-JSON error
            const textResponse = await response.text();
            // console.warn(`API Response: Non-JSON response for ${method} ${API_BASE_URL}${endpoint} (Status: ${response.status}): ${textResponse}`);
            responseData = { success: false, error: textResponse || `Non-JSON response, Status: ${response.status}`};
        }
    }
    // console.log(`API Response: ${method} ${API_BASE_URL}${endpoint} (Status: ${response.status})`, responseData);

    if (!response.ok) {
      console.error(`API Error (${response.status}) on ${method} ${endpoint}:`, responseData?.error || responseData);
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (responseData && (responseData.error || responseData.message)) { // Check for common error/message keys
        errorMessage = responseData.error || responseData.message;
      } else if (typeof responseData === 'string' && responseData.length > 0) {
        errorMessage = responseData;
      }
      throw new Error(errorMessage);
    }
    return responseData;
  } catch (error) {
    console.error(`Network error or JSON parsing error on ${method} ${endpoint}:`, error);
    throw new Error(error.message || 'An unexpected API error occurred. Please check your network connection.');
  }
};

// --- Auth Endpoints ---
export const apiLogin = (email, password) =>
  request('/auth/login', 'POST', { email, password });

export const apiRegister = (userData) => // name, email, password, role (optional)
  request('/auth/register', 'POST', userData);

export const apiGetMe = () =>
  request('/auth/me', 'GET');

export const apiUpdatePassword = (currentPassword, newPassword) =>
  request('/auth/updatepassword', 'PUT', { currentPassword, newPassword });

export const apiForgotPassword = (email) =>
  request('/auth/forgotpassword', 'POST', { email });

export const apiResetPassword = (resetToken, password) =>
  request(`/auth/resetpassword/${resetToken}`, 'PUT', { password });

export const apiUpdateProgress = (questionId, completed) => // questionId is question_code_identifier
  request('/auth/progress', 'PUT', { questionId, completed });


// --- Branch Endpoints ---
export const apiGetBranches = () =>
  request('/branches', 'GET');

export const apiGetBranchById = (branchId) =>
  request(`/branches/${branchId}`, 'GET');

export const apiGetSemestersForBranch = (branchId) =>
  request(`/branches/${branchId}/semesters`, 'GET');


// --- Semester Endpoints ---
export const apiGetSemesterById = (semesterId) =>
  request(`/semesters/${semesterId}`, 'GET');

export const apiGetSubjectsForSemester = (semesterId) =>
  request(`/semesters/${semesterId}/subjects`, 'GET');


// --- Subject Endpoints ---
export const apiGetSubjectById = (subjectId) =>
  request(`/subjects/${subjectId}`, 'GET');

export const apiGetQuestionsForSubject = (subjectId, params = {}) => {
  const queryParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') { // Ensure not empty string
      queryParams.append(key, params[key]);
    }
  }
  const queryString = queryParams.toString();
  return request(`/subjects/${subjectId}/questions${queryString ? `?${queryString}` : ''}`, 'GET');
};

// --- Question Endpoints ---
export const apiSearchQuestions = (params = {}) => {
  const queryParams = new URLSearchParams();
   for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  }
  const queryString = queryParams.toString();
  return request(`/questions${queryString ? `?${queryString}` : ''}`, 'GET');
};

export const apiGetQuestionById = (questionId) => // questionId is MongoDB _id
  request(`/questions/${questionId}`, 'GET');

// Health Check
export const apiHealthCheck = () =>
  request('/health', 'GET');

// Default export combining all functions
const api = {
  login: apiLogin,
  register: apiRegister,
  getMe: apiGetMe,
  updatePassword: apiUpdatePassword,
  forgotPassword: apiForgotPassword,
  resetPassword: apiResetPassword,
  updateProgress: apiUpdateProgress,
  getBranches: apiGetBranches,
  getBranchById: apiGetBranchById,
  getSemestersForBranch: apiGetSemestersForBranch,
  getSemesterById: apiGetSemesterById,
  getSubjectsForSemester: apiGetSubjectsForSemester,
  getSubjectById: apiGetSubjectById,
  getQuestionsForSubject: apiGetQuestionsForSubject,
  searchQuestions: apiSearchQuestions,
  getQuestionById: apiGetQuestionById,
  healthCheck: apiHealthCheck,
};

export default api;