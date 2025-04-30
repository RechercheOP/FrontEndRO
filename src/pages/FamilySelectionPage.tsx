import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useFamily } from '../contexts/FamilyContext';
import FamilyForm from '../components/family/FamilyForm';

const FamilySelectionPage: React.FC = () => {
    const { families, loadingFamilies, selectFamily } = useFamily();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Filtrage des familles selon la recherche
    const filteredFamilies = searchTerm
        ? families.filter(
            family =>
                family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                family.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : families;

    const handleFamilySelect = async (family: number) => {
        await selectFamily(family);
        navigate('/app');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
            {/* En-tête */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold">ArborGen</h1>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link to="/app" className="text-gray-600 hover:text-black transition-colors">
                            Retour à l'application
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-10 flex-grow">
                <div className="max-w-4xl mx-auto">
                    {/* Titre et description */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-3">Sélectionnez une famille</h1>
                        <p className="text-gray-600 max-w-lg mx-auto">
                            Choisissez une famille existante pour explorer son arbre généalogique ou créez une nouvelle famille.
                        </p>
                    </div>

                    {/* Barre de recherche et bouton de création */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher une famille..."
                                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
                            />
                            <div className="absolute left-3 top-3 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <motion.button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center shadow-sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Créer une famille
                        </motion.button>
                    </div>

                    {/* Liste des familles */}
                    {loadingFamilies ? (
                        <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
                            <h2 className="text-xl font-medium text-gray-800">Chargement des familles...</h2>
                        </div>
                    ) : filteredFamilies.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
                            {searchTerm ? (
                                <>
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-medium text-gray-800">Aucun résultat pour "{searchTerm}"</h2>
                                    <p className="text-gray-500 mt-2 mb-6">Essayez avec un autre terme de recherche ou créez une nouvelle famille.</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-medium text-gray-800">Aucune famille disponible</h2>
                                    <p className="text-gray-500 mt-2 mb-6">Commencez par créer votre première famille pour explorer votre histoire familiale.</p>
                                </>
                            )}
                            <motion.button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Créer une famille
                            </motion.button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredFamilies.map((family) => (
                                <motion.div
                                    key={family.id}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    onClick={() => handleFamilySelect(family.id)}
                                >
                                    <div className="h-40 bg-gray-100 relative">
                                        {/* Remplacez par une vraie image si vous en avez */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-20"></div>
                                        <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-xs font-medium px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full">
                        {family.isPublic ? 'Public' : 'Privé'}
                      </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2">{family.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {family.description || 'Aucune description disponible.'}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                                            <div className="text-xs text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Mis à jour le {new Date(family.updated_at || family.created_at).toLocaleDateString()}
                                            </div>
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de création de famille */}
            <FamilyForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default FamilySelectionPage;