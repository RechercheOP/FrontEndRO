// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AddMemberModal from "../genealogy/AddMemberForm.tsx";

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void; // Fonction pour changer l'état collapsed (vient du parent)
    // On pourrait passer les membres existants ici pour la modal
    existingMembers?: { id: number | string; name: string }[];
}

// Données statiques pour la démo (tu les remplaceras par des données réelles)
const familyStats = {
    totalMembers: 12, // Mise à jour
    generations: 4,   // Mise à jour
    lastUpdate: "12 mai 2025"
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, existingMembers = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Ici tu implémenteras la logique de recherche (filtrer l'arbre, etc.)
        console.log("Searching for:", e.target.value);
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleAddMemberSubmit = (formData: any) => {
        console.log('Simulating adding member from Sidebar:', formData);
        // Logique d'ajout réelle à implémenter ici (appel API via service)
        // Pourrait nécessiter de rafraîchir les données de l'arbre généalogique
    };

    // Variante pour l'animation de la sidebar
    const sidebarVariants = {
        open: { width: 320, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        collapsed: { width: 80, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    const contentVariants = {
        open: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } },
        collapsed: { opacity: 0, x: -20, transition: { duration: 0.1 } }
    };

    const iconVariants = {
        open: { opacity: 0, scale: 0.5, transition: { duration: 0.1 } },
        collapsed: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.2 } }
    };


    return (
        <>
            <motion.div
                className={`fixed top-30 left-0  rounded-xl z-0 flex ml-1.5`} // Utilisation de flex pour le positionnement interne
                initial={false}
                animate={isCollapsed ? "collapsed" : "open"}
                variants={sidebarVariants}
            >
                {/* Conteneur réel du panneau avec padding et styles */}
                <div className="h-full rounded-xl w-full bg-black text-gray-100 flex flex-col p-4 pt-6 shadow-lg"> {/* Ajuste le padding si besoin */}

                    {/* Bouton pour réduire/agrandir */}
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 right-0 translate-x-1/2 p-2 bg-gray-800 text-gray-300 hover:bg-black hover:text-white rounded-full shadow-md z-50 transition-all"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <motion.svg
                            xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </motion.svg>
                    </button>


                    {/* Contenu conditionnel (complètement différent si replié) */}
                    {isCollapsed ? (
                        // --- VUE RÉDUITE ---
                        <motion.div
                            className="flex flex-col items-center space-y-6 mt-10" // Ajout de marge sup
                            variants={iconVariants}
                            initial="open" // Start as if it was open to transition correctly
                            animate="collapsed"
                            exit="open"
                        >
                            {/* Icône Recherche */}
                            <button className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Rechercher">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            {/* Icône Ajouter Membre */}
                            <button onClick={handleOpenAddModal} className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors" title="Ajouter un membre">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            {/* Icône Statistiques (optionnel) */}
                            <button className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Statistiques">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </button>
                        </motion.div>
                    ) : (
                        // --- VUE COMPLÈTE ---
                        <motion.div
                            className="flex flex-col h-full overflow-hidden" // Empêche le débordement pendant l'anim
                            variants={contentVariants}
                            initial="collapsed" // Start as if it was collapsed
                            animate="open"
                            exit="collapsed"
                        >
                            {/* Section Titre/Logo (Optionnel) */}
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="text-xl font-bold text-white">Mon Arbre</h1>
                                {/* <img src="/logo.svg" alt="Logo" className="h-8"/> */}
                            </div>

                            {/* Section Recherche */}
                            <div className="mb-6 relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Rechercher un membre..."
                                    className="w-full bg-gray-200 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                                />
                            </div>

                            {/* Section Ajout de membre */}
                            <div className="mb-6">
                                <motion.button
                                    onClick={handleOpenAddModal}
                                    className="w-full flex items-center justify-center bg-white text-black py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Ajouter un membre
                                </motion.button>
                            </div>

                            {/* Section Statistiques (redesign sombre) */}
                            <div className="mt-auto pt-6 border-t border-gray-700"> {/* Poussé vers le bas */}
                                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Aperçu</h2>
                                <div className="space-y-3">
                                    {/* Stat Item 1 */}
                                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="p-1.5 bg-gray-700 rounded-md mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-300">Membres</span>
                                        </div>
                                        <span className="text-sm font-semibold text-white">{familyStats.totalMembers}</span>
                                    </div>
                                    {/* Stat Item 2 */}
                                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="p-1.5 bg-gray-700 rounded-md mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-300">Générations</span>
                                        </div>
                                        <span className="text-sm font-semibold text-white">{familyStats.generations}</span>
                                    </div>
                                    {/* Stat Item 3 */}
                                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="p-1.5 bg-gray-700 rounded-md mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-300">Mis à jour</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-400">{familyStats.lastUpdate}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Rendu de la Modal */}
            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onSubmit={handleAddMemberSubmit}
                existingMembers={existingMembers} // Passer les membres existants ici
            />
        </>
    );
};

export default Sidebar;