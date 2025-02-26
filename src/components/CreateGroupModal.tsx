
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; contribution: string; frequency: string; members: string }) => void;
};

export default function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [members, setMembers] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("rotation");
  const [startDate, setStartDate] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, contribution, frequency, members });
    setName("");
    setContribution("");
    setFrequency("monthly");
    setMembers("");
    setPayoutMethod("rotation");
    setStartDate("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-40 p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md pointer-events-auto animate-fade-in">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Create New Tontine Group</h2>
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
                  Group Name
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
                  Contribution Amount
                </label>
                <input
                  type="text"
                  id="contribution"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="$50"
                  required
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contribution Frequency
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
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
                  Payout Method
                </label>
                <select
                  id="payoutMethod"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="rotation">Rotation</option>
                  <option value="random">Random Selection</option>
                  <option value="bidding">Bidding System</option>
                </select>
              </div>

              <div>
                <label htmlFor="members" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Invite Members (email addresses, comma separated)
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
                <button type="submit" className="tontine-button tontine-button-primary w-full">
                  Create Tontine Group
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
