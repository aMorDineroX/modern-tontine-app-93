
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', amount: 1200 },
  { name: 'Fév', amount: 1400 },
  { name: 'Mar', amount: 1000 },
  { name: 'Avr', amount: 1600 },
];

export default function Statistics() {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Statistiques | Naat</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Statistiques et Rapports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analysez les performances de vos tontines
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contributions Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
