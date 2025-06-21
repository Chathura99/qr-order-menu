const API_URL = process.env.REACT_APP_DIRECTUS_URL;

export const apiRequest = async (endpoint, method = "GET", data = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  // Retrieve the token from localStorage
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  // Include the body in the request if data is provided
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (method == "DELETE") {
      return {};
    }

    // Check if the response status is OK (200-299)
    if (!response.ok) {
      // Throw an error if the response status is not OK
      const errorData = await response.json(); // Get the error response
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    // Return the response data as JSON
    return await response.json();
  } catch (error) {
    // Log the error and rethrow it
    console.error("API request error:", error);
    throw error;
  }
};
