import {ReactNode, useState} from 'react';
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
        <div className="min-h-screen bg-white text-gray-900">
            <Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />

            <div className="flex">
                {/* Sidebar rétractable */}
                <div
                    className={`transition-all duration-300 ease-in-out ${
                        isSidebarCollapsed ? 'w-16' : 'w-72'
                    } bg-gray-50 border-r border-gray-100 shadow-lg`}
                >
                    <Sidebar isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Contenu principal */}
                <div className="flex-1 transition-all duration-300">
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>

            {/* Cercles décoratifs en arrière-plan avec effet de flou */}
            <div className="fixed -top-32 -left-32 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-gray-200 rounded-full opacity-30 blur-3xl"></div>
        </div>
    );
};

export default MainLayout;