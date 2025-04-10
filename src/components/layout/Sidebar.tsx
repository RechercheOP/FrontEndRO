import { useState } from 'react';

const Sidebar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [relationType, setRelationType] = useState('parent');
    const [selectedMember, setSelectedMember] = useState('');

    // Données statiques pour la démo
    const familyStats = {
        totalMembers: 10,
        generations: 3
    };

    return (
        <div className="space-y-6">
            {/* Recherche */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Rechercher</h2>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nom, prénom..."
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-2 px-4 pr-10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Ajout membre */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ajouter un membre</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de relation</label>
                        <select
                            value={relationType}
                            onChange={(e) => setRelationType(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="parent">Parent</option>
                            <option value="spouse">Conjoint</option>
                            <option value="sibling">Frère/Sœur</option>
                            <option value="child">Enfant</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membre existant</label>
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">Sélectionner un membre</option>
                            <option value="1">Jean Dupont</option>
                            <option value="2">Marie Martin</option>
                            <option value="3">Pierre Dupont</option>
                        </select>
                    </div>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Ajouter
                    </button>
                </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Statistiques</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{familyStats.totalMembers}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Membres</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{familyStats.generations}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Générations</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;