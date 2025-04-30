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
       // Dans la méthode loadFamilies de FamilyContext.tsx
       const loadFamilies = async () => {
            setLoadingFamilies(true);
            try {
              const accessibleFamilies = await familyService.getAccessibleFamilies();
              console.log('Families loaded:', accessibleFamilies);
              setFamilies(accessibleFamilies);
              
              if (accessibleFamilies.length > 0) {
                await selectFamily(accessibleFamilies[0].id);
              } else {
                console.log('No families available');
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
            // Changement ici : renamed variable to avoid conflict
            const familyData = await familyService.getFamily(familyId);
            setSelectedFamily(familyData);

            // Changement ici : use familyId instead of family
            const familyMembers = await memberService.getFamilyMembers(familyId);
            setMembers(familyMembers);

            // Changement ici : use familyId instead of family
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
            if (query.trim() === '') return [];
            
            // Utiliser memberService.searchMembers si une API de recherche est disponible
            // return await memberService.searchMembers(selectedFamily.id, query);
            
            // Filtrer localement pour l'instant
            const q = query.toLowerCase().trim();
            return members.filter(member => 
                (member.first_name && member.first_name.toLowerCase().includes(q)) || 
                (member.last_name && member.last_name.toLowerCase().includes(q)) || 
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