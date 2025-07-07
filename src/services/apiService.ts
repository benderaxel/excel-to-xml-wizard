import { DataChangeRequest } from "@/components/DataFindConflicts";

import { parseExcelFile } from "../utils/excelParser";

export type ServerResponse = {
  success: boolean;
  message: string;
  data?: any;
  statusCode?: number;
};

const BASE_URL = "http://ai-assistant.corp.aleido.se:3000"; //Leave blank for remote (Pine) deployment. Access remote hosted backend from locally hosted frontend "http://ai-assistant.corp.aleido.se:3000";

export const uploadFile = async (
  file: File,
  sessionId: string
): Promise<ServerResponse> => {
  try {
    const apiUrl = `${BASE_URL}/api/v2/ingest/${sessionId}`;
    const formData = new FormData();
    formData.append("file", file);

    console.log(`Uploading file to ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      credentials: "omit",
    });

    console.log("Upload response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    // Parse the server response
    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.log("Response is not JSON:", text);
      result = { message: text };
    }

    // Also parse the Excel file locally for preview
    const data = await parseExcelFile(file);

    return {
      success: true,
      message: "File uploaded successfully",
      data: { serverResponse: result, excelData: data },
      statusCode: response.status,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during upload",
    };
  }
};

export const queryDataGraph = async (
  body: {
    build_line: string;
    market: string;
    graph_property: string;
  },
  sessionId: string
): Promise<ServerResponse> => {
  try {
    const apiUrl = `${BASE_URL}/api/v2/query/${sessionId}`;
    console.log(`Querying data graph at: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: "Query executed successfully",
      data: result,
      statusCode: response.status,
    };
  } catch (error) {
    console.error("Query error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during query",
    };
  }
};

export async function fetchMarketOptions(
  sessionId: string,
  propertyId: string = "for_market"
) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v2/property-values/${sessionId}/${propertyId}`,
      {
        credentials: "omit",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: "Market options fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching market options:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch market options",
    };
  }
}

export async function fetchGraphProperties(sessionId: string) {
  try {
    const response = await fetch(`/api/v2/properties/${sessionId}`, {
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: "Graph properties fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching graph properties:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch graph properties",
    };
  }
}

export async function fetchFindConflictsData(
  sessionId: string,
  body: DataChangeRequest
) {
  try {
    const apiUrl = `${BASE_URL}/api/v2/find-conflicts/${sessionId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: "fetchCompareData executed successfully",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during data comparison",
    };
  }
}

export async function fetchOverviewData(sessionId: string) {
  try {
    const apiUrl = `${BASE_URL}/api/v2/new-and-removed/${sessionId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: "fetchOverviewData executed successfully",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during data comparison",
    };
  }
}

export async function fetchConflictsExcel(sessionId: string) {
  try {
    const apiUrl = `${BASE_URL}/api/v2/get-last-conflicts-export/${sessionId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    // Handle blob response for file download
    const blob = await response.blob();

    return {
      success: true,
      message: "Excel file fetched successfully",
      data: blob,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during Excel download",
    };
  }
}
