import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Group } from '@/types/group';
import { useToast } from '@/hooks/use-toast';

interface ExportDataProps {
  groups: Group[];
  className?: string;
}

export default function ExportData({ groups, className = '' }: ExportDataProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { t, formatAmount } = useApp();
  const { toast } = useToast();
  
  // Fonction pour exporter en PDF
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      // Simuler un délai pour l'exportation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dans une application réelle, vous utiliseriez une bibliothèque comme jsPDF
      // pour générer un PDF avec les données des groupes
      
      toast({
        title: t('exportSuccess'),
        description: t('pdfExportSuccess'),
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'exportation PDF:', error);
      toast({
        title: t('exportError'),
        description: t('pdfExportError'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Fonction pour exporter en Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Simuler un délai pour l'exportation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dans une application réelle, vous utiliseriez une bibliothèque comme xlsx
      // pour générer un fichier Excel avec les données des groupes
      
      // Exemple de structure de données pour Excel
      const data = groups.map(group => ({
        'Nom du groupe': group.name,
        'Membres': group.members,
        'Contribution': formatAmount(group.contribution),
        'Fréquence': group.frequency,
        'Prochaine échéance': group.nextDue,
        'Statut': group.status,
        'Progression': `${group.progress}%`,
        'Tags': group.tags?.join(', ') || ''
      }));
      
      console.log('Données pour Excel:', data);
      
      toast({
        title: t('exportSuccess'),
        description: t('excelExportSuccess'),
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'exportation Excel:', error);
      toast({
        title: t('exportError'),
        description: t('excelExportError'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t('exportData')}
        title={t('exportData')}
      >
        <Download size={20} className="text-gray-700 dark:text-gray-300" />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1.5">
                {t('exportData')}
              </h3>
              
              <div className="mt-1 space-y-1">
                <button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {isExporting ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <FileText size={16} className="mr-2 text-red-500" />
                  )}
                  {t('exportToPDF')}
                </button>
                
                <button
                  onClick={exportToExcel}
                  disabled={isExporting}
                  className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {isExporting ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet size={16} className="mr-2 text-green-500" />
                  )}
                  {t('exportToExcel')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
