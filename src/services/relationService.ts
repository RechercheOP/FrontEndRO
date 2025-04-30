import apiClient from './apiClient';

export enum RelationType {
    PARENT = 'parent',
    SPOUSE = 'spouse'
}

export interface Relation {
    id: number | string;
    family: number;
    source: number;
    target: number;
    type: RelationType;
    start_date?: string;
    end_date?: string;
    notes?: string;
    source_name?: string; // Retourné par l'API, pas envoyé
    target_name?: string; // Retourné par l'API, pas envoyé
}

export interface RelationFormData {
    family: number;
    source: number;
    target: number;
    type: RelationType;
    start_date?: string;
    end_date?: string;
    notes?: string;
}

const relationService = {
    // Récupérer toutes les relations d'une famille
    getFamilyRelations: async (family: number): Promise<Relation[]> => {
        const rels=await apiClient.get<Relation[]>(`/api/relations/?family=${family}`);
        console.log("relations pour la famille "+family+" : ",rels)
        return rels;

    },

    // Récupérer une relation par son ID
    getRelation: async (id: number): Promise<Relation> => {
        return await apiClient.get<Relation>(`/api/relations/${id}/`);
    },

    // Créer une nouvelle relation
    createRelation: async (relationData: RelationFormData): Promise<Relation> => {
        return await apiClient.post<Relation>('/api/relations/', relationData);
    },

    // Créer plusieurs relations en une seule opération
    createBulkRelations: async (relationsData: RelationFormData[]): Promise<Relation[]> => {
        // Faisons des appels séquentiels, car l'API ne supporte pas la création en masse
        const results = [];
        for (const relationData of relationsData) {
            const result = await apiClient.post<Relation>('/api/relations/', relationData);
            results.push(result);
        }
        return results;
    },

    // Mettre à jour une relation existante
    updateRelation: async (id: number, relationData: Partial<RelationFormData>): Promise<Relation> => {
        return await apiClient.patch<Relation>(`/api/relations/${id}/`, relationData);
    },

    // Supprimer une relation
    deleteRelation: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/relations/${id}/`);
    },

    // Obtenir toutes les relations d'un membre
    getMemberRelations: async (memberId: number): Promise<Relation[]> => {
        return await apiClient.get<Relation[]>(`/api/relations/by_member/?member_id=${memberId}`);
    }
};

export default relationService;