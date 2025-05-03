import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableInfo {
  name: string;
  exists: boolean;
  count?: number;
  error?: any;
}

export default function DatabaseChecker() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<any>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    setIsConnected(null);
    setConnectionError(null);
    setTables([]);

    try {
      // Simple query to check connection
      const { data, error } = await supabase.from('tontine_groups').select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error('Connection error:', error);
        setIsConnected(false);
        setConnectionError(error);
      } else {
        setIsConnected(true);
        await checkTables();
      }
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
      setConnectionError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTables = async () => {
    const tablesToCheck = [
      'tontine_groups',
      'group_members',
      'contributions',
      'payouts',
      'profiles',
      'services',
      'user_points',
      'achievements',
      'messages',
      'notifications',
      'loyalty_accounts',
      'promo_codes'
    ];
    
    const tableResults: TableInfo[] = [];
    
    for (const tableName of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        tableResults.push({
          name: tableName,
          exists: !error,
          count: count || 0,
          error: error
        });
      } catch (error) {
        tableResults.push({
          name: tableName,
          exists: false,
          error: error
        });
      }
    }
    
    setTables(tableResults);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Database Connection Checker
        </CardTitle>
        <CardDescription>
          Check the connection to Supabase and verify existing tables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Connection Status:</span>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : isConnected === null ? (
                <span className="text-muted-foreground">Not checked</span>
              ) : isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>Connection failed</span>
                </div>
              )}
            </div>
            <Button 
              onClick={checkConnection} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-1"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Refresh
            </Button>
          </div>

          {connectionError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <p className="font-semibold">Error:</p>
              <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-40">
                {JSON.stringify(connectionError, null, 2)}
              </pre>
            </div>
          )}

          {isConnected && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Row Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking tables...
                          </div>
                        ) : (
                          'No table information available'
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    tables.map((table) => (
                      <TableRow key={table.name}>
                        <TableCell className="font-mono">{table.name}</TableCell>
                        <TableCell>
                          {table.exists ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Exists</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>Not found</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {table.exists ? (
                            table.count !== undefined ? (
                              table.count
                            ) : (
                              'Unknown'
                            )
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
