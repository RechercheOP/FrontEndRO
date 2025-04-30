import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamily } from '../../contexts/FamilyContext';
import { Family } from '../../services/familyService';

interface FamilySelectorProps {
    onCreateNewFamily: () => void;
}

const FamilySelector: React.FC<FamilySelectorProps> = ({ onCreateNewFamily }) => {
    const { families, selectedFamily, selectFamily, loadingFamilies } = useFamily();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSelectFamily = async (family: Family) => {
        await selectFamily(family.id);
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-left shadow-sm hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
            <span className="font-medium">
              {loadingFamilies ? 'Chargement...' : selectedFamily?.name || 'Sélectionnez une famille'}
            </span>
                        <span className="text-xs text-gray-500">
              {selectedFamily ? `Dernière mise à jour : ${new Date(selectedFamily.updated_at).toLocaleDateString()}` : 'Aucune famille sélectionnée'}
            </span>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                    >
                        <div className="max-h-80 overflow-y-auto py-2">
                            {loadingFamilies ? (
                                <div className="px-4 py-3 flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-gray-500">Chargement des familles...</span>
                                </div>
                            ) : families.length > 0 ? (
                                families.map((family) => (
                                    <motion.button
                                        key={family.id}
                                        whileHover={{ backgroundColor: '#f9fafb' }}
                                        onClick={() => handleSelectFamily(family)}
                                        className={`w-full px-4 py-3 flex items-center text-left transition-colors ${selectedFamily?.id === family.id ? 'bg-gray-100' : ''}`}
                                    >
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{family.name}</span>
                                            <span className="text-xs text-gray-500">{family.description}</span>
                                        </div>
                                        {family.isPublic && (
                                            <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">Public</span>
                                        )}
                                    </motion.button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500">Aucune famille disponible</div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 px-4 py-3">
                            <button
                                onClick={() => {
                                    onCreateNewFamily();
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-center bg-black text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Créer une nouvelle famille
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FamilySelector;