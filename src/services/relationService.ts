import apiClient from './apiClient';

export enum RelationType {
    PARENT = 'parent',
    SPOUSE = 'spouse',
    SIBLING = 'sibling',
    CHILD = 'child'
}

export interface Relation {
    id: number;
    familyId: number;
    sourceId: number;
    targetId: number;
    type: RelationType;
    startDate?: string;
    endDate?: string;
}

export interface RelationFormData {
    familyId: number;
    sourceId: number;
    targetId: number;
    type: RelationType;
    startDate?: string;
    endDate?: string;
}

const relationService = {
    // Récupérer toutes les relations d'une famille
    getFamilyRelations: async (familyId: number): Promise<Relation[]> => {
        return await apiClient.get<Relation[]>(`/relations?familyId=${familyId}`);
    },

    // Récupérer les relations d'un membre
    getMemberRelations: async (memberId: number): Promise<Relation[]> => {
        const sourceRelations = await apiClient.get<Relation[]>(`/relations?sourceId=${memberId}`);
        const targetRelations = await apiClient.get<Relation[]>(`/relations?targetId=${memberId}`);

        return [...sourceRelations, ...targetRelations];
    },

    // Créer une nouvelle relation
    createRelation: async (relationData: RelationFormData): Promise<Relation> => {
        return await apiClient.post<Relation>('/relations', relationData);
    },

    // Créer plusieurs relations à la fois
    createBulkRelations: async (relationsData: RelationFormData[]): Promise<Relation[]> => {
        // Cette fonctionnalité nécessiterait une API personnalisée côté Django
        // Pour JSON Server, nous faisons des appels séquentiels
        const results = [];
        for (const relationData of relationsData) {
            const result = await apiClient.post<Relation>('/relations', relationData);
            results.push(result);
        }
        return results;
    },

    // Mettre à jour une relation existante
    updateRelation: async (id: number, relationData: Partial<RelationFormData>): Promise<Relation> => {
        return await apiClient.patch<Relation>(`/relations/${id}`, relationData);
    },

    // Supprimer une relation
    deleteRelation: async (id: number): Promise<void> => {
        await apiClient.delete(`/relations/${id}`);
    }
};

export default relationService;