import axios from "axios";

const url = import.meta.env.VITE_API_URL;

// Fetch active managers
export const fetchActiveManagers = async ({ queryKey, signal, token }) => {
  const [, { page, limit }] = queryKey;

  try {
    const response = await axios.get(`${url}/manager/active`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.managers) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching active managers:", error.message);
    }
    throw error;
  }
};

// Fetch suspended managers
export const fetchSuspendedManagers = async ({ queryKey, signal, token }) => {
  const [, { page, limit }] = queryKey;

  try {
    const response = await axios.get(`${url}/manager/suspended`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.managers) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching suspended managers:", error.message);
    }
    throw error;
  }
};

export const fetchActiveAdmins = async ({ queryKey, signal, token }) => {
  const [, { page, limit }] = queryKey;

  try {
    const response = await axios.get(`${url}/admin/active`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.admins) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching active admins:", error.message);
    }
    throw error;
  }
};

// Fetch dormant admins
export const fetchDormantAdmins = async ({ queryKey, signal, token }) => {
  const [, { page, limit }] = queryKey;

  try {
    const response = await axios.get(`${url}/admin/dormant`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.admins) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching dormant admins:", error.message);
    }
    throw error;
  }
};

export const toggleQueryUserStatus = async (userId, token) => {
  try {
    const response = await axios.put(
      `${url}/auth/${userId}/toggle-status`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteQueryUser = async (userId, token) => {
  try {
    const response = await axios.delete(`${url}/auth/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
