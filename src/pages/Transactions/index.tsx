
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Transactions() {
  // Exemple de données de transactions
  const transactions = [
    {
      id: 1,
      date: "2024-04-19",
      type: "Contribution",
      amount: 100,
      status: "success"
    },
    {
      id: 2,
      date: "2024-04-18",
      type: "Paiement",
      amount: 500,
      status: "pending"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Historique des Transactions | Naat</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Historique des Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Consultez l'historique de vos transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{transaction.amount}€</span>
                    <Badge variant={transaction.status === "success" ? "default" : "secondary"}>
                      {transaction.status === "success" ? "Complété" : "En attente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
