import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddMemberForm from "../genealogy/AddMemberForm";
import { useFamily } from '../../contexts/FamilyContext';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    onCreateFamilyClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, onCreateFamilyClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { selectedFamily, members } = useFamily();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
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
    };

    // Variante pour l'animation de la sidebar
    const sidebarVariants = {
        open: { width: 320, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        collapsed: { width: 80, transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    const contentVariants = {
        open: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } },
        collapsed: { opacity: 0, x: -20, transition: { duration: 0.1 } }
    };

    const iconVariants = {
        open: { opacity: 0, scale: 0.5, transition: { duration: 0.1 } },
        collapsed: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.2 } }
    };

    // Statistiques familiales
    const familyStats = {
        totalMembers: members.length,
        generations: selectedFamily ? 4 : 0,
        lastUpdate: selectedFamily ? new Date(selectedFamily.updated_at).toLocaleDateString() : "-"
    };

    return (
        <>
            <motion.div
                className={`fixed top-16 left-0 bottom-0 rounded-r-xl z-20 flex ml-1.5`}
                initial={false}
                animate={isCollapsed ? "collapsed" : "open"}
                variants={sidebarVariants}
                style={{ height: 'calc(100vh - 64px)' }}
            >
                {/* Conteneur réel du panneau avec padding et styles */}
                <div className="h-full w-full bg-black text-gray-100 flex flex-col p-4 pt-6 shadow-lg overflow-hidden">
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
                            className="flex flex-col items-center space-y-6 mt-10"
                            variants={iconVariants}
                            initial="open"
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
                            {/* Icône Famille */}
                            <Link to="/app/families" className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Gérer les familles">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </Link>
                            {/* Icône Statistiques */}
                            <Link to="/app/statistics" className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Statistiques">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </Link>
                        </motion.div>
                    ) : (
                        // --- VUE COMPLÈTE ---
                        <motion.div
                            className="flex flex-col h-full overflow-hidden"
                            variants={contentVariants}
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                        >
                            <div className="flex flex-col h-full overflow-y-auto pr-1 custom-scrollbar">
                                {/* Section Titre/Logo */}
                                <div className="mb-6 flex items-center justify-between">
                                    <h1 className="text-xl font-bold text-white">
                                        {selectedFamily ? selectedFamily.name : "Aucune famille sélectionnée"}
                                    </h1>
                                </div>

                                {/* Section Famille */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Famille</h2>
                                        <Link
                                            to="/app/families"
                                            className="text-xs text-gray-400 hover:text-white transition-colors"
                                        >
                                            Voir toutes
                                        </Link>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        {selectedFamily ? (
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-white mr-3">
                                                            {selectedFamily.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-white">{selectedFamily.name}</h3>
                                                            <p className="text-xs text-gray-400">
                                                                {selectedFamily.description && selectedFamily.description.length > 30
                                                                    ? `${selectedFamily.description.substring(0, 30)}...`
                                                                    : selectedFamily.description || "Aucune description"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                                                            {selectedFamily.isPublic ? 'Public' : 'Privé'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                                <p className="text-gray-400 text-sm mb-3">Aucune famille sélectionnée</p>
                                                <Link
                                                    to="/app/families"
                                                    className="inline-flex items-center justify-center w-full bg-white text-black py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    Choisir une famille
                                                </Link>
                                                <button
                                                    onClick={onCreateFamilyClick}
                                                    className="inline-flex items-center justify-center w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium mt-2 hover:bg-gray-600 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Créer une famille
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>



                                {/* Section Actions */}
                                <div className="space-y-2 mb-6">
                                    <button
                                        onClick={handleOpenAddModal}
                                        className="w-full flex items-center justify-center bg-white text-black py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        disabled={!selectedFamily}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Ajouter un membre
                                    </button>

                                    <Link
                                        to="/app/families"
                                        className="w-full flex items-center justify-center bg-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        Gérer les familles
                                    </Link>

                                    <Link
                                        to="/app/statistics"
                                        className="w-full flex items-center justify-center bg-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Voir les statistiques
                                    </Link>
                                </div>

                                {/* Liste des membres récents */}
                                {selectedFamily && members.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Membres récents</h2>
                                        </div>
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {members.slice(0, 5).map(member => (
                                                <motion.div
                                                    key={member.id}
                                                    className="bg-gray-800/50 rounded-lg p-2 flex items-center cursor-pointer hover:bg-gray-700/60 transition-colors"
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3">
                                                        {member.photo ? (
                                                            <img
                                                                src={member.photo}
                                                                alt={`${member.first_name} ${member.last_name}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-white text-sm">{member.first_name} {member.last_name}</h3>
                                                        <p className="text-xs text-gray-400">
                                                            {member.birth_date ? new Date(member.birth_date).getFullYear() : ''}
                                                            {member.occupation ? ` • ${member.occupation}` : ''}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section Statistiques */}
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
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Rendu de la Modal pour ajouter un membre */}
            <AddMemberForm
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={() => {
                    handleCloseAddModal();
                    // Si besoin de rafraîchir les données après l'ajout
                }}
            />
        </>
    );
};

export default Sidebar;