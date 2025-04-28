import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

// Types pour les documents
export enum DocumentType {
  CONTRACT = 'contract',
  RECEIPT = 'receipt',
  AGREEMENT = 'agreement',
  IDENTITY = 'identity',
  OTHER = 'other'
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  group_id?: number;
  metadata?: any;
}

/**
 * Télécharge un document vers le stockage Supabase
 * 
 * @param file - Le fichier à télécharger
 * @param path - Le chemin de stockage
 * @returns L'URL du fichier téléchargé
 */
export const uploadFile = async (
  file: File,
  path: string
): Promise<{ success: boolean; data?: { path: string; url: string }; error?: any }> => {
  try {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    // Télécharger le fichier
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Récupérer l'URL publique du fichier
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    return {
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl
      }
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error };
  }
};

/**
 * Crée un nouveau document
 * 
 * @param document - Les données du document sans id, created_at et updated_at
 * @returns Le document créé
 */
export const createDocument = async (
  document: Omit<Document, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Document; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating document:', error);
    return { success: false, error };
  }
};

/**
 * Récupère un document par son ID
 * 
 * @param documentId - L'ID du document
 * @returns Le document
 */
export const getDocumentById = async (
  documentId: string
): Promise<{ success: boolean; data?: Document; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching document:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les documents d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param type - Le type de document (optionnel)
 * @returns Les documents de l'utilisateur
 */
export const getUserDocuments = async (
  userId: string,
  type?: DocumentType
): Promise<{ success: boolean; data?: Document[]; error?: any }> => {
  try {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return { success: false, error };
  }
};

/**
 * Récupère les documents d'un groupe
 * 
 * @param groupId - L'ID du groupe
 * @param type - Le type de document (optionnel)
 * @returns Les documents du groupe
 */
export const getGroupDocuments = async (
  groupId: number,
  type?: DocumentType
): Promise<{ success: boolean; data?: Document[]; error?: any }> => {
  try {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('group_id', groupId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching group documents:', error);
    return { success: false, error };
  }
};

/**
 * Met à jour un document
 * 
 * @param documentId - L'ID du document
 * @param updates - Les mises à jour à appliquer
 * @returns Le document mis à jour
 */
export const updateDocument = async (
  documentId: string,
  updates: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; data?: Document; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating document:', error);
    return { success: false, error };
  }
};

/**
 * Supprime un document
 * 
 * @param documentId - L'ID du document
 * @returns Succès ou échec
 */
export const deleteDocument = async (
  documentId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Récupérer le document pour obtenir le chemin du fichier
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Supprimer le fichier du stockage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);
    
    if (storageError) throw storageError;
    
    // Supprimer l'entrée de la base de données
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error };
  }
};

/**
 * Partage un document avec un utilisateur
 * 
 * @param documentId - L'ID du document
 * @param userId - L'ID de l'utilisateur avec qui partager
 * @param permission - Le niveau de permission
 * @returns Succès ou échec
 */
export const shareDocumentWithUser = async (
  documentId: string,
  userId: string,
  permission: 'read' | 'edit'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        user_id: userId,
        permission,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error sharing document:', error);
    return { success: false, error };
  }
};

/**
 * Révoque le partage d'un document avec un utilisateur
 * 
 * @param documentId - L'ID du document
 * @param userId - L'ID de l'utilisateur
 * @returns Succès ou échec
 */
export const revokeDocumentShare = async (
  documentId: string,
  userId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('document_shares')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error revoking document share:', error);
    return { success: false, error };
  }
};

/**
 * Génère un contrat de tontine
 * 
 * @param groupId - L'ID du groupe
 * @param userId - L'ID de l'utilisateur
 * @returns Le document généré
 */
export const generateTontineContract = async (
  groupId: number,
  userId: string
): Promise<{ success: boolean; data?: Document; error?: any }> => {
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
        user_id,
        role,
        profiles!inner(full_name, email)
      `)
      .eq('group_id', groupId)
      .eq('status', 'active');
    
    if (membersError) throw membersError;
    
    // Générer le contenu du contrat (exemple simplifié)
    const contractContent = `
      CONTRAT DE TONTINE
      
      Groupe: ${group.name}
      Date de création: ${new Date(group.created_at).toLocaleDateString()}
      Montant de contribution: ${group.contribution_amount}
      Fréquence: ${group.frequency}
      Date de début: ${new Date(group.start_date).toLocaleDateString()}
      Méthode de paiement: ${group.payout_method}
      
      MEMBRES:
      ${members.map(m => `- ${m.profiles.full_name} (${m.profiles.email}) - ${m.role}`).join('\n')}
      
      CONDITIONS:
      1. Chaque membre s'engage à contribuer ${group.contribution_amount} selon la fréquence ${group.frequency}.
      2. Les paiements seront effectués selon la méthode ${group.payout_method}.
      3. Tout retard de paiement pourra entraîner des pénalités.
      4. Le groupe peut décider d'exclure un membre en cas de non-respect des règles.
      
      Date: ${new Date().toLocaleDateString()}
    `;
    
    // Créer un fichier Blob pour le contrat
    const contractBlob = new Blob([contractContent], { type: 'text/plain' });
    const contractFile = new File([contractBlob], `contrat_${group.name}.txt`, { type: 'text/plain' });
    
    // Télécharger le fichier
    const uploadResult = await uploadFile(contractFile, `contracts/${groupId}`);
    
    if (!uploadResult.success) {
      throw uploadResult.error;
    }
    
    // Créer le document
    const document: Omit<Document, 'id' | 'created_at' | 'updated_at'> = {
      name: `Contrat - ${group.name}`,
      type: DocumentType.CONTRACT,
      file_path: uploadResult.data!.path,
      file_size: contractFile.size,
      file_type: contractFile.type,
      user_id: userId,
      group_id: groupId,
      metadata: {
        group_name: group.name,
        member_count: members.length,
        generated_at: new Date().toISOString()
      }
    };
    
    const createResult = await createDocument(document);
    
    if (!createResult.success) {
      throw createResult.error;
    }
    
    return { success: true, data: createResult.data };
  } catch (error) {
    console.error('Error generating tontine contract:', error);
    return { success: false, error };
  }
};

/**
 * Génère un reçu de paiement
 * 
 * @param contributionId - L'ID de la contribution
 * @param userId - L'ID de l'utilisateur
 * @returns Le document généré
 */
export const generatePaymentReceipt = async (
  contributionId: number,
  userId: string
): Promise<{ success: boolean; data?: Document; error?: any }> => {
  try {
    // Récupérer les informations de la contribution
    const { data: contribution, error: contributionError } = await supabase
      .from('contributions')
      .select(`
        id,
        amount,
        payment_date,
        status,
        group_id,
        user_id,
        tontine_groups!inner(name),
        profiles!inner(full_name, email)
      `)
      .eq('id', contributionId)
      .single();
    
    if (contributionError) throw contributionError;
    
    // Vérifier que l'utilisateur est autorisé à générer ce reçu
    if (contribution.user_id !== userId) {
      return {
        success: false,
        error: 'Vous n\'êtes pas autorisé à générer ce reçu'
      };
    }
    
    // Générer le contenu du reçu (exemple simplifié)
    const receiptContent = `
      REÇU DE PAIEMENT
      
      Numéro de reçu: REC-${contribution.id}-${Date.now().toString().substring(8)}
      Date: ${new Date().toLocaleDateString()}
      
      Groupe: ${contribution.tontine_groups.name}
      Membre: ${contribution.profiles.full_name}
      Email: ${contribution.profiles.email}
      
      Montant: ${contribution.amount}
      Date de paiement: ${new Date(contribution.payment_date).toLocaleDateString()}
      Statut: ${contribution.status}
      
      Ce reçu confirme le paiement de votre contribution au groupe de tontine.
      
      Naat - La plateforme moderne de tontine
    `;
    
    // Créer un fichier Blob pour le reçu
    const receiptBlob = new Blob([receiptContent], { type: 'text/plain' });
    const receiptFile = new File([receiptBlob], `recu_${contribution.id}.txt`, { type: 'text/plain' });
    
    // Télécharger le fichier
    const uploadResult = await uploadFile(receiptFile, `receipts/${userId}`);
    
    if (!uploadResult.success) {
      throw uploadResult.error;
    }
    
    // Créer le document
    const document: Omit<Document, 'id' | 'created_at' | 'updated_at'> = {
      name: `Reçu - ${contribution.tontine_groups.name} - ${new Date(contribution.payment_date).toLocaleDateString()}`,
      type: DocumentType.RECEIPT,
      file_path: uploadResult.data!.path,
      file_size: receiptFile.size,
      file_type: receiptFile.type,
      user_id: userId,
      group_id: contribution.group_id,
      metadata: {
        contribution_id: contribution.id,
        amount: contribution.amount,
        payment_date: contribution.payment_date,
        status: contribution.status,
        generated_at: new Date().toISOString()
      }
    };
    
    const createResult = await createDocument(document);
    
    if (!createResult.success) {
      throw createResult.error;
    }
    
    return { success: true, data: createResult.data };
  } catch (error) {
    console.error('Error generating payment receipt:', error);
    return { success: false, error };
  }
};
