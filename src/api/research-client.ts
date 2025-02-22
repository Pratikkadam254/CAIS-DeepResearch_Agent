const API_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const API_TOKEN = process.env.API_TOKEN;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface ResearchResponse {
  id: string;
  query: string;
  breadth: number;
  depth: number;
  status: string;
  created_at: string;
  updated_at: string;
  results?: string[];
  error?: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function performResearch(
  query: string, 
  breadth: number, 
  depth: number,
  retryCount = 0
): Promise<ResearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ query, breadth, depth }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling research API:', error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return performResearch(query, breadth, depth, retryCount + 1);
    }
    
    throw error;
  }
}
