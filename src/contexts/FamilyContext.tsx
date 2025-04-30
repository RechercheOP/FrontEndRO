import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import familyService, { Family } from '../services/familyService';
import memberService, { Member } from '../services/memberService';
import relationService, { Relation } from '../services/relationService';

interface FamilyContextType {
    families: Family[];
    selectedFamily: Family | null;
    members: Member[];
    relations: Relation[];
    loadingFamilies: boolean;
    loadingMembers: boolean;
    selectFamily: (familyId: number) => Promise<void>;
    refreshFamilyData: () => Promise<void>;
    searchMembers: (query: string) => Promise<Member[]>;
    selectedMemberId: number | null;
    setSelectedMemberId: (id: number | null) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [families, setFamilies] = useState<Family[]>([]);
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [relations, setRelations] = useState<Relation[]>([]);
    const [loadingFamilies, setLoadingFamilies] = useState<boolean>(false);
    const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);


    // Charger les familles au démarrage
    useEffect(() => {
        const loadFamilies = async () => {
            setLoadingFamilies(true);
            try {
                const publicFamilies = await familyService.getPublicFamilies();
                setFamilies(publicFamilies);

                // Si un utilisateur est connecté, ajouter ses familles privées
                const userId = localStorage.getItem('userId');
                if (userId) {
                    const userFamilies = await familyService.getUserFamilies(parseInt(userId));
                    // Filtrer pour éviter les doublons
                    const newFamilies = userFamilies.filter(
                        userFamily => !publicFamilies.some(pubFamily => pubFamily.id === userFamily.id)
                    );
                    setFamilies(prev => [...prev, ...newFamilies]);
                }

                // Sélectionner la première famille par défaut
                if (publicFamilies.length > 0) {
                    await selectFamily(publicFamilies[0].id);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des familles:', error);
            } finally {
                setLoadingFamilies(false);
            }
        };

        loadFamilies();
    }, []);

    // Sélectionner une famille et charger ses membres et relations
    const selectFamily = async (familyId: number) => {
        setLoadingMembers(true);
        try {
            const family = await familyService.getFamily(familyId);
            setSelectedFamily(family);

            const familyMembers = await memberService.getFamilyMembers(familyId);
            setMembers(familyMembers);

            const familyRelations = await relationService.getFamilyRelations(familyId);
            setRelations(familyRelations);
        } catch (error) {
            console.error('Erreur lors du chargement des données de la famille:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    // Rafraîchir les données de la famille sélectionnée
    const refreshFamilyData = async () => {
        if (selectedFamily) {
            await selectFamily(selectedFamily.id);
        }
    };

    // Rechercher des membres dans la famille sélectionnée
    const searchMembers = async (query: string): Promise<Member[]> => {
        if (!selectedFamily) return [];
    
        try {
          // Avec un backend, on ferait un appel à l'API
          // mais pour le dev front, on filtre localement
          const q = query.toLowerCase().trim();
          return members.filter(member => 
            member.firstName.toLowerCase().includes(q) || 
            member.lastName.toLowerCase().includes(q) || 
            (member.occupation && member.occupation.toLowerCase().includes(q))
          );
        } catch (error) {
          console.error('Erreur lors de la recherche de membres:', error);
          return [];
        }
      };

    const value = {
        families,
        selectedFamily,
        members,
        relations,
        loadingFamilies,
        loadingMembers,
        selectFamily,
        refreshFamilyData,
        searchMembers,
        selectedMemberId,
        setSelectedMemberId,
    };

    return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (context === undefined) {
        throw new Error('useFamily must be used within a FamilyProvider');
    }
    return context;
};

export default FamilyContext;