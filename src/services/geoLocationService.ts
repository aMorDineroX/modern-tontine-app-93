import { supabase } from '@/utils/supabase';

// Types pour la géolocalisation
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface NearbyGroup {
  id: number;
  name: string;
  distance: number; // en kilomètres
  memberCount: number;
  location: Location;
}

export interface NearbyMember {
  id: string;
  name: string;
  distance: number; // en kilomètres
  location: Location;
  groupIds: number[];
}

export interface MeetingLocation {
  id: number;
  name: string;
  location: Location;
  type: 'restaurant' | 'cafe' | 'office' | 'other';
  rating?: number;
  website?: string;
  phoneNumber?: string;
}

/**
 * Récupère la position actuelle de l'utilisateur
 * 
 * @returns La position actuelle
 */
export const getCurrentPosition = (): Promise<{ success: boolean; data?: Location; error?: any }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'La géolocalisation n\'est pas prise en charge par votre navigateur'
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        resolve({ success: true, data: location });
      },
      (error) => {
        let errorMessage = 'Erreur inconnue';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'L\'utilisateur a refusé la demande de géolocalisation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Les informations de localisation ne sont pas disponibles';
            break;
          case error.TIMEOUT:
            errorMessage = 'La demande de localisation a expiré';
            break;
        }
        
        resolve({ success: false, error: errorMessage });
      }
    );
  });
};

/**
 * Enregistre la position d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param location - La position de l'utilisateur
 * @returns Succès ou échec
 */
export const saveUserLocation = async (
  userId: string,
  location: Location
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('user_locations')
      .upsert({
        user_id: userId,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        country: location.country,
        postal_code: location.postalCode,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving user location:', error);
    return { success: false, error };
  }
};

/**
 * Récupère la position d'un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns La position de l'utilisateur
 */
export const getUserLocation = async (
  userId: string
): Promise<{ success: boolean; data?: Location; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_locations')
      .select('latitude, longitude, address, city, country, postal_code')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return { success: false, error: 'Aucune position trouvée pour cet utilisateur' };
    }
    
    const location: Location = {
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      city: data.city,
      country: data.country,
      postalCode: data.postal_code
    };
    
    return { success: true, data: location };
  } catch (error) {
    console.error('Error fetching user location:', error);
    return { success: false, error };
  }
};

/**
 * Enregistre la position d'un groupe
 * 
 * @param groupId - L'ID du groupe
 * @param location - La position du groupe
 * @returns Succès ou échec
 */
export const saveGroupLocation = async (
  groupId: number,
  location: Location
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('group_locations')
      .upsert({
        group_id: groupId,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        country: location.country,
        postal_code: location.postalCode,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving group location:', error);
    return { success: false, error };
  }
};

/**
 * Récupère la position d'un groupe
 * 
 * @param groupId - L'ID du groupe
 * @returns La position du groupe
 */
export const getGroupLocation = async (
  groupId: number
): Promise<{ success: boolean; data?: Location; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('group_locations')
      .select('latitude, longitude, address, city, country, postal_code')
      .eq('group_id', groupId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return { success: false, error: 'Aucune position trouvée pour ce groupe' };
    }
    
    const location: Location = {
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      city: data.city,
      country: data.country,
      postalCode: data.postal_code
    };
    
    return { success: true, data: location };
  } catch (error) {
    console.error('Error fetching group location:', error);
    return { success: false, error };
  }
};

/**
 * Recherche des groupes à proximité
 * 
 * @param location - La position de référence
 * @param radius - Le rayon de recherche en kilomètres
 * @param limit - Le nombre maximum de résultats
 * @returns Les groupes à proximité
 */
export const findNearbyGroups = async (
  location: Location,
  radius: number = 10,
  limit: number = 10
): Promise<{ success: boolean; data?: NearbyGroup[]; error?: any }> => {
  try {
    // Récupérer tous les groupes avec leur position
    const { data: groups, error } = await supabase
      .from('group_locations')
      .select(`
        group_id,
        latitude,
        longitude,
        address,
        city,
        country,
        postal_code,
        tontine_groups!inner(name)
      `);
    
    if (error) throw error;
    
    // Calculer la distance pour chaque groupe
    const nearbyGroups: NearbyGroup[] = [];
    
    for (const group of groups) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        group.latitude,
        group.longitude
      );
      
      if (distance <= radius) {
        // Récupérer le nombre de membres du groupe
        const { count: memberCount, error: countError } = await supabase
          .from('group_members')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', group.group_id)
          .eq('status', 'active');
        
        if (countError) throw countError;
        
        nearbyGroups.push({
          id: group.group_id,
          name: group.tontine_groups.name,
          distance,
          memberCount: memberCount || 0,
          location: {
            latitude: group.latitude,
            longitude: group.longitude,
            address: group.address,
            city: group.city,
            country: group.country,
            postalCode: group.postal_code
          }
        });
      }
    }
    
    // Trier par distance et limiter le nombre de résultats
    const sortedGroups = nearbyGroups
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return { success: true, data: sortedGroups };
  } catch (error) {
    console.error('Error finding nearby groups:', error);
    return { success: false, error };
  }
};

