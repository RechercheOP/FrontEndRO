import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { useFamily } from '../../contexts/FamilyContext';
import FamilyForm from '../family/FamilyForm';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    // État pour gérer la sidebar rétractable
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
    const { selectedFamily } = useFamily();
    const location = useLocation();

    // Effet pour vérifier si un nouvel utilisateur arrive et n'a pas de famille sélectionnée
    useEffect(() => {
        if (!selectedFamily && location.pathname === '/app') {
            // Vous pourriez rediriger vers la page de sélection de famille
            // ou afficher une invite pour créer une famille
        }
    }, [selectedFamily, location.pathname]);

    // Fonction pour basculer l'état de la sidebar
    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header fixe en haut */}
            <Header
                toggleSidebar={toggleSidebar}
                isSidebarCollapsed={isSidebarCollapsed}
                onCreateFamilyClick={() => setIsCreateFamilyModalOpen(true)}
            />

            {/* Cercles décoratifs en arrière-plan avec effet de flou */}
            <div className="fixed -top-32 -left-32 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-gray-200 rounded-full opacity-30 blur-3xl"></div>

            {/* Container principal qui prend en compte la hauteur du header */}
            <div className="flex flex-1 overflow-hidden">
                {/* La Sidebar est intégrée ici mais gère son propre positionnement */}
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    onCreateFamilyClick={() => setIsCreateFamilyModalOpen(true)}
                />

                {/* Contenu principal avec marge dynamique basée sur l'état de la sidebar */}
                <main
                    className={`flex-1 transition-all duration-300 ease-in-out overflow-auto ${
                        isSidebarCollapsed ? 'ml-20' : 'ml-80'
                    }`}
                >
                    <div className="p-7">
                        {!selectedFamily && (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-amber-100 rounded-full p-2 mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-amber-800">Aucune famille sélectionnée</h3>
                                            <p className="text-sm text-amber-700">Veuillez sélectionner ou créer une famille pour continuer</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            to="/families"
                                            className="px-4 py-2 bg-white text-amber-700 border border-amber-300 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                                        >
                                            Sélectionner
                                        </Link>
                                        <button
                                            onClick={() => setIsCreateFamilyModalOpen(true)}
                                            className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors"
                                        >
                                            Créer une famille
                                        </button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                        {children}
                    </div>
                </main>
            </div>

            {/* Modal de création de famille */}
            <FamilyForm
                isOpen={isCreateFamilyModalOpen}
                onClose={() => setIsCreateFamilyModalOpen(false)}
            />
        </div>
    );
};

export default MainLayout;