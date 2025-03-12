
import { Helmet } from "@react-helmet-async";
import { useApp } from "@/contexts/AppContext";
import ProfileEnhanced from "@/components/ProfileEnhanced";
import Navbar from "@/components/Navbar";

export default function Profile() {
  const { t } = useApp();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('profile')} | Tontine</title>
      </Helmet>
      
      <Navbar />
      <ProfileEnhanced />
    </div>
  );
}
