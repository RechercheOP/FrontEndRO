// src/components/genealogy/AddMemberModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import placeholderUser from '../../assets/img-user.png'; // Assure-toi d'avoir cette image

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: any) => void; // Simule la soumission pour l'instant
    existingMembers?: { id: number | string; name: string }[]; // Pour les listes déroulantes de relations
}

// Interface pour les données du formulaire
interface MemberFormData {
    firstName: string;
    lastName: string;
    birthDate: string;
    deathDate: string;
    birthPlace: string;
    occupation: string;
    bio: string;
    photo: File | null;
    gender: 'male' | 'female' | 'other' | ''; // Ajout du genre
    // Pour lier le nouveau membre à des membres existants
    fatherId: string;
    motherId: string;
    spouseId: string;
}

const initialFormData: MemberFormData = {
    firstName: '',
    lastName: '',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    occupation: '',
    bio: '',
    photo: null,
    gender: '',
    fatherId: '',
    motherId: '',
    spouseId: '',
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSubmit, existingMembers = [] }) => {
    const [formData, setFormData] = useState<MemberFormData>(initialFormData);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setImagePreview(null);
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({ ...prev, photo: null }));
            setImagePreview(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting new member data:', formData);
        // Ici, tu appellerais ton service pour envoyer les données au backend
        // Pour l'instant, on simule avec le callback onSubmit
        onSubmit(formData);
        onClose(); // Ferme la modal après soumission
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
                        className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden mx-4"
                        variants={modalVariants}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Ajouter un nouveau membre</h2>
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
                            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Image Upload Section */}
                                    <div className="md:col-span-1 flex flex-col items-center space-y-3">
                                        <div
                                            className="w-32 h-32 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
                                            onClick={triggerFileInput}
                                            title="Cliquer pour choisir une photo"
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={placeholderUser} alt="Placeholder" className="w-16 h-16 text-gray-400" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            name="photo"
                                        />
                                        <button
                                            type="button"
                                            onClick={triggerFileInput}
                                            className="text-sm text-gray-600 hover:text-black transition-colors"
                                        >
                                            Choisir une photo
                                        </button>
                                    </div>

                                    {/* Basic Info Fields */}
                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Prénom */}
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input
                                                type="text" id="firstName" name="firstName" required
                                                value={formData.firstName} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                placeholder="Ex: Jean"
                                            />
                                        </div>
                                        {/* Nom */}
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input
                                                type="text" id="lastName" name="lastName" required
                                                value={formData.lastName} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                placeholder="Ex: Dupont"
                                            />
                                        </div>
                                        {/* Genre */}
                                        <div>
                                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                                            <select
                                                id="gender" name="gender" required
                                                value={formData.gender} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            >
                                                <option value="" disabled>Sélectionner...</option>
                                                <option value="male">Homme</option>
                                                <option value="female">Femme</option>
                                                <option value="other">Autre</option>
                                            </select>
                                        </div>
                                        {/* Date de Naissance */}
                                        <div>
                                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                                            <input
                                                type="date" id="birthDate" name="birthDate"
                                                value={formData.birthDate} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            />
                                        </div>
                                        {/* Date de Décès */}
                                        <div>
                                            <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-1">Date de décès (optionnel)</label>
                                            <input
                                                type="date" id="deathDate" name="deathDate"
                                                value={formData.deathDate} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            />
                                        </div>
                                        {/* Lieu de Naissance */}
                                        <div>
                                            <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                                            <input
                                                type="text" id="birthPlace" name="birthPlace"
                                                value={formData.birthPlace} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                placeholder="Ex: Paris, France"
                                            />
                                        </div>
                                        {/* Profession */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                                            <input
                                                type="text" id="occupation" name="occupation"
                                                value={formData.occupation} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                placeholder="Ex: Ingénieur"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Biographie */}
                                <div className="mt-6">
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Biographie (optionnel)</label>
                                    <textarea
                                        id="bio" name="bio" rows={3}
                                        value={formData.bio} onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none"
                                        placeholder="Quelques mots sur la vie de cette personne..."
                                    />
                                </div>

                                {/* Relations */}
                                <div className="mt-6 border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Liens familiaux</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Père */}
                                        <div>
                                            <label htmlFor="fatherId" className="block text-sm font-medium text-gray-700 mb-1">Père</label>
                                            <select
                                                id="fatherId" name="fatherId" value={formData.fatherId} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            >
                                                <option value="">Sélectionner un père...</option>
                                                {existingMembers.map(member => (
                                                    <option key={member.id} value={member.id}>{member.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Mère */}
                                        <div>
                                            <label htmlFor="motherId" className="block text-sm font-medium text-gray-700 mb-1">Mère</label>
                                            <select
                                                id="motherId" name="motherId" value={formData.motherId} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            >
                                                <option value="">Sélectionner une mère...</option>
                                                {existingMembers.map(member => (
                                                    <option key={member.id} value={member.id}>{member.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Conjoint(e) */}
                                        <div>
                                            <label htmlFor="spouseId" className="block text-sm font-medium text-gray-700 mb-1">Conjoint(e)</label>
                                            <select
                                                id="spouseId" name="spouseId" value={formData.spouseId} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            >
                                                <option value="">Sélectionner un(e) conjoint(e)...</option>
                                                {existingMembers.map(member => (
                                                    <option key={member.id} value={member.id}>{member.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Vous pourrez ajouter d'autres relations (frères/sœurs, enfants) après la création.</p>
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
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Ajouter le membre
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddMemberModal;