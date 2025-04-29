import apiClient from './apiClient';

export interface Member {
    id: number;
    familyId: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    deathDate: string | null;
    gender: 'male' | 'female' | 'other';
    occupation: string;
    bio: string;
    photoUrl: string;
}

export interface MemberFormData {
    familyId: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace?: string;
    deathDate?: string;
    gender: 'male' | 'female' | 'other';
    occupation?: string;
    bio?: string;
    photoUrl?: string;
}

const memberService = {
    // Récupérer tous les membres d'une famille
    getFamilyMembers: async (familyId: number): Promise<Member[]> => {
        return await apiClient.get<Member[]>(`/members?familyId=${familyId}`);
    },

    // Récupérer un membre par son ID
    getMember: async (id: number): Promise<Member> => {
        return await apiClient.get<Member>(`/members/${id}`);
    },

    // Créer un nouveau membre
    createMember: async (memberData: MemberFormData): Promise<Member> => {
        return await apiClient.post<Member>('/members', memberData);
    },

    // Mettre à jour un membre existant
    updateMember: async (id: number, memberData: Partial<MemberFormData>): Promise<Member> => {
        return await apiClient.patch<Member>(`/members/${id}`, memberData);
    },

    // Supprimer un membre
    deleteMember: async (id: number): Promise<void> => {
        await apiClient.delete(`/members/${id}`);
    },

    // Rechercher des membres par nom ou prénom
    searchMembers: async (familyId: number, query: string): Promise<Member[]> => {
        return await apiClient.get<Member[]>(`/members?familyId=${familyId}&q=${query}`);
    },

    // Récupérer l'ensemble complet des membres avec leurs relations
    getCompleteFamilyTree: async (familyId: number): Promise<{members: Member[], relations: any[]}> => {
        const members = await apiClient.get<Member[]>(`/members?familyId=${familyId}`);
        const relations = await apiClient.get<any[]>(`/relations?familyId=${familyId}`);

        return {
            members,
            relations
        };
    },

    // Uploader une photo pour un membre
    uploadPhoto: async (file: File): Promise<string> => {
        // Dans un vrai backend, vous auriez un endpoint pour télécharger des fichiers
        // Ici, nous simulons juste un retour d'URL
        // Pour JSON Server, nous ne pouvons pas réellement télécharger des fichiers

        // Simulation d'un délai de téléchargement
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Générer un numéro aléatoire pour simuler différentes images
        const randomNum = Math.floor(Math.random() * 100);
        const gender = Math.random() > 0.5 ? 'men' : 'women';

        return `https://randomuser.me/api/portraits/${gender}/${randomNum}.jpg`;
    }
};

export default memberService;