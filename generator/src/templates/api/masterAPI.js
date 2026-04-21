// cosmosAPI.js
import axios from "axios";
const NEXT_PUBLIC_BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
const CONTENT_TYPE_JSON = "application/json";

async function prefetchMasterData(token){
  try{
    console.log("Prefetching master data with token:", NEXT_PUBLIC_BASE_API_URL);
    const response =  await fetch(`${NEXT_PUBLIC_BASE_API_URL}/masters`, {
      method: 'GET',
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": 'application/json',
      },
    });
    return response.json();
  }catch(error){
    console.error("Error fetching master data API:", error);
    throw error;
  }
}

const fetchAgreementNumbers = async(token) => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}//agreements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }); 
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching agreement numbers:', error);
    return [];
  } 
};

const fetchAgreementDetails = async(agreementNo) => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}//agreements/${agreementNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Error fetching agreement details:', error);
    return null;
  }
};

const updateFlightDetails = async(agreementNo, flightData) => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}/agreements/${agreementNo}/flights/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightData),
    });
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating flight details:', error);
    return false;
  }
};


const deleteFlightDetails = async(agreementNo, flightData, isSoftDelete = true) => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}/agreements/${agreementNo}/flights/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flights: flightData, softDelete: isSoftDelete }),
    });
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting flight details:', error);
    return false;
  }
};

const addFlightDetails = async(agreementNo, flightData) => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}/agreements/${agreementNo}/flights/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightData),
    });
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error adding flight details:', error);
    return false;
  }
};

const fetchAirlineDetails = async() => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}/airlines`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json', 
      },
    });  
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching airline details:', error);
    return [];
  }
};

const fetchFlightLists = async(agreementNo) => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}/agreement-flights/`, {
      method: 'GET',
      headers:{
        'Content-Type': 'application/json',
      },
     
    });
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return [];
    }
    return await response.json() || [];
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return [];
  };
  }
  async function fetchMasterTableData(masterTable, token, optionsOrLimit, offsetMaybe) {
    console.log("Fetching master data for", masterTable, optionsOrLimit, offsetMaybe);
    try {
      // Backward compatibility handling
      let limit = 50;
      let offset = 0;
      let filters = {};
      let sort;
      let order;
  
      if (
        typeof optionsOrLimit === "number" ||
        typeof offsetMaybe === "number"
      ) {
        // Old style: (table, token, limit, offset)
        limit = optionsOrLimit ?? 50;
        offset = offsetMaybe ?? 0;
      } else if (typeof optionsOrLimit === "object" && optionsOrLimit !== null) {
        ({ limit = 50, offset = 0, filters = {}, sort, order } = optionsOrLimit);
      }
  
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
  
      // Add filters (skip null/undefined/empty)
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
          // Multiple values -> repeat param
          value.forEach((v) => {
            if (v !== null && v !== undefined && `${v}`.trim() !== "")
              params.append(key, v);
          });
        } else if (`${value}`.trim() !== "") {
          params.append(key, value);
        }
      });
  
      // Sorting (optional)
      if (sort) params.append("sort", sort);
      if (order) params.append("order", order);
  
      const url = `${NEXT_PUBLIC_BASE_API_URL}/${masterTable}/?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": CONTENT_TYPE_JSON,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch data (${response.status})`);
      }
  
      const res = await response.json();
      return res || [];
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
  
  async function uploadMasterData(
    accessToken,
    formData,
    selectedMaster
  ) {
    console.log("***********Master file Upload API******", formData, NEXT_PUBLIC_BASE_API_URL);
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BASE_API_URL}//${selectedMaster}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
     
      
      return response.data;
    } catch (error) {
      console.error("API call error:", error);
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        throw errorMessage;
      }
      throw error;
    }
  };
  
  async function deleteMasterRecord(selectedoption, token, id) {
      const url = `${NEXT_PUBLIC_BASE_API_URL}//${selectedoption}/${id}`;
      console.log('delete url:', url);
      try {
          return await axios.delete(url, {
              headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": CONTENT_TYPE_JSON,
              },
          });        
      } catch (error) {
          throw new Error(`DELETE request to ${url} failed: ${error.message}`);
      }
  }
  
  async function updateMasterRecord(selectedoption, id, newRowData, token) {
    console.log("Inside  updateMasterData API ", selectedoption, `${NEXT_PUBLIC_BASE_API_URL}//${selectedoption}/${id}/`);
      const url = `${NEXT_PUBLIC_BASE_API_URL}/${selectedoption}/${id}/`;
      const requestBody = newRowData;
      console.log('put url:', url);
      try {     
          return axios.put(url, requestBody, {
              headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": CONTENT_TYPE_JSON,
              },
          });
      } catch (error) {
          throw new Error(`PUT request to ${url} failed: ${error.message}`);
      }
  }
  
  async function addMasterRecord(selectedoption, newRowData, token) {
      console.log("inside addMasterData api", selectedoption);
      const url = `${NEXT_PUBLIC_BASE_API_URL}/${selectedoption}/`;
      const requestBody = newRowData;
      console.log('post url:', url);
      console.log('post data:', requestBody);
      try {
          return axios.post(url, requestBody, {
              headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": CONTENT_TYPE_JSON,
              },
          });
      } catch (error) {
          throw new Error(`POST request to ${url} failed: ${error.message}`);
      }
  }

  async function downloadCSV(accessToken, export_type, requestFrom, filterParams) {
    let query_params = "";
    if (requestFrom === "pending") {
       query_params = `&status=Pending`;
    }
  
    // Append filter parameters if provided
    if (filterParams) {
      const filterKeyMap = {
        record_id: "id",
        holiday: "holiday",
        route: "route",
        origin: "origin",
        destination: "destination",
        region: "region",
        user: "user",
        mro: "mro",
        status: "status",
      };
  
      Object.entries(filterKeyMap).forEach(([key, param]) => {
        if (filterParams[key]) {
          query_params += `&${param}=${filterParams[key]}`;
        }
      });
    }
  
    console.log("***********Download CSV API with export_type and requestFrom******", `${gptAPIBaseUrl}/gpt-requests/?request=download&export_type=${export_type}${query_params}`);
    try {
      const response = await fetch(`${NEXT_PUBLIC_BASE_API_URL}//gpt-requests/?request=download&export_type=${export_type}${query_params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorResponse = await response.blob();
        console.error(
          `Audit API Error: ${errorResponse.status} - ${errorResponse.error}`
        );
        throw errorResponse.error;
      }
      const data = await response.blob();
      
      const filename = getFileNameFromContentDispositionHeader(
        response.headers.get("Content-Disposition")
      );
      
      // You can trigger a file download here if the API returns a file URL
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // or whatever file name you want
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }
export { fetchAgreementNumbers, fetchAgreementDetails, updateFlightDetails, deleteFlightDetails, addFlightDetails, fetchAirlineDetails, fetchFlightLists, prefetchMasterData, addMasterRecord, updateMasterRecord, deleteMasterRecord, fetchMasterTableData, uploadMasterData, downloadCSV };