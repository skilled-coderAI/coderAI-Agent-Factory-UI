import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { File, Plus, Sparkles, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function Templates() {
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => apiClient.listTemplates(),
  });

  const templates = Array.isArray(templatesData) ? templatesData : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "customer_service":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "research":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "marketing":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "analytics":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Agent Templates</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50 animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-slate-700 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Agent Templates</h1>
          <p className="text-slate-400 mt-1">Ready-to-use agent templates</p>
        </div>
        <Link to="/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Agent
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => (
          <Card 
            key={template.id} 
            className="glass hover:bg-slate-800/50 transition-all duration-200 group"
            data-testid="template-card"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg text-white group-hover:text-blue-300 transition-colors">
                  <File className="w-5 h-5 mr-2 text-blue-400" />
                  {template.name}
                </CardTitle>
                <Badge className={`${getCategoryColor(template.category)} border`}>
                  {template.category?.replace("_", " ") || "general"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-3 text-slate-400">
                {template.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="glass p-3 rounded-lg">
                  <div className="text-sm text-slate-300 mb-1">
                    <strong>Model:</strong> {template.configuration?.model || "Not specified"}
                  </div>
                  <div className="text-sm text-slate-300">
                    <strong>Temperature:</strong> {template.configuration?.temperature || "Not specified"}
                  </div>
                </div>
                <Link to={`/create?template=${template.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Zap className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No templates available</h3>
            <p className="text-slate-400 mb-6">
              Templates will appear here once they are created
            </p>
            <Link to="/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Your First Agent
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}