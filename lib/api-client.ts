const API_BASE_URL = "/api";

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) {
    return {};
  }
  try {
    return await response.json();
  } catch (e) {
    return {};
  }
}

async function request(method: string, path: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  return handleResponse(response);
}

export const apiClient = {
  get: (path: string) => request('GET', path),
  post: (path: string, data: any) => request('POST', path, data),
  put: (path: string, data: any) => request('PUT', path, data),
  delete: (path: string) => request('DELETE', path),

  // Agent methods
  listAgents: (skip = 0, limit = 100) => apiClient.get(`/agents?skip=${skip}&limit=${limit}`),
  getAgent: (id: string) => apiClient.get(`/agents/${id}`),
  createAgent: (data: any) => apiClient.post('/agents', data),
  updateAgent: (id: string, data: any) => apiClient.put(`/agents/${id}`, data),
  deleteAgent: (id: string) => apiClient.delete(`/agents/${id}`),

  // Template methods
  listTemplates: () => apiClient.get('/templates'),

  // Crawling methods
  startCrawl: (data: { url: string, formats: string[] }) => apiClient.post('/crawling/scrape', data),

  // Specialized agents
  getSpecializedAgentTypes: () => apiClient.get('/specialized-agents/types'),
  createSpecializedAgent: (data: any) => apiClient.post('/specialized-agents/specialized', data),

  // Semantic agents
  getSemanticAgentTypes: () => apiClient.get('/semantic-agents/types'),
  createSemanticAgent: (data: any) => apiClient.post('/semantic-agents/semantic', data),
  
  // Deep Agents
  getDeepAgentsInfo: () => apiClient.get('/deep-agents'),
  listAvailableSubagents: () => apiClient.get('/deep-agents/subagents'),
  createDeepAgent: (data: any) => apiClient.post('/deep-agents/agents/create', data),
  createCustomDeepAgent: (data: any) => apiClient.post('/deep-agents/agents/custom', data),
  createPlan: (data: any) => apiClient.post('/deep-agents/planning/create-plan', data),

  // Team methods
  createTeam: (data: any) => apiClient.post('/teams', data),
};

// Type definitions
export interface Agent {
  id: string;
  name: string;
  description: string;
  status?: string;
  created_at: string;
  agent_type?: string;
  model?: string;
  temperature?: number;
  capabilities?: string[];
  specialization?: any;
  semantic_features?: {
    project_path?: string;
  };
}

export interface SemanticAgent extends Agent {
  agent_type: 'semantic_generator' | 'semantic_refactorer' | 'semantic_analyzer';
}

export interface DeepAgent extends Agent {
  agent_type: 'deep_agent';
}

export interface SemanticAnalysisResult {
  // Define structure based on backend response
}

export default apiClient;
