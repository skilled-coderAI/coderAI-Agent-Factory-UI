import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Brain, Code, Search, RefreshCw, FileText, GitBranch, Zap, Settings } from 'lucide-react';
import { apiClient, SemanticAgent, SemanticAnalysisResult } from '@/lib/api-client';

export function SemanticAgents() {
  const [selectedAgent, setSelectedAgent] = useState<SemanticAgent | null>(null);
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    agent_type: 'semantic_generator' as const,
    description: '',
    project_path: '',
    model: 'gpt-4o',
    temperature: 0.7,
  });

  const queryClient = useQueryClient();

  // Fetch semantic agent types
  const { data: agentTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['semantic-agent-types'],
    queryFn: () => apiClient.getSemanticAgentTypes(),
  });

  // Fetch existing semantic agents
  const { data: semanticAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['semantic-agents'],
    queryFn: async () => {
      // Get all agents and filter semantic ones
      const allAgents = await apiClient.listAgents();
      return allAgents.filter(agent => 
        agent.agent_type?.startsWith('semantic_')
      ) as SemanticAgent[];
    },
  });

  // Create semantic agent mutation
  const createAgentMutation = useMutation({
    mutationFn: (data: typeof newAgentForm) => apiClient.createSemanticAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semantic-agents'] });
      toast({
        title: 'Success',
        description: 'Semantic agent created successfully!',
      });
      setNewAgentForm({
        name: '',
        agent_type: 'semantic_generator',
        description: '',
        project_path: '',
        model: 'gpt-4o',
        temperature: 0.7,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create agent: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'semantic_generator': return <Code className="h-5 w-5" />;
      case 'semantic_refactorer': return <RefreshCw className="h-5 w-5" />;
      case 'semantic_analyzer': return <Search className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'semantic_generator': return 'bg-blue-500';
      case 'semantic_refactorer': return 'bg-green-500';
      case 'semantic_analyzer': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Semantic Code Agents</h1>
          <p className="text-slate-400 mt-2">
            Advanced AI agents with semantic code understanding powered by LSP integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            <Zap className="h-3 w-3 mr-1" />
            LSP Enabled
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-400">
            <GitBranch className="h-3 w-3 mr-1" />
            Symbol-Level
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">
            Active Agents
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-slate-700">
            Create Agent
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="data-[state=active]:bg-slate-700">
            Capabilities
          </TabsTrigger>
        </TabsList>

        {/* Active Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          {agentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading semantic agents...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {semanticAgents?.map((agent) => (
                <Card key={agent.id} className="bg-slate-800 border-slate-700 p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getAgentColor(agent.agent_type)}`}>
                        {getAgentIcon(agent.agent_type)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{agent.name}</h3>
                        <p className="text-slate-400 text-sm">{agent.agent_type.replace('semantic_', '')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                    {agent.description}
                  </p>

                  {agent.semantic_features?.project_path && (
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        <FileText className="h-3 w-3 mr-1" />
                        Project Linked
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.capabilities?.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                        {cap.replace('_', ' ')}
                      </Badge>
                    ))}
                    {agent.capabilities && agent.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                        +{agent.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Settings className="h-3 w-3" />
                      <span>{agent.model}</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedAgent(agent)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Manage
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {semanticAgents && semanticAgents.length === 0 && (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No Semantic Agents</h3>
              <p className="text-slate-400 mb-4">
                Create your first semantic agent to start using advanced code analysis capabilities.
              </p>
              <Button onClick={() => {}} className="bg-blue-600 hover:bg-blue-700">
                Create Semantic Agent
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Create Agent Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-4">Create Semantic Agent</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-300">Agent Name</Label>
                  <Input
                    id="name"
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., SemanticCodeMaster"
                  />
                </div>

                <div>
                  <Label htmlFor="agent_type" className="text-slate-300">Agent Type</Label>
                  <Select 
                    value={newAgentForm.agent_type}
                    onValueChange={(value: any) => setNewAgentForm({ ...newAgentForm, agent_type: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="semantic_generator">Code Generator</SelectItem>
                      <SelectItem value="semantic_refactorer">Code Refactorer</SelectItem>
                      <SelectItem value="semantic_analyzer">Code Analyzer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project_path" className="text-slate-300">Project Path (Optional)</Label>
                  <Input
                    id="project_path"
                    value={newAgentForm.project_path}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, project_path: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="/path/to/your/project"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="model" className="text-slate-300">Model</Label>
                    <Select 
                      value={newAgentForm.model}
                      onValueChange={(value) => setNewAgentForm({ ...newAgentForm, model: value })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="temperature" className="text-slate-300">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={newAgentForm.temperature}
                      onChange={(e) => setNewAgentForm({ ...newAgentForm, temperature: parseFloat(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-slate-300">Description</Label>
                  <Textarea
                    id="description"
                    value={newAgentForm.description}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white h-32"
                    placeholder="Describe what this semantic agent will be used for..."
                  />
                </div>

                {/* Agent Type Info */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Agent Type Features</h4>
                  {agentTypes && agentTypes[newAgentForm.agent_type] && (
                    <div className="space-y-2">
                      <p className="text-slate-300 text-sm">
                        {agentTypes[newAgentForm.agent_type].instructions}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {agentTypes[newAgentForm.agent_type].semantic_features?.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs border-blue-500 text-blue-400">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => createAgentMutation.mutate(newAgentForm)}
                disabled={!newAgentForm.name || createAgentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createAgentMutation.isPending ? 'Creating...' : 'Create Semantic Agent'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {typesLoading ? (
              <div className="col-span-3 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-slate-400 mt-2">Loading capabilities...</p>
              </div>
            ) : (
              agentTypes && Object.entries(agentTypes).map(([type, config]) => (
                <Card key={type} className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`p-2 rounded-lg ${getAgentColor(type)}`}>
                      {getAgentIcon(type)}
                    </div>
                    <h3 className="text-white font-semibold capitalize">
                      {type.replace('semantic_', '')}
                    </h3>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-3">
                    {config.instructions}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-slate-300 font-medium text-sm">Capabilities:</h4>
                    <div className="flex flex-wrap gap-1">
                      {config.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                          {cap.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-slate-300 font-medium text-sm">Semantic Features:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {config.semantic_features?.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs border-blue-500 text-blue-400">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}