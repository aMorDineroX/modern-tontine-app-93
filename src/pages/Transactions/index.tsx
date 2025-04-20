
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, ArrowDown, ArrowUp, Filter, CreditCard, Wallet, PaypalIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PayPalTransactionHistory from "@/components/PayPalTransactionHistory";
import PayPalCheckoutButton from "@/components/PayPalCheckoutButton";

export default function Transactions() {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Transactions | Naat</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Historique des Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Consultez l'historique de vos transactions et paiements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Reçu</CardTitle>
            <ArrowDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7,500€</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Envoyé</CardTitle>
            <ArrowUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,250€</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,250€</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transactions Récentes</CardTitle>
              <CardDescription>Historique de vos dernières transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filtrer
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* We would normally map through transactions data here */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Aucune transaction récente à afficher.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/transactions/all">Voir toutes les transactions</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions PayPal</CardTitle>
            <CardDescription>Gérez vos paiements et abonnements PayPal</CardDescription>
          </CardHeader>
          <CardContent>
            <PayPalTransactionHistory limit={3} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/transactions/paypal">Gérer mes transactions PayPal</Link>
            </Button>
            <PayPalCheckoutButton
              amount={10}
              description="Dépôt rapide sur votre compte Naat"
              buttonText="Dépôt rapide avec PayPal"
              buttonVariant="outline"
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
