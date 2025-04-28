import { supabase } from '@/utils/supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { utils, write } from 'xlsx';

// Types pour l'exportation
export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json'
}

export interface ExportOptions {
  format: ExportFormat;
  fileName?: string;
  includeHeaders?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

/**
 * Exporte les contributions d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param options - Les options d'exportation
 * @returns Le fichier exporté ou une erreur
 */
export const exportUserContributions = async (
  userId: string,
  options: ExportOptions
): Promise<{ success: boolean; data?: Blob | string; error?: any }> => {
  try {
    // Construire la requête de base
    let query = supabase
      .from('contributions')
      .select(`
        id,
        amount,
        payment_date,
        status,
        created_at,
        tontine_groups!inner(name)
      `)
      .eq('user_id', userId);
    
    // Appliquer le filtre de date si spécifié
    if (options.dateRange) {
      query = query
        .gte('payment_date', options.dateRange.startDate)
        .lte('payment_date', options.dateRange.endDate);
    }
    
    // Appliquer les filtres supplémentaires
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformer les données pour l'exportation
    const exportData = data.map(contribution => ({
      ID: contribution.id,
      Groupe: contribution.tontine_groups.name,
      Montant: contribution.amount,
      'Date de paiement': new Date(contribution.payment_date).toLocaleDateString(),
      Statut: contribution.status,
      'Date de création': new Date(contribution.created_at).toLocaleDateString()
    }));
    
    // Générer le fichier selon le format demandé
    return generateExportFile(exportData, options);
  } catch (error) {
    console.error('Error exporting user contributions:', error);
    return { success: false, error };
  }
};

/**
 * Exporte les paiements reçus par un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param options - Les options d'exportation
 * @returns Le fichier exporté ou une erreur
 */
export const exportUserPayouts = async (
  userId: string,
  options: ExportOptions
): Promise<{ success: boolean; data?: Blob | string; error?: any }> => {
  try {
    // Construire la requête de base
    let query = supabase
      .from('payouts')
      .select(`
        id,
        amount,
        payment_date,
        status,
        created_at,
        tontine_groups!inner(name)
      `)
      .eq('user_id', userId);
    
    // Appliquer le filtre de date si spécifié
    if (options.dateRange) {
      query = query
        .gte('payment_date', options.dateRange.startDate)
        .lte('payment_date', options.dateRange.endDate);
    }
    
    // Appliquer les filtres supplémentaires
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformer les données pour l'exportation
    const exportData = data.map(payout => ({
      ID: payout.id,
      Groupe: payout.tontine_groups.name,
      Montant: payout.amount,
      'Date de paiement': new Date(payout.payment_date).toLocaleDateString(),
      Statut: payout.status,
      'Date de création': new Date(payout.created_at).toLocaleDateString()
    }));
    
    // Générer le fichier selon le format demandé
    return generateExportFile(exportData, options);
  } catch (error) {
    console.error('Error exporting user payouts:', error);
    return { success: false, error };
  }
};

/**
 * Exporte les transactions PayPal d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param options - Les options d'exportation
 * @returns Le fichier exporté ou une erreur
 */
export const exportPayPalTransactions = async (
  userId: string,
  options: ExportOptions
): Promise<{ success: boolean; data?: Blob | string; error?: any }> => {
  try {
    // Construire la requête de base
    let query = supabase
      .from('paypal_transactions')
      .select('*')
      .eq('user_id', userId);
    
    // Appliquer le filtre de date si spécifié
    if (options.dateRange) {
      query = query
        .gte('created_at', options.dateRange.startDate)
        .lte('created_at', options.dateRange.endDate);
    }
    
    // Appliquer les filtres supplémentaires
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformer les données pour l'exportation
    const exportData = data.map(transaction => ({
      ID: transaction.id,
      'ID Transaction': transaction.transaction_id,
      'ID Commande': transaction.order_id || 'N/A',
      'ID Abonnement': transaction.subscription_id || 'N/A',
      Montant: `${transaction.amount} ${transaction.currency}`,
      Type: transaction.type,
      Statut: transaction.status,
      Description: transaction.description || 'N/A',
      'Date de création': new Date(transaction.created_at).toLocaleDateString()
    }));
    
    // Générer le fichier selon le format demandé
    return generateExportFile(exportData, options);
  } catch (error) {
    console.error('Error exporting PayPal transactions:', error);
    return { success: false, error };
  }
};

/**
 * Exporte les données d'un groupe
 * 
 * @param groupId - L'ID du groupe
 * @param options - Les options d'exportation
 * @returns Le fichier exporté ou une erreur
 */
export const exportGroupData = async (
  groupId: number,
  options: ExportOptions
): Promise<{ success: boolean; data?: Blob | string; error?: any }> => {
  try {
    // Récupérer les informations du groupe
    const { data: group, error: groupError } = await supabase
      .from('tontine_groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;
    
    // Récupérer les membres du groupe
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        id,
        user_id,
        role,
        status,
        joined_at,
        profiles!inner(full_name, email)
      `)
      .eq('group_id', groupId);
    
    if (membersError) throw membersError;
    
    // Récupérer les contributions du groupe
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select(`
        id,
        user_id,
        amount,
        payment_date,
        status,
        profiles!inner(full_name)
      `)
      .eq('group_id', groupId);
    
    if (contributionsError) throw contributionsError;
    
    // Récupérer les paiements du groupe
    const { data: payouts, error: payoutsError } = await supabase
      .from('payouts')
      .select(`
        id,
        user_id,
        amount,
        payment_date,
        status,
        profiles!inner(full_name)
      `)
      .eq('group_id', groupId);
    
    if (payoutsError) throw payoutsError;
    
    // Préparer les données pour l'exportation
    const groupData = {
      info: {
        ID: group.id,
        Nom: group.name,
        'Montant de contribution': group.contribution_amount,
        Fréquence: group.frequency,
        'Date de début': new Date(group.start_date).toLocaleDateString(),
        'Méthode de paiement': group.payout_method,
        'Créé par': group.created_by,
        'Date de création': new Date(group.created_at).toLocaleDateString()
      },
      members: members.map(member => ({
        ID: member.id,
        Nom: member.profiles.full_name,
        Email: member.profiles.email,
        Rôle: member.role,
        Statut: member.status,
        'Date d\'adhésion': new Date(member.joined_at).toLocaleDateString()
      })),
      contributions: contributions.map(contribution => ({
        ID: contribution.id,
        Membre: contribution.profiles.full_name,
        Montant: contribution.amount,
        'Date de paiement': new Date(contribution.payment_date).toLocaleDateString(),
        Statut: contribution.status
      })),
      payouts: payouts.map(payout => ({
        ID: payout.id,
        Bénéficiaire: payout.profiles.full_name,
        Montant: payout.amount,
        'Date de paiement': new Date(payout.payment_date).toLocaleDateString(),
        Statut: payout.status
      }))
    };
    
    // Générer le fichier selon le format demandé
    if (options.format === ExportFormat.PDF) {
      return generateGroupPDF(groupData, options);
    } else {
      // Pour les autres formats, on exporte chaque section séparément
      const fileName = options.fileName || `groupe_${groupId}`;
      
      // Exporter les informations du groupe
      const infoResult = await generateExportFile([groupData.info], {
        ...options,
        fileName: `${fileName}_info`
      });
      
      // Exporter les membres
      const membersResult = await generateExportFile(groupData.members, {
        ...options,
        fileName: `${fileName}_membres`
      });
      
      // Exporter les contributions
      const contributionsResult = await generateExportFile(groupData.contributions, {
        ...options,
        fileName: `${fileName}_contributions`
      });
      
      // Exporter les paiements
      const payoutsResult = await generateExportFile(groupData.payouts, {
        ...options,
        fileName: `${fileName}_paiements`
      });
      
      // Vérifier si toutes les exportations ont réussi
      const success = infoResult.success && membersResult.success && 
                      contributionsResult.success && payoutsResult.success;
      
      return { 
        success,
        data: success ? 'Exportation réussie en plusieurs fichiers' : undefined,
        error: success ? undefined : 'Erreur lors de l\'exportation de certaines sections'
      };
    }
  } catch (error) {
    console.error('Error exporting group data:', error);
    return { success: false, error };
  }
};

/**
 * Génère un fichier d'exportation selon le format demandé
 * 
 * @param data - Les données à exporter
 * @param options - Les options d'exportation
 * @returns Le fichier généré ou une erreur
 */
const generateExportFile = (
  data: any[],
  options: ExportOptions
): { success: boolean; data?: Blob | string; error?: any } => {
  try {
    const fileName = options.fileName || 'export';
    
    switch (options.format) {
      case ExportFormat.PDF:
        return generatePDF(data, fileName, options.includeHeaders !== false);
      
      case ExportFormat.CSV:
        return generateCSV(data, fileName, options.includeHeaders !== false);
      
      case ExportFormat.EXCEL:
        return generateExcel(data, fileName, options.includeHeaders !== false);
      
      case ExportFormat.JSON:
        return generateJSON(data, fileName);
      
      default:
        throw new Error(`Format d'exportation non pris en charge: ${options.format}`);
    }
  } catch (error) {
    console.error('Error generating export file:', error);
    return { success: false, error };
  }
};

/**
 * Génère un fichier PDF
 * 
 * @param data - Les données à exporter
 * @param fileName - Le nom du fichier
 * @param includeHeaders - Inclure les en-têtes
 * @returns Le fichier PDF généré
 */
const generatePDF = (
  data: any[],
  fileName: string,
  includeHeaders: boolean
): { success: boolean; data?: Blob; error?: any } => {
  try {
    if (data.length === 0) {
      return { success: false, error: 'Aucune donnée à exporter' };
    }
    
    const doc = new jsPDF();
    
    // Ajouter un titre
    doc.setFontSize(18);
    doc.text(fileName, 14, 22);
    
    // Ajouter la date d'exportation
    doc.setFontSize(11);
    doc.text(`Exporté le ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Préparer les données pour le tableau
    const headers = includeHeaders ? Object.keys(data[0]) : [];
    const rows = data.map(item => Object.values(item));
    
    // Ajouter le tableau
    (doc as any).autoTable({
      startY: 40,
      head: includeHeaders ? [headers] : undefined,
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Générer le fichier
    const blob = doc.output('blob');
    
    // Télécharger le fichier
    downloadFile(blob, `${fileName}.pdf`, 'application/pdf');
    
    return { success: true, data: blob };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error };
  }
};

/**
 * Génère un fichier CSV
 * 
 * @param data - Les données à exporter
 * @param fileName - Le nom du fichier
 * @param includeHeaders - Inclure les en-têtes
 * @returns Le fichier CSV généré
 */
const generateCSV = (
  data: any[],
  fileName: string,
  includeHeaders: boolean
): { success: boolean; data?: Blob; error?: any } => {
  try {
    if (data.length === 0) {
      return { success: false, error: 'Aucune donnée à exporter' };
    }
    
    // Préparer les en-têtes
    const headers = Object.keys(data[0]);
    
    // Préparer les lignes
    const rows = data.map(item => Object.values(item).map(value => {
      // Échapper les virgules et les guillemets
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
      }
      return value;
    }));
    
    // Construire le contenu CSV
    let csvContent = '';
    
    if (includeHeaders) {
      csvContent += headers.join(',') + '\n';
    }
    
    csvContent += rows.map(row => row.join(',')).join('\n');
    
    // Générer le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Télécharger le fichier
    downloadFile(blob, `${fileName}.csv`, 'text/csv');
    
    return { success: true, data: blob };
  } catch (error) {
    console.error('Error generating CSV:', error);
    return { success: false, error };
  }
};

/**
 * Génère un fichier Excel
 * 
 * @param data - Les données à exporter
 * @param fileName - Le nom du fichier
 * @param includeHeaders - Inclure les en-têtes
 * @returns Le fichier Excel généré
 */
const generateExcel = (
  data: any[],
  fileName: string,
  includeHeaders: boolean
): { success: boolean; data?: Blob; error?: any } => {
  try {
    if (data.length === 0) {
      return { success: false, error: 'Aucune donnée à exporter' };
    }
    
    // Créer un classeur
    const wb = utils.book_new();
    
    // Créer une feuille de calcul
    const ws = utils.json_to_sheet(data, {
      header: includeHeaders ? Object.keys(data[0]) : undefined
    });
    
    // Ajouter la feuille au classeur
    utils.book_append_sheet(wb, ws, 'Données');
    
    // Générer le fichier
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Télécharger le fichier
    downloadFile(blob, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    return { success: true, data: blob };
  } catch (error) {
    console.error('Error generating Excel:', error);
    return { success: false, error };
  }
};

/**
 * Génère un fichier JSON
 * 
 * @param data - Les données à exporter
 * @param fileName - Le nom du fichier
 * @returns Le fichier JSON généré
 */
const generateJSON = (
  data: any[],
  fileName: string
): { success: boolean; data?: Blob; error?: any } => {
  try {
    if (data.length === 0) {
      return { success: false, error: 'Aucune donnée à exporter' };
    }
    
    // Générer le contenu JSON
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Générer le fichier
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    // Télécharger le fichier
    downloadFile(blob, `${fileName}.json`, 'application/json');
    
    return { success: true, data: blob };
  } catch (error) {
    console.error('Error generating JSON:', error);
    return { success: false, error };
  }
};

/**
 * Génère un fichier PDF pour les données d'un groupe
 * 
 * @param groupData - Les données du groupe
 * @param options - Les options d'exportation
 * @returns Le fichier PDF généré
 */
const generateGroupPDF = (
  groupData: any,
  options: ExportOptions
): { success: boolean; data?: Blob; error?: any } => {
  try {
    const fileName = options.fileName || 'groupe';
    const doc = new jsPDF();
    
    // Ajouter un titre
    doc.setFontSize(20);
    doc.text(`Groupe: ${groupData.info.Nom}`, 14, 22);
    
    // Ajouter la date d'exportation
    doc.setFontSize(11);
    doc.text(`Exporté le ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Ajouter les informations du groupe
    doc.setFontSize(16);
    doc.text('Informations du groupe', 14, 45);
    
    let y = 55;
    Object.entries(groupData.info).forEach(([key, value]) => {
      doc.setFontSize(11);
      doc.text(`${key}: ${value}`, 14, y);
      y += 7;
    });
    
    // Ajouter les membres
    y += 10;
    doc.setFontSize(16);
    doc.text('Membres', 14, y);
    y += 10;
    
    (doc as any).autoTable({
      startY: y,
      head: [Object.keys(groupData.members[0])],
      body: groupData.members.map(member => Object.values(member)),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Ajouter les contributions
    y = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Contributions', 14, y);
    y += 10;
    
    (doc as any).autoTable({
      startY: y,
      head: [Object.keys(groupData.contributions[0])],
      body: groupData.contributions.map(contribution => Object.values(contribution)),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Ajouter les paiements
    y = (doc as any).lastAutoTable.finalY + 15;
    
    // Si on dépasse la page, ajouter une nouvelle page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Paiements', 14, y);
    y += 10;
    
    (doc as any).autoTable({
      startY: y,
      head: [Object.keys(groupData.payouts[0])],
      body: groupData.payouts.map(payout => Object.values(payout)),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Générer le fichier
    const blob = doc.output('blob');
    
    // Télécharger le fichier
    downloadFile(blob, `${fileName}.pdf`, 'application/pdf');
    
    return { success: true, data: blob };
  } catch (error) {
    console.error('Error generating group PDF:', error);
    return { success: false, error };
  }
};

/**
 * Télécharge un fichier
 * 
 * @param blob - Le contenu du fichier
 * @param fileName - Le nom du fichier
 * @param mimeType - Le type MIME du fichier
 */
const downloadFile = (blob: Blob, fileName: string, mimeType: string): void => {
  // Créer un lien de téléchargement
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.setAttribute('download', fileName);
  link.setAttribute('type', mimeType);
  
  // Ajouter le lien au document
  document.body.appendChild(link);
  
  // Cliquer sur le lien
  link.click();
  
  // Nettoyer
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};
