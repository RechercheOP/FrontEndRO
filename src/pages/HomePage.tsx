import { useState, useEffect } from 'react';
import MemberDetailModal from "../components/genealogy/MemberDetails";
import FamilyTree from "../components/genealogy/Genealogygraph";
import FamilySelector from "../components/family/FamilySelector";
import FamilyForm from "../components/family/FamilyForm";
import { useFamily } from "../contexts/FamilyContext";
import SearchBar from "../components/genealogy/SearchBar";

const HomePage = () => {
    // État pour gérer le membre sélectionné
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { members, relations, loadingMembers, selectedFamily } = useFamily();


    // Simuler un temps de chargement pour une meilleure expérience utilisateur
    useEffect(() => {
        if (!loadingMembers) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [loadingMembers]);

    // Fonction pour gérer la sélection d'un membre
    const handleSelectMember = (member: any) => {
        setSelectedMember(member);
    };

    return (
        <div className="relative z-0 flex flex-col" style={{ minHeight: 'calc(100vh - 6rem)' }}>
            {/* Cercles décoratifs en arrière-plan */}
            <div className="fixed -top-40 -left-40 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="fixed bottom-60 right-10 w-80 h-80 bg-gray-200 rounded-full opacity-30 blur-3xl"></div>

            {/* En-tête avec sélecteur de famille et recherche */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <FamilySelector onCreateNewFamily={() => setIsCreateFamilyModalOpen(true)} />

                <div className="flex gap-3">
                    <SearchBar />
                    <button
                        onClick={() => setIsCreateFamilyModalOpen(true)}
                        className="bg-black text-white p-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* État de chargement ou d'absence de famille */}
            {isLoading || loadingMembers ? (
                <div className="flex-grow flex items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
                        <h2 className="text-xl font-medium text-gray-800">Chargement de votre arbre généalogique...</h2>
                        <p className="text-gray-500 mt-2">Cette opération peut prendre quelques instants</p>
                    </div>
                </div>
            ) : !selectedFamily ? (
                <div className="flex-grow flex items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-medium text-gray-800">Aucune famille sélectionnée</h2>
                        <p className="text-gray-500 mt-2 mb-6">Veuillez sélectionner une famille existante ou créer une nouvelle famille pour commencer.</p>
                        <button
                            onClick={() => setIsCreateFamilyModalOpen(true)}
                            className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Créer une famille
                        </button>
                    </div>
                </div>
            ) : members.length === 0 ? (
                <div className="flex-grow flex items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-medium text-gray-800">Arbre généalogique vide</h2>
                        <p className="text-gray-500 mt-2 mb-6">Cette famille ne contient encore aucun membre. Commencez par ajouter le premier membre à votre arbre.</p>
                        <button
                            onClick={() => setIsCreateFamilyModalOpen(true)} // Vous devrez créer un composant AddMemberButton ou utiliser votre modal existante
                            className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Ajouter un membre
                        </button>
                    </div>
                </div>
            ) : (
                /* Conteneur principal avec flex-grow pour occuper l'espace disponible */
                <div className="flex-grow flex flex-col">
                    {/* Visualisation de l'arbre - maintenant responsive */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-hidden backdrop-blur-sm flex-grow">
                        <FamilyTree
                            members={members}
                            relations={relations}
                            onSelectMember={handleSelectMember}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            <MemberDetailModal
                selectedMember={selectedMember}
                onClose={() => setSelectedMember(null)}
            />

            <FamilyForm
                isOpen={isCreateFamilyModalOpen}
                onClose={() => setIsCreateFamilyModalOpen(false)}
            />
        </div>
    );
};

export default HomePage;