import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import familyService, { FamilyFormData } from '../../services/familyService';
import { useFamily } from '../../contexts/FamilyContext';

interface FamilyFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialFormData: FamilyFormData = {
    name: '',
    description: '',
    isPublic: true
};

const FamilyForm: React.FC<FamilyFormProps> = ({ isOpen, onClose }) => {
    const { refreshFamilyData } = useFamily();
    const [formData, setFormData] = useState<FamilyFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!formData.name.trim()) {
            setError('Le nom de la famille est requis');
            setIsSubmitting(false);
            return;
        }

        try {
            await familyService.createFamily(formData);
            await refreshFamilyData();
            onClose();
            // Réinitialiser le formulaire
            setFormData(initialFormData);
        } catch (err) {
            console.error('Erreur lors de la création de la famille:', err);
            setError('Une erreur est survenue lors de la création de la famille. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        variants={backdropVariants}
                        onClick={onClose} // Ferme en cliquant sur le fond
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden mx-4"
                        variants={modalVariants}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Créer une nouvelle famille</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                aria-label="Fermer la modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body - Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom de la famille *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                        placeholder="Ex: Famille Dupont"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none"
                                        placeholder="Quelques mots sur votre famille..."
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-black focus:ring-0 focus:ring-offset-0 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                                        Rendre cette famille visible publiquement
                                    </label>
                                </div>
                            </div>

                            {/* Footer - Actions */}
                            <div className="flex justify-end items-center p-5 border-t border-gray-100 bg-gray-50">
                                <motion.button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors mr-3"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Création...
                                        </div>
                                    ) : (
                                        "Créer la famille"
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FamilyForm;