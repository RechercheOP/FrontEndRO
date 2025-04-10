import apiClient from './apiClient';

// Définir les types
export enum RelationType {
    PARENT = 'parent',
    SPOUSE = 'spouse',
    SIBLING = 'sibling',
    CHILD = 'child'
}

export interface Relation {
    id: number;
    sourceId: number;
    targetId: number;
    type: RelationType;
    startDate?: string;
    endDate?: string;
}

export interface RelationFormData {
    sourceId: number;
    targetId: number;
    type: RelationType;
    startDate?: string;
    endDate?: string;
}

// Fonctions du service
const relationService = {
    // Récupérer toutes les relations
    getAllRelations: async (): Promise<Relation[]> => {
        const response = await apiClient.get('/relations/');
        return response.data;
    },

    // Récupérer les relations d'un membre
    getMemberRelations: async (memberId: number): Promise<Relation[]> => {
        const response = await apiClient.get(`/members/${memberId}/relations/`);
        return response.data;
    },

    // Créer une nouvelle relation
    createRelation: async (relationData: RelationFormData): Promise<Relation> => {
        const response = await apiClient.post('/relations/', relationData);
        return response.data;
    },

    // Mettre à jour une relation existante
    updateRelation: async (id: number, relationData: Partial<RelationFormData>): Promise<Relation> => {
        const response = await apiClient.patch(`/relations/${id}/`, relationData);
        return response.data;
    },

    // Supprimer une relation
    deleteRelation: async (id: number): Promise<void> => {
        await apiClient.delete(`/relations/${id}/`);
    }
};

export default relationService;