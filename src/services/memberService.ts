import apiClient from './apiClient';

// Définir les types
export interface Member {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    deathDate: string | null;
    occupation: string;
    bio: string;
    photoUrl: string;
}

export interface MemberFormData {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    deathDate?: string;
    occupation: string;
    bio: string;
    photoUrl: string;
}

// Fonctions du service
const memberService = {
    // Récupérer tous les membres
    getAllMembers: async (): Promise<Member[]> => {
        const response = await apiClient.get('/members/');
        return response.data;
    },

    // Récupérer un membre par son ID
    getMember: async (id: number): Promise<Member> => {
        const response = await apiClient.get(`/members/${id}/`);
        return response.data;
    },

    // Créer un nouveau membre
    createMember: async (memberData: MemberFormData): Promise<Member> => {
        const response = await apiClient.post('/members/', memberData);
        return response.data;
    },

    // Mettre à jour un membre existant
    updateMember: async (id: number, memberData: Partial<MemberFormData>): Promise<Member> => {
        const response = await apiClient.patch(`/members/${id}/`, memberData);
        return response.data;
    },

    // Supprimer un membre
    deleteMember: async (id: number): Promise<void> => {
        await apiClient.delete(`/members/${id}/`);
    },

    // Rechercher des membres par nom
    searchMembers: async (query: string): Promise<Member[]> => {
        const response = await apiClient.get(`/members/search/?q=${query}`);
        return response.data;
    }
};

export default memberService;