import apiClient from './apiClient';

export interface Family {
    id: number;
    name: string;
    description: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    member_count?: number;
}

export interface FamilyFormData {
    name: string;
    description: string;
    is_public: boolean;
}

const familyService = {
    // Récupérer toutes les familles accessibles (publiques ou créées par l'utilisateur)
    getAccessibleFamilies: async (): Promise<Family[]> => {
        return await apiClient.get<Family[]>('/api/families/');
    },

    // Récupérer une famille par son ID
    getFamily: async (id: number): Promise<Family> => {
        return await apiClient.get<Family>(`/api/families/${id}/`);
    },

    // Créer une nouvelle famille
    createFamily: async (familyData: FamilyFormData): Promise<Family> => {
        return await apiClient.post<Family>('/api/families/', familyData);
    },

    // Mettre à jour une famille existante
    updateFamily: async (id: number, familyData: Partial<FamilyFormData>): Promise<Family> => {
        return await apiClient.patch<Family>(`/api/families/${id}/`, familyData);
    },

    // Supprimer une famille
    deleteFamily: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/families/${id}/`);
    },

    // Obtenir toutes les données d'une famille (membres et relations)
    getFamilyFullData: async (id: number): Promise<any> => {
        return await apiClient.get<any>(`/api/families/${id}/full_data/`);
    }
};

export default familyService;