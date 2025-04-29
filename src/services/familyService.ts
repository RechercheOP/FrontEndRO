import apiClient from './apiClient';

export interface Family {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    ownerId: number;
}

export interface FamilyFormData {
    name: string;
    description: string;
    isPublic: boolean;
}

const familyService = {
    // Récupérer toutes les familles publiques
    getPublicFamilies: async (): Promise<Family[]> => {
        return await apiClient.get<Family[]>('/families?isPublic=true');
    },

    // Récupérer les familles de l'utilisateur connecté
    getUserFamilies: async (userId: number): Promise<Family[]> => {
        return await apiClient.get<Family[]>(`/families?ownerId=${userId}`);
    },

    // Récupérer une famille par son ID
    getFamily: async (id: number): Promise<Family> => {
        return await apiClient.get<Family>(`/families/${id}`);
    },

    // Créer une nouvelle famille
    createFamily: async (familyData: FamilyFormData): Promise<Family> => {
        // Ajouter les métadonnées nécessaires
        const newFamily = {
            ...familyData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: 1 // À remplacer par l'ID de l'utilisateur connecté quand l'authentification sera implémentée
        };
        return await apiClient.post<Family>('/families', newFamily);
    },

    // Mettre à jour une famille existante
    updateFamily: async (id: number, familyData: Partial<FamilyFormData>): Promise<Family> => {
        const updatedFamily = {
            ...familyData,
            updatedAt: new Date().toISOString()
        };
        return await apiClient.patch<Family>(`/families/${id}`, updatedFamily);
    },

    // Supprimer une famille
    deleteFamily: async (id: number): Promise<void> => {
        await apiClient.delete(`/families/${id}`);
    }
};

export default familyService;