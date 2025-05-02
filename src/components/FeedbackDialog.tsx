import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserFeedbackForm from './UserFeedbackForm';
import { MessageSquare } from 'lucide-react';

interface FeedbackDialogProps {
  featureId: string;
  featureName: string;
  trigger?: React.ReactNode;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function FeedbackDialog({
  featureId,
  featureName,
  trigger,
  buttonVariant = 'outline',
  buttonSize = 'default'
}: FeedbackDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={buttonVariant} size={buttonSize}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Donner mon avis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Votre avis compte</DialogTitle>
          <DialogDescription>
            Aidez-nous à améliorer {featureName} en partageant votre expérience.
          </DialogDescription>
        </DialogHeader>
        <UserFeedbackForm 
          featureId={featureId} 
          featureName={featureName} 
          onClose={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
