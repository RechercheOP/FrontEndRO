// services/memberService.ts - Recodé intégralement
import apiClient from './apiClient';

export interface Member {
  id: number | string;
  family: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  death_date: string | null;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  bio: string;
  photo: string | null;
  photo_url: string | null;
  full_name?: string;
  age?: number;
}

export interface MemberFormData {
  family: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place?: string;
  death_date?: string;
  gender: 'male' | 'female' | 'other';
  occupation?: string;
  bio?: string;
  photo?: File | string | null;
}

const memberService = {
  /**
   * Récupérer tous les membres d'une famille
   */
  getFamilyMembers: async (family: number): Promise<Member[]> => {
    return await apiClient.get<Member[]>(`/api/members/?family=${family}`);
  },

  /**
   * Récupérer un membre par son ID
   */
  getMember: async (id: number): Promise<Member> => {
    return await apiClient.get<Member>(`/api/members/${id}/`);
  },

  /**
   * Créer un nouveau membre
   */
  createMember: async (memberData: MemberFormData): Promise<Member> => {
    let photoFile: File | null = null;
    
    // Extraire le fichier photo si présent
    if (memberData.photo instanceof File) {
      photoFile = memberData.photo;
    }
    
    // Créer une copie sans photo
    const { photo, ...dataWithoutPhoto } = memberData;
    
    // Créer d'abord le membre sans photo
    const createdMember = await apiClient.post<Member>('/api/members/', dataWithoutPhoto);
    
    // Si nous avons un fichier photo, l'uploader séparément
    if (photoFile) {
      try {
        await memberService.uploadPhoto(Number(createdMember.id), photoFile);
        // Récupérer le membre à jour avec la photo
        return await memberService.getMember(Number(createdMember.id));
      } catch (error) {
        console.error('Erreur lors de l\'upload de la photo pour le nouveau membre:', error);
        // Retourner le membre même sans photo
        return createdMember;
      }
    }
    
    return createdMember;
  },

  /**
   * Mettre à jour un membre existant
   * Séparation complète entre données textuelles et photo
   */
  updateMember: async (id: number, memberData: Partial<MemberFormData>): Promise<Member> => {
    // Ne jamais inclure photo dans la mise à jour JSON
    const { photo, ...dataWithoutPhoto } = memberData;
    
    // Journaliser pour le débogage
    console.log(`Mise à jour du membre ${id} avec:`, dataWithoutPhoto);
    
    // Effectuer la mise à jour
    return await apiClient.patch<Member>(`/api/members/${id}/`, dataWithoutPhoto);
  },

  /**
   * Télécharger une photo pour un membre
   * Utilise l'endpoint dédié uploadPhoto
   */
  uploadPhoto: async (memberId: number, photoFile: File): Promise<Member> => {
    if (!photoFile) {
      throw new Error('Aucun fichier fourni pour l\'upload');
    }
    
    console.log(`Téléchargement de photo pour le membre ${memberId}`);
    
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    // Utiliser l'endpoint spécifique pour l'upload de photo
    return await apiClient.post<Member>(
      `/api/members/${memberId}/upload_photo/`,
      formData
    );
  },

  /**
   * Supprimer un membre
   */
  deleteMember: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/members/${id}/`);
  },

  /**
   * Rechercher des membres dans une famille
   */
  searchMembers: async (family: number, query: string): Promise<Member[]> => {
    return await apiClient.get<Member[]>(
      `/api/members/?family=${family}&search=${encodeURIComponent(query)}`
    );
  },

  /**
   * Obtenir les relations familiales d'un membre
   */
  getMemberFamilyRelations: async (memberId: number): Promise<any> => {
    return await apiClient.get<any>(`/api/members/${memberId}/family_relations/`);
  }
};

export default memberService;