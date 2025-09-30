export function parseApiError(error: any): string {
  // Default
  let apiMessage = "Something went wrong. Please try again.";

  // Handle Axios error object
  if (error?.response) {
    const { data, status } = error.response;
    if (data?.error_description) {
      apiMessage = data.error_description;
    } else if (data?.message) {
      apiMessage = data.message;
    } else if (typeof data === "string") {
      apiMessage = data;
    } else if (status === 401) {
      apiMessage = "Invalid email or password";
    } else if (status >= 500) {
      apiMessage = "Server error. Please try later.";
    }
    return apiMessage;
  }

  // Handle custom API error object from authApi.login
  if (typeof error === 'object' && error !== null) {
    if (error.error_description) {
      apiMessage = error.error_description;
    } else if (error.message) {
      apiMessage = error.message;
    } else if (error.errors && typeof error.errors.email === 'object' && error.errors.email.length > 0) {
      apiMessage = error.errors.email[0];
    }
    return apiMessage;
  }

  // Handle plain error message
  if (typeof error === 'string') {
    apiMessage = error;
    return apiMessage;
  }

  // Handle network error
  if (error?.message) {
    if (error.message.includes("Network")) {
      apiMessage = "Network error. Please check your connection.";
    } else {
      apiMessage = error.message;
    }
    return apiMessage;
  }

  return apiMessage;
}
