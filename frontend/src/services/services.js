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
//Fetch admins
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
//Toggle users status
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
//Delete user
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
//Register new user
export const registerNewUser = async (userData, token) => {
  try {
    const response = await axios.post(`${url}/auth/register`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
//Register supplier
export const registerNewSupplier = async (supplierData, token) => {
  try {
    const response = await axios.post(
      `${url}/supplier/register`,
      supplierData,
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
//Fetch all suppliers
export const fetchAllSuppliers = async ({ queryKey, signal, token }) => {
  const [, { page = 1, limit = 100 }] = queryKey;
  try {
    const response = await axios.get(`${url}/supplier/`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.suppliers) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching suppliers:", error.message);
    }
    throw error;
  }
};
//Delete supplier
export const deleteQuerySupplier = async (supplierId, token) => {
  try {
    const response = await axios.delete(`${url}/supplier/${supplierId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
//Register region
export const registerNewRegion = async (regionData, token) => {
  try {
    const response = await axios.post(`${url}/region/register`, regionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
//Fetch region
export const fetchAllRegions = async ({ queryKey, signal, token }) => {
  const [, { page = 1, limit = 100 }] = queryKey;
  try {
    const response = await axios.get(`${url}/region/regions`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.regions) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching regions:", error.message);
    }
    throw error;
  }
};
// Delete region
export const deleteQueryRegion = async (regionId, token) => {
  try {
    const response = await axios.delete(`${url}/region/${regionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
//REgister phone
export const registerNewPhone = async (phoneData, token) => {
  try {
    const response = await axios.post(`${url}/phone/register`, phoneData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
// Fetch active phones
export const fetchActivePhones = async ({ queryKey, signal, token }) => {
  const [, { page = 1, limit = 10 }] = queryKey;
  try {
    const response = await axios.get(`${url}/phone/active`, {
      params: { page, limit, status: "active" },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.phones) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching active phones:", error.message);
    }
    throw error;
  }
};
//Fech suspended phones
export const fetchSuspendedPhones = async ({ queryKey, signal, token }) => {
  const [, { page = 1, limit = 10 }] = queryKey;
  try {
    const response = await axios.get(`${url}/phone/suspended`, {
      params: { page, limit, status: "suspended" },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.phones) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching suspended phones:", error.message);
    }
    throw error;
  }
};
// Fetch lost phones
export const fetchLostPhones = async ({ queryKey, signal, token }) => {
  const [, { page = 1, limit = 10 }] = queryKey;
  try {
    const response = await axios.get(`${url}/phone/lost`, {
      params: { page, limit, status: "lost" },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.phones) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching lost phones:", error.message);
    }
    throw error;
  }
};
// Edit phone
export const editPhoneDetails = async (phoneId, phoneData, token) => {
  try {
    const response = await axios.put(
      `${url}/phone/edit/${phoneId}`,
      phoneData,
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
// Register a new phone model
export const registerNewModel = async (modelData, token) => {
  try {
    const response = await axios.post(`${url}/model/`, modelData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
// Fetch all models
export const fetchAllModels = async ({ queryKey, signal, token }) => {
  const [, { page = 1, limit = 100 }] = queryKey;
  try {
    const response = await axios.get(`${url}/model/`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.data || !response.data.models) {
      throw new Error("Invalid response structure from the server.");
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("Request canceled", error.message);
    } else {
      console.error("Error fetching models:", error.message);
    }
    throw error;
  }
};
//Edit phone model
export const editCommission = async (commissionData, token) => {
  try {
    const response = await axios.put(`${url}/model/`, commissionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
