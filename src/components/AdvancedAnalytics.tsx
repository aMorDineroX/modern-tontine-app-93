import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AnalyticsProps {
  data: any[];
  title: string;
  description?: string;
  dataKey?: string;
  nameKey?: string;
  onRefresh?: () => void;
  onDownload?: () => void;
  isLoading?: boolean;
}

export default function AdvancedAnalytics({ 
  data, 
  title, 
  description, 
  dataKey = "value", 
  nameKey = "name",
  onRefresh,
  onDownload,
  isLoading = false
}: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<string>("month");
  const [chartType, setChartType] = useState<string>("bar");
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, dataKey]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar dataKey={dataKey} fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, dataKey]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey={dataKey} stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, dataKey]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Area type="monotone" dataKey={dataKey} stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}`, dataKey]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
            
            {onRefresh && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {onDownload && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Tabs value={chartType} onValueChange={setChartType} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="bar">Barres</TabsTrigger>
              <TabsTrigger value="line">Ligne</TabsTrigger>
              <TabsTrigger value="area">Aire</TabsTrigger>
              <TabsTrigger value="pie">Camembert</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[300px] text-gray-500">
            <p>Aucune donnée disponible</p>
            <p className="text-sm mt-2">Essayez de modifier les filtres ou la période</p>
          </div>
        ) : (
          renderChart()
        )}
        
        <div className="mt-4 text-xs text-gray-500 text-right">
          Dernière mise à jour: {new Date().toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
