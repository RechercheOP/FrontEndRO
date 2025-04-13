import React, { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    // État pour gérer la sidebar rétractable
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Fonction pour basculer l'état de la sidebar
    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex flex-col h-fit bg-white text-gray-900 relative overflow-hidden">
            {/* Header fixe en haut */}
            <Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />

            {/* Cercles décoratifs en arrière-plan avec effet de flou */}
            <div className="fixed -top-32 -left-32 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-gray-200 rounded-full opacity-30 blur-3xl"></div>

            {/* Container principal qui prend en compte la hauteur du header */}
            <div className="flex flex-1 pt-2"> {/* pt-16 correspond à la hauteur du header */}
                {/* La Sidebar est intégrée ici mais gère son propre positionnement */}
                <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

                {/* Contenu principal avec marge dynamique basée sur l'état de la sidebar */}
                <main
                    className={`flex-1 transition-all duration-300 ease-in-out ${
                        isSidebarCollapsed ? 'ml-20' : 'ml-80'
                    }`}
                >
                    <div className="px-7 mb-1">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;