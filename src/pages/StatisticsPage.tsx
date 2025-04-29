import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FamilyStatistics from '../components/statistics/FamilyStatistics';
import { useFamily } from '../contexts/FamilyContext';

const StatisticsPage: React.FC = () => {
    const { selectedFamily } = useFamily();
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

    return (
        <div className="relative z-0 flex flex-col" style={{ minHeight: 'calc(100vh - 6rem)' }}>
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>
                <p className="text-gray-600">
                    Visualisez des informations détaillées sur votre arbre généalogique
                </p>
            </div>

            {/* Onglets */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition-colors`}
                    >
                        Vue d'ensemble
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'details'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition-colors`}
                    >
                        Détails
                    </button>
                </nav>
            </div>

            {/* Contenu */}
            <div className="flex-grow">
                {!selectedFamily ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-medium text-gray-800">Aucune famille sélectionnée</h2>
                        <p className="text-gray-500 mt-2">Veuillez sélectionner une famille pour visualiser ses statistiques.</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && <FamilyStatistics />}
                        {activeTab === 'details' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-lg shadow-sm p-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques détaillées</h2>
                                <p className="text-gray-600">
                                    Cette section contiendra des statistiques plus détaillées à l'avenir.
                                </p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StatisticsPage;