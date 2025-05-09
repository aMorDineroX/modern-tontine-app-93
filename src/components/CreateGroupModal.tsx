import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { createGroup, addGroupMember } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Interface des propriétés du composant CreateGroupModal
 *
 * @interface CreateGroupModalProps
 * @property {boolean} isOpen - Indique si le modal est ouvert ou fermé
 * @property {() => void} onClose - Fonction appelée pour fermer le modal
 * @property {(data: { name: string; contribution: string; frequency: string; members: string }) => void} onSubmit - Fonction appelée lors de la soumission du formulaire
 */
type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; contribution: string; frequency: string; members: string }) => void;
};

/**
 * Composant CreateGroupModal - Modal pour créer un nouveau groupe de tontine
 *
 * Ce composant affiche un formulaire permettant à l'utilisateur de créer un nouveau groupe
 * de tontine en spécifiant le nom, le montant de contribution, la fréquence, la date de début,
 * la méthode de paiement et les membres à inviter.
 *
 * @component
 * @param {CreateGroupModalProps} props - Les propriétés du composant
 * @example
 * return (
 *   <CreateGroupModal
 *     isOpen={true}
 *     onClose={() => setIsOpen(false)}
 *     onSubmit={(data) => console.log(data)}
 *   />
 * )
 */
export default function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
  const { t, currency } = useApp();
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [members, setMembers] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("rotation");
  const [startDate, setStartDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a group",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the members email list
      const memberEmails = members
        .split(',')
        .map(email => email.trim())
        .filter(email => email && email.includes('@')); // Basic validation

      console.log("Creating group with:", {
        name,
        contribution_amount: parseFloat(contribution),
        frequency,
        start_date: startDate || new Date().toISOString(),
        payout_method: payoutMethod,
        created_by: user.id
      });

      // Create the group using the utility function
      const { data: groupData, error: groupError } = await createGroup({
        name,
        contribution_amount: parseFloat(contribution),
        frequency: frequency as 'weekly' | 'biweekly' | 'monthly',
        start_date: startDate || new Date().toISOString(),
        payout_method: payoutMethod as 'rotation' | 'random' | 'bidding',
        created_by: user.id
      });

      if (groupError) {
        console.error("Group creation error:", groupError);
        toast({
          title: "Error",
          description: "Error creating group: " + groupError.message,
          variant: "destructive"
        });
        throw groupError;
      }

      console.log("Group created successfully:", groupData);

      // Add creator as admin member
      if (groupData) {
        const { error: memberError } = await addGroupMember({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin',
          status: 'active'
        });

        if (memberError) {
          console.error("Error adding creator as member:", memberError);
          toast({
            title: "Warning",
            description: "Group created but there was an error adding you as a member",
            variant: "destructive"
          });
        }

        // If there are other members, send invitations
        if (memberEmails.length > 0) {
          console.log(`Inviting members: ${memberEmails.join(', ')} to group ${groupData.id}`);
          // In a real app, we'd send email invitations here
        }
      }

      // Call the onSubmit callback
      onSubmit({ name, contribution, frequency, members });

      // Reset form
      setName("");
      setContribution("");
      setFrequency("monthly");
      setMembers("");
      setPayoutMethod("rotation");
      setStartDate("");

      // Show success message
      toast({
        title: "Success",
        description: "Group created successfully",
      });

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      // Toast message is now handled in the error case above
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-40 p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md pointer-events-auto animate-fade-in">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">{t('createGroup')}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('groupName')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Family Tontine"
                  required
                />
              </div>

              <div>
                <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('contributionAmount')} ({currency.symbol})
                </label>
                <input
                  type="number"
                  id="contribution"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="50"
                  required
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('contributionFrequency')}
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="weekly">{t('weekly')}</option>
                  <option value="biweekly">{t('biweekly')}</option>
                  <option value="monthly">{t('monthly')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('startDate')}
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="payoutMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('payoutMethod')}
                </label>
                <select
                  id="payoutMethod"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="rotation">{t('rotation')}</option>
                  <option value="random">{t('randomSelection')}</option>
                  <option value="bidding">{t('biddingSystem')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="members" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('inviteMembers')}
                </label>
                <textarea
                  id="members"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="tontine-button tontine-button-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : t('createGroup')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