/**
 * Recherche des membres à proximité
 * 
 * @param location - La position de référence
 * @param groupId - L'ID du groupe (optionnel)
 * @param radius - Le rayon de recherche en kilomètres
 * @param limit - Le nombre maximum de résultats
 * @returns Les membres à proximité
 */
export const findNearbyMembers = async (
  location: Location,
  groupId?: number,
  radius: number = 10,
  limit: number = 10
): Promise<{ success: boolean; data?: NearbyMember[]; error?: any }> => {
  try {
    // Construire la requête de base
    let query = supabase
      .from('user_locations')
      .select(`
        user_id,
        latitude,
        longitude,
        address,
        city,
        country,
        postal_code,
        profiles!inner(full_name)
      `);
    
    // Si un groupId est spécifié, filtrer par membres du groupe
    if (groupId) {
      query = query.in(
        'user_id',
        supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupId)
          .eq('status', 'active')
      );
    }
    
    const { data: users, error } = await query;
    
    if (error) throw error;
    
    // Calculer la distance pour chaque utilisateur
    const nearbyMembers: NearbyMember[] = [];
    
    for (const user of users) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        user.latitude,
        user.longitude
      );
      
      if (distance <= radius) {
        // Récupérer les groupes de l'utilisateur
        const { data: userGroups, error: groupsError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.user_id)
          .eq('status', 'active');
        
        if (groupsError) throw groupsError;
        
        nearbyMembers.push({
          id: user.user_id,
          name: user.profiles.full_name,
          distance,
          location: {
            latitude: user.latitude,
            longitude: user.longitude,
            address: user.address,
            city: user.city,
            country: user.country,
            postalCode: user.postal_code
          },
          groupIds: userGroups.map(g => g.group_id)
        });
      }
    }
    
    // Trier par distance et limiter le nombre de résultats
    const sortedMembers = nearbyMembers
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return { success: true, data: sortedMembers };
  } catch (error) {
    console.error('Error finding nearby members:', error);
    return { success: false, error };
  }
};

/**
 * Recherche des lieux de rencontre à proximité
 * 
 * @param location - La position de référence
 * @param type - Le type de lieu
 * @param radius - Le rayon de recherche en kilomètres
 * @param limit - Le nombre maximum de résultats
 * @returns Les lieux de rencontre à proximité
 */
export const findNearbyMeetingLocations = async (
  location: Location,
  type?: 'restaurant' | 'cafe' | 'office' | 'other',
  radius: number = 2,
  limit: number = 10
): Promise<{ success: boolean; data?: MeetingLocation[]; error?: any }> => {
  try {
    // Construire la requête de base
    let query = supabase
      .from('meeting_locations')
      .select('id, name, latitude, longitude, address, city, country, postal_code, type, rating, website, phone_number');
    
    // Si un type est spécifié, filtrer par type
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data: locations, error } = await query;
    
    if (error) throw error;
    
    // Calculer la distance pour chaque lieu
    const nearbyLocations: MeetingLocation[] = [];
    
    for (const loc of locations) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        loc.latitude,
        loc.longitude
      );
      
      if (distance <= radius) {
        nearbyLocations.push({
          id: loc.id,
          name: loc.name,
          location: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            address: loc.address,
            city: loc.city,
            country: loc.country,
            postalCode: loc.postal_code
          },
          type: loc.type,
          rating: loc.rating,
          website: loc.website,
          phoneNumber: loc.phone_number
        });
      }
    }
    
    // Trier par distance et limiter le nombre de résultats
    const sortedLocations = nearbyLocations
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return { success: true, data: sortedLocations };
  } catch (error) {
    console.error('Error finding nearby meeting locations:', error);
    return { success: false, error };
  }
};

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine)
 * 
 * @param lat1 - Latitude du premier point
 * @param lon1 - Longitude du premier point
 * @param lat2 - Latitude du deuxième point
 * @param lon2 - Longitude du deuxième point
 * @returns La distance en kilomètres
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
};

/**
 * Convertit des degrés en radians
 * 
 * @param degrees - Angle en degrés
 * @returns Angle en radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Convertit une adresse en coordonnées géographiques (géocodage)
 * 
 * @param address - L'adresse à géocoder
 * @returns Les coordonnées géographiques
 */
export const geocodeAddress = async (
  address: string
): Promise<{ success: boolean; data?: Location; error?: any }> => {
  try {
    // Utiliser l'API Google Maps pour le géocodage
    const apiKey = 'VOTRE_CLE_API_GOOGLE_MAPS'; // Remplacer par votre clé API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Erreur de géocodage: ${data.status}`);
    }
    
    const result = data.results[0];
    const location: Location = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      address: result.formatted_address
    };
    
    // Extraire les composants de l'adresse
    for (const component of result.address_components) {
      if (component.types.includes('locality')) {
        location.city = component.long_name;
      } else if (component.types.includes('country')) {
        location.country = component.long_name;
      } else if (component.types.includes('postal_code')) {
        location.postalCode = component.long_name;
      }
    }
    
    return { success: true, data: location };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return { success: false, error };
  }
};
