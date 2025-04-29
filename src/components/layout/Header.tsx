import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFamily } from '../../contexts/FamilyContext';
import SearchBar from '../genealogy/SearchBar';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarCollapsed: boolean;
    onCreateFamilyClick: () => void;
}

const Header = ({ toggleSidebar, isSidebarCollapsed, onCreateFamilyClick }: HeaderProps) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { selectedFamily } = useFamily();

    return (
        <header className="z-20 h-16 bg-white border-b border-gray-100 sticky top-0 backdrop-blur-lg bg-white/90">
            <div className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {/* Bouton pour rétracter/étendre la sidebar */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isSidebarCollapsed ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        )}
                    </button>

                    {/* Logo et nom de l'application */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">ArborGen</h1>
                            <p className="text-xs text-gray-500">Explorez votre histoire</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Famille sélectionnée */}
                    {selectedFamily && (
                        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">
                            <Link to="/families" className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs">
                                    F
                                </div>
                                <span className="font-medium text-sm">{selectedFamily.name}</span>
                                <span className="text-xs px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 ml-1">
                                    {selectedFamily.isPublic ? 'Public' : 'Privé'}
                                </span>
                            </Link>
                        </div>
                    )}

                    {/* Barre de recherche globale */}
                    <div className="hidden md:block">
                        <SearchBar />
                    </div>

                    {/* Actions rapides */}
                    <div className="flex items-center space-x-1">
                        <motion.button
                            onClick={onCreateFamilyClick}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </motion.button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <Link to="/families" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </Link>
                    </div>

                    {/* Profil utilisateur */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-medium">
                                UD
                            </div>
                        </button>

                        {/* Menu utilisateur */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="font-medium text-gray-800">Utilisateur Demo</div>
                                    <div className="text-sm text-gray-500">utilisateur@example.com</div>
                                </div>
                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon profil</Link>
                                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</Link>
                                <Link to="/families" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Gérer les familles</Link>
                                <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Aide</Link>
                                <hr className="my-1 border-gray-100" />
                                <Link to="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Déconnexion</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;