import { useState } from 'react';

interface SidebarProps {
    isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        relationType: 'parent',
        relatedMember: ''
    });

    // Données statiques pour la démo
    const familyStats = {
        totalMembers: 10,
        generations: 3,
        oldestMember: "Jean Dupont (1932)",
        lastUpdate: "10 avril 2025"
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddNewMember = () => {
        // Logique pour ajouter un membre
        console.log("Adding new member:", formData);
        setIsAddingMember(false);
    };

    if (isCollapsed) {
        return (
            <div className="h-full py-4 flex flex-col items-center">
                <div className="flex flex-col space-y-6 items-center">
                    <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Section recherche */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un membre..."
                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none  focus:border-transparent transition-all text-sm"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Section ajout de membre */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-semibold text-gray-800">Ajouter un membre</h2>
                    <button
                        onClick={() => setIsAddingMember(!isAddingMember)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAddingMember ? 'bg-gray-200 text-gray-600' : 'bg-black text-white'} transition-colors`}
                    >
                        {isAddingMember ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                    </button>
                </div>

                {isAddingMember ? (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="Prénom"
                                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none  focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Nom"
                                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none  focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date de naissance</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-gray-800 text-sm focus:outline-none  focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type de relation</label>
                            <select
                                name="relationType"
                                value={formData.relationType}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-gray-800 text-sm focus:outline-none  focus:border-transparent"
                            >
                                <option value="parent">Parent</option>
                                <option value="spouse">Conjoint</option>
                                <option value="sibling">Frère/Sœur</option>
                                <option value="child">Enfant</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Membre existant lié</label>
                            <select
                                name="relatedMember"
                                value={formData.relatedMember}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-gray-800 text-sm focus:outline-none  focus:border-transparent"
                            >
                                <option value="">Sélectionner un membre</option>
                                <option value="1">Jean Dupont</option>
                                <option value="2">Marie Martin</option>
                                <option value="3">Pierre Dupont</option>
                            </select>
                        </div>
                        <button
                            onClick={handleAddNewMember}
                            className="w-full bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all mt-2"
                        >
                            Ajouter le membre
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-xs">
                            Cliquez sur le bouton + pour ajouter un nouveau membre à votre arbre généalogique
                        </p>
                    </div>
                )}
            </div>

            {/* Section statistiques */}
            <div className="p-4">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Statistiques familiales</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <span className="ml-3 text-sm text-gray-700">Membres</span>
                        </div>
                        <span className="text-base font-semibold text-gray-900">{familyStats.totalMembers}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="ml-3 text-sm text-gray-700">Générations</span>
                        </div>
                        <span className="text-base font-semibold text-gray-900">{familyStats.generations}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="ml-3 text-sm text-gray-700">Dernière mise à jour</span>
                        </div>
                        <span className="text-xs font-medium text-gray-900">{familyStats.lastUpdate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;