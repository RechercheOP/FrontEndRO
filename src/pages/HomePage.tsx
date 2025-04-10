import { useState } from 'react';

const HomePage = () => {
    // État pour gérer le membre sélectionné
    const [selectedMember, setSelectedMember] = useState<any>(null);

    // Simulons que nous avons sélectionné un membre pour la démo
    const handleSelectMember = () => {
        setSelectedMember({
            id: 5,
            name: "Thomas Dupont",
            birthDate: "1980-11-05",
            birthPlace: "Lyon, France",
            deathDate: "",
            occupation: "Avocat",
            bio: "Spécialisé en droit des affaires. Marié avec deux enfants.",
            photoUrl: "https://randomuser.me/api/portraits/men/3.jpg",
            relations: [
                { type: 'Conjoint', name: 'Julie Bernard' },
                { type: 'Enfant', name: 'Lucas Dupont' },
                { type: 'Enfant', name: 'Emma Dupont' },
                { type: 'Père', name: 'Pierre Dupont' },
                { type: 'Mère', name: 'Sophie Lambert' }
            ]
        });
    };

    return (
        <div className="space-y-6">
            {/* Visualisation de l'arbre - placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 relative min-h-[500px] flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Arbre Généalogique</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Cet espace contiendra la visualisation interactive de votre arbre généalogique
                    </p>
                </div>

                {/* Placeholder pour l'arbre généalogique */}
                <div className="w-full max-w-2xl h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center">
                    <div className="text-center p-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">
                            L'arbre généalogique sera affiché ici avec vis.js
                        </p>
                        <button
                            onClick={handleSelectMember}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                        >
                            Simuler la sélection d'un membre
                        </button>
                    </div>
                </div>
            </div>

            {/* Détails du membre sélectionné */}
            {selectedMember && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex justify-between items-start p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMember.name}</h2>
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                    <img
                                        src={selectedMember.photoUrl}
                                        alt={selectedMember.name}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Date de naissance</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedMember.birthDate || 'Inconnue'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Lieu de naissance</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedMember.birthPlace || 'Inconnu'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Date de décès</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedMember.deathDate || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Profession</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedMember.occupation || 'Inconnue'}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Biographie</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedMember.bio || 'Aucune information biographique disponible.'}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Relations</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMember.relations.map((relation: any, index: number) => (
                                            <div
                                                key={index}
                                                className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                                            >
                                                <span className="text-indigo-600 dark:text-indigo-400 mr-1">{relation.type}:</span>
                                                <span className="text-gray-900 dark:text-white">{relation.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;