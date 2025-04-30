# Documentation des fonctionnalités améliorées

Ce document décrit les fonctionnalités améliorées ajoutées à l'application Naat, leur implémentation technique et leur utilisation.

## Table des matières

1. [Optimisation mobile](#optimisation-mobile)
2. [Système de notifications avancé](#système-de-notifications-avancé)
3. [Système de gamification](#système-de-gamification)
4. [Système de paiement amélioré](#système-de-paiement-amélioré)
5. [Analyses avancées](#analyses-avancées)
6. [Système de chat amélioré](#système-de-chat-amélioré)
7. [Intégration avec Supabase](#intégration-avec-supabase)
8. [Tests et qualité](#tests-et-qualité)
9. [Accessibilité](#accessibilité)

## Optimisation mobile

### Description

Le composant `MobileOptimizedLayout` permet d'adapter l'interface utilisateur en fonction de la taille de l'écran, offrant une expérience optimisée sur les appareils mobiles.

### Implémentation technique

```tsx
// src/components/MobileOptimizedLayout.tsx
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  mobileView: React.ReactNode;
  desktopView: React.ReactNode;
}

export default function MobileOptimizedLayout({ 
  children, 
  mobileView, 
  desktopView 
}: MobileOptimizedLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="w-full">
      {isMobile ? mobileView : desktopView}
      {children}
    </div>
  );
}
```

### Utilisation

```tsx
<MobileOptimizedLayout
  mobileView={<MobileComponent />}
  desktopView={<DesktopComponent />}
>
  <CommonContent />
</MobileOptimizedLayout>
```

## Système de notifications avancé

### Description

Le système de notifications avancé permet aux utilisateurs de recevoir des notifications en temps réel pour diverses actions dans l'application, avec la possibilité de les filtrer, de les marquer comme lues et d'effectuer des actions directement depuis les notifications.

### Implémentation technique

#### Service de notifications

```typescript
// src/services/enhancedNotificationService.ts
import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  created_at: string;
}

// S'abonner aux notifications en temps réel
export const subscribeToUserNotifications = (userId: string, callback: (notification: Notification) => void) => {
  return supabase
    .channel(`user-notifications-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      callback(payload.new as Notification);
    })
    .subscribe();
};

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string): Promise<ServiceResponse<Notification[]>> => {
  // Implémentation...
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string): Promise<ServiceResponse<boolean>> => {
  // Implémentation...
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (userId: string): Promise<ServiceResponse<boolean>> => {
  // Implémentation...
};
```

#### Composant de centre de notifications

```tsx
// src/components/EnhancedNotificationCenter.tsx
import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Notification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToUserNotifications
} from '@/services/enhancedNotificationService';
import { useNavigate } from 'react-router-dom';

export default function EnhancedNotificationCenter() {
  // Implémentation...
}
```

### Schéma de base de données

```sql
-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Système de gamification

### Description

Le système de gamification encourage l'engagement des utilisateurs grâce à un système de points, de niveaux et de réalisations à débloquer.

### Implémentation technique

#### Service de gamification

```typescript
// src/services/gamificationService.ts
import { supabase } from '@/utils/supabase';
import { ServiceResponse } from './index';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achieved_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UserLevel {
  level: number;
  points: number;
  next_level_points: number;
  progress_percentage: number;
}

// Récupérer les réalisations d'un utilisateur
export const getUserAchievements = async (userId: string): Promise<ServiceResponse<UserAchievement[]>> => {
  // Implémentation...
};

// Récupérer le niveau d'un utilisateur
export const getUserLevel = async (userId: string): Promise<ServiceResponse<UserLevel>> => {
  // Implémentation...
};

// Attribuer des points à un utilisateur
export const awardPoints = async (userId: string, points: number, reason: string): Promise<ServiceResponse<number>> => {
  // Implémentation...
};

// Vérifier et attribuer des réalisations
export const checkAndAwardAchievements = async (userId: string): Promise<ServiceResponse<Achievement[]>> => {
  // Implémentation...
};
```

#### Composant d'affichage des réalisations

```tsx
// src/components/UserAchievements.tsx
import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, TrendingUp, Medal, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserAchievements, 
  getUserLevel, 
  checkAndAwardAchievements,
  Achievement,
  UserLevel
} from '@/services/gamificationService';

export default function UserAchievements() {
  // Implémentation...
}
```

### Schéma de base de données

```sql
-- Table des points des utilisateurs
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table de l'historique des points
CREATE TABLE IF NOT EXISTS points_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réalisations (achievements)
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(20) NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'expert'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réalisations des utilisateurs
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

## Système de paiement amélioré

### Description

Le système de paiement amélioré offre une interface utilisateur intuitive pour effectuer des paiements avec différentes méthodes (carte bancaire, PayPal, virement bancaire) et gère les abonnements et les factures.

### Implémentation technique

#### Composant de paiement

```tsx
// src/components/EnhancedPaymentSystem.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, DollarSign, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodProps {
  onPaymentComplete: (reference: string) => void;
  amount: number;
  currency?: string;
  description?: string;
}

export default function EnhancedPaymentSystem({ 
  onPaymentComplete, 
  amount, 
  currency = "EUR", 
  description 
}: PaymentMethodProps) {
  // Implémentation...
}
```

### Schéma de base de données

```sql
-- Table des méthodes de paiement des utilisateurs
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'card', 'paypal', 'bank_transfer'
  provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'bank'
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  last_four VARCHAR(4), -- Pour les cartes
  expiry_date VARCHAR(7), -- Pour les cartes (MM/YYYY)
  card_brand VARCHAR(50), -- Pour les cartes
  email VARCHAR(255), -- Pour PayPal
  bank_name VARCHAR(255), -- Pour les virements bancaires
  account_last_four VARCHAR(4), -- Pour les virements bancaires
  token_id VARCHAR(255), -- ID du token chez le fournisseur de paiement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des transactions de paiement
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'payment', 'refund'
  description TEXT,
  reference VARCHAR(255) UNIQUE,
  provider_transaction_id VARCHAR(255),
  provider_fee DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Analyses avancées

### Description

Le composant d'analyses avancées permet de visualiser les données financières et autres métriques importantes à l'aide de graphiques interactifs et personnalisables.

### Implémentation technique

```tsx
// src/components/AdvancedAnalytics.tsx
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
  // Implémentation...
}
```

## Système de chat amélioré

### Description

Le système de chat amélioré permet aux utilisateurs de communiquer en temps réel, de partager des fichiers et des images, et de voir les indicateurs de lecture et de frappe.

### Implémentation technique

```tsx
// src/components/EnhancedChatSystem.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, Smile, Image, Mic, MoreVertical, User, Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  content: string;
  attachment_url?: string;
  created_at: string;
  read: boolean;
  sender?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface EnhancedChatSystemProps {
  receiverId?: string;
  groupId?: string;
  isGroupChat?: boolean;
  title?: string;
  onClose?: () => void;
}

export default function EnhancedChatSystem({ 
  receiverId, 
  groupId, 
  isGroupChat = false,
  title,
  onClose
}: EnhancedChatSystemProps) {
  // Implémentation...
}
```

### Schéma de base de données

```sql
-- Table des messages directs entre utilisateurs
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  attachment_url TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (content IS NOT NULL OR attachment_url IS NOT NULL)
);

-- Table des groupes de chat
CREATE TABLE IF NOT EXISTS chat_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres des groupes de chat
CREATE TABLE IF NOT EXISTS chat_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Table des messages de groupe
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (content IS NOT NULL OR attachment_url IS NOT NULL)
);
```

## Intégration avec Supabase

### Description

Les nouvelles fonctionnalités sont intégrées avec Supabase pour le stockage des données, l'authentification et les fonctionnalités en temps réel.

### Migrations de base de données

Les migrations SQL pour les nouvelles tables sont disponibles dans le dossier `supabase/migrations` :

- `20240701_notifications.sql` - Tables pour le système de notifications
- `20240702_gamification.sql` - Tables pour le système de gamification
- `20240703_chat.sql` - Tables pour le système de chat amélioré
- `20240704_payments.sql` - Tables pour le système de paiement amélioré

### Application des migrations

Pour appliquer les migrations, utilisez le script `scripts/apply-migrations.sh` :

```bash
./scripts/apply-migrations.sh
```

## Tests et qualité

### Description

Des tests unitaires et d'intégration ont été ajoutés pour les nouvelles fonctionnalités afin d'assurer leur qualité et leur fiabilité.

### Tests unitaires

Les tests unitaires pour les nouveaux composants sont disponibles dans le dossier `src/test` :

- `EnhancedNotificationCenter.test.tsx` - Tests pour le centre de notifications
- `UserAchievements.test.tsx` - Tests pour le système de gamification
- `EnhancedPaymentSystem.test.tsx` - Tests pour le système de paiement
- `AdvancedAnalytics.test.tsx` - Tests pour les analyses avancées
- `EnhancedChatSystem.test.tsx` - Tests pour le système de chat

### Exécution des tests

Pour exécuter tous les tests, utilisez le script `scripts/run-tests.sh` :

```bash
./scripts/run-tests.sh
```

## Accessibilité

### Description

Les nouveaux composants ont été conçus en tenant compte de l'accessibilité, avec des attributs ARIA appropriés, une navigation au clavier et un bon contraste des couleurs.

### Améliorations d'accessibilité

- Utilisation d'attributs ARIA pour les composants interactifs
- Support de la navigation au clavier
- Contraste des couleurs conforme aux normes WCAG
- Messages d'erreur clairs et descriptifs
- Textes alternatifs pour les images et les icônes
- Structure sémantique avec des éléments HTML appropriés

### Vérification de l'accessibilité

Pour vérifier l'accessibilité de l'application, vous pouvez utiliser des outils comme :

- [axe DevTools](https://www.deque.com/axe/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

## Conclusion

Ces fonctionnalités améliorées enrichissent considérablement l'application Naat en offrant une meilleure expérience utilisateur, plus d'engagement et des fonctionnalités avancées pour la gestion des tontines. Elles sont conçues pour être modulaires, performantes et accessibles, et sont intégrées de manière transparente avec le reste de l'application.
