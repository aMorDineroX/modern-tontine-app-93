
import { useState } from "react";
import { ChartLine, Coins, PiggyBank, UserPlus, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import TontineGroup from "@/components/TontineGroup";
import ContributionCard from "@/components/ContributionCard";
import MemberList from "@/components/MemberList";
import UserProfile from "@/components/UserProfile";
import CreateGroupModal from "@/components/CreateGroupModal";

// Mock data
const mockGroups = [
  { id: 1, name: "Family Savings", members: 8, contribution: "$50 / month", nextDue: "Jun 15, 2023" },
  { id: 2, name: "Friends Circle", members: 5, contribution: "$100 / month", nextDue: "Jun 22, 2023" },
  { id: 3, name: "Business Collective", members: 12, contribution: "$200 / month", nextDue: "Jul 1, 2023" },
];

const mockMembers = [
  { id: 1, name: "Nia Johnson", status: "active" as const },
  { id: 2, name: "Kwame Brown", status: "active" as const },
  { id: 3, name: "Zainab Ali", status: "pending" as const },
  { id: 4, name: "Tariq Hassan", status: "active" as const },
  { id: 5, name: "Amara Okafor", status: "paid" as const },
];

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateGroup = (data: { name: string; contribution: string; frequency: string; members: string }) => {
    console.log("Creating new group:", data);
    // Here you would normally send this data to your backend
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your tontine contributions and manage your savings groups
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button 
              className="tontine-button tontine-button-primary inline-flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus size={18} className="mr-2" />
              Create New Group
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ContributionCard 
            title="Total Contributions" 
            amount="$1,250" 
            trend="Up 8% from last month" 
            icon="contribution" 
          />
          <ContributionCard 
            title="Available Balance" 
            amount="$450" 
            icon="balance" 
          />
          <div className="tontine-card animate-slide-up">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-tontine-light-purple/50 flex items-center justify-center mr-4">
                <Users size={20} className="text-tontine-dark-purple" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Groups</h3>
                <p className="text-2xl font-semibold">3</p>
              </div>
            </div>
          </div>
          <div className="tontine-card animate-slide-up">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-tontine-soft-blue/50 flex items-center justify-center mr-4">
                <ChartLine size={20} className="text-tontine-dark-purple" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Next Payout</h3>
                <p className="text-2xl font-semibold">Jun 30</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Groups */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Tontine Groups</h2>
              <button className="text-tontine-purple hover:text-tontine-dark-purple text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockGroups.map((group) => (
                <TontineGroup
                  key={group.id}
                  name={group.name}
                  members={group.members}
                  contribution={group.contribution}
                  nextDue={group.nextDue}
                  onClick={() => console.log("Clicked on group:", group.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Profile & Members */}
          <div className="space-y-8">
            <div className="tontine-card">
              <UserProfile 
                name="Olivia Nkosi" 
                contribution="Premium Member" 
              />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Coins size={18} className="text-tontine-dark-purple mr-1" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <p className="font-semibold">3 Groups</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <PiggyBank size={18} className="text-tontine-dark-purple mr-1" />
                    <span className="text-sm font-medium">Saved</span>
                  </div>
                  <p className="font-semibold">$3,200</p>
                </div>
              </div>
            </div>
            
            <MemberList 
              title="Recent Members" 
              members={mockMembers} 
            />
          </div>
        </div>
      </main>

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateGroup} 
      />
    </div>
  );
};

export default Index;
