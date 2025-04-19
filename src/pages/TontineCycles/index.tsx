
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Coins } from "lucide-react";

export default function TontineCycles() {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Gestion des Cycles | Naat</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestion des Cycles de Naat</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez vos cycles de tontine et suivez leur progression
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cycles Actifs</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,000€</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cycles de Naat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full sm:w-auto">
                Créer un Nouveau Cycle
              </Button>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Aucun cycle actif. Créez un nouveau cycle pour commencer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
