import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import memberService, { Member, MemberFormData } from '../../services/memberService';
import relationService, { RelationType } from '../../services/relationService';
import { useFamily } from '../../contexts/FamilyContext';
import { random } from 'lodash';

interface AddMemberFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialParentId?: number;
    initialSpouseId?: number;
    initialRelationType?: 'parent' | 'spouse' | 'child' | 'sibling';
}

interface FormData extends MemberFormData {
    photo: File |string |null;
    // photoUrl: string;
    fatherId: string;
    motherId: string;
    spouseId: string;
}

const initialFormData: FormData = {
    family: 0,
    first_name: '',
    last_name: '',
    birth_date: '',
    death_date: '',
    birth_place: '',
    occupation: '',
    bio: '',
    gender: 'male',
    photo: null,  // Initialisé à null
    // photoUrl: '',  // Supprimez cette ligne
    fatherId: '',
    motherId: '',
    spouseId: ''
};

const AddMemberForm: React.FC<AddMemberFormProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         onSuccess,
                                                         initialParentId,
                                                         initialSpouseId,
                                                         initialRelationType
                                                     }) => {
    const { selectedFamily, members, refreshFamilyData } = useFamily();
    const [formData, setFormData] = useState<FormData>({ ...initialFormData });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // D'abord, filtrez les membres pour créer les listes
    const fathers = members?.filter(m => m?.gender === 'male') || [];
    const mothers = members?.filter(m => m?.gender === 'female') || [];
    const spouses = members || [];

    // États pour la recherche
    const [fatherSearchTerm, setFatherSearchTerm] = useState<string>('');
    const [motherSearchTerm, setMotherSearchTerm] = useState<string>('');
    const [spouseSearchTerm, setSpouseSearchTerm] = useState<string>('');

    // États pour les résultats filtrés
    const [filteredFathers, setFilteredFathers] = useState<Member[]>(fathers);
    const [filteredMothers, setFilteredMothers] = useState<Member[]>(mothers);
    const [filteredSpouses, setFilteredSpouses] = useState<Member[]>(spouses);

    // États pour afficher/masquer les résultats
    const [showFatherResults, setShowFatherResults] = useState<boolean>(false);
    const [showMotherResults, setShowMotherResults] = useState<boolean>(false);
    const [showSpouseResults, setShowSpouseResults] = useState<boolean>(false);

    // Mettre à jour les résultats filtrés quand la liste des membres change
    useEffect(() => {
        setFilteredFathers(fathers);
        setFilteredMothers(mothers);
        setFilteredSpouses(spouses);

        // Mise à jour des termes de recherche si un membre est déjà sélectionné
        if (formData.fatherId) {
            const father = fathers.find(f => f.id.toString() === formData.fatherId);
            if (father) {
                setFatherSearchTerm(`${father.first_name || ''} ${father.last_name || ''}`.trim());
            }
        }
        if (formData.motherId) {
            const mother = mothers.find(m => m.id.toString() === formData.motherId);
            if (mother) {
                setMotherSearchTerm(`${mother.first_name || ''} ${mother.last_name || ''}`.trim());
            }
        }
        if (formData.spouseId) {
            const spouse = spouses.find(s => s.id.toString() === formData.spouseId);
            if (spouse) {
                setSpouseSearchTerm(`${spouse.first_name || ''} ${spouse.last_name || ''}`.trim());
            }
        }
    }, [members, formData.fatherId, formData.motherId, formData.spouseId]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setError(null);
            setIsSubmitting(false);
            setImagePreview(null);
            setFatherSearchTerm('');
            setMotherSearchTerm('');
            setSpouseSearchTerm('');
            setShowFatherResults(false);
            setShowMotherResults(false);
            setShowSpouseResults(false);

            const newFormData = { ...initialFormData };

            // Ajouter l'ID de la famille sélectionnée
            if (selectedFamily) {
                newFormData.family = selectedFamily.id;
            }

            // Préremplir avec les relations initiales
            if (initialParentId) {
                const parentMember = members.find(m => m.id === initialParentId);
                if (parentMember) {
                    if (parentMember.gender === 'male') {
                        newFormData.fatherId = initialParentId.toString();
                        setFatherSearchTerm(`${parentMember.first_name || ''} ${parentMember.last_name || ''}`.trim());
                    } else if (parentMember.gender === 'female') {
                        newFormData.motherId = initialParentId.toString();
                        setMotherSearchTerm(`${parentMember.first_name || ''} ${parentMember.last_name || ''}`.trim());
                    }
                }
            }

            if (initialSpouseId) {
                newFormData.spouseId = initialSpouseId.toString();
                const spouseMember = members.find(m => m.id === initialSpouseId);
                if (spouseMember) {
                    setSpouseSearchTerm(`${spouseMember.first_name || ''} ${spouseMember.last_name || ''}`.trim());
                }
            }

            setFormData(newFormData);
        }
    }, [isOpen, selectedFamily, initialParentId, initialSpouseId, initialRelationType, members]);

    // Gestionnaire pour les clics à l'extérieur des résultats
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Ne pas fermer les résultats si le clic est sur un élément de l'interface de recherche
            if (target.closest('.search-container') ||
                target.closest('.search-results') ||
                target.classList.contains('search-input')) {
                return;
            }

            // Fermer tous les résultats si le clic est en dehors
            setShowFatherResults(false);
            setShowMotherResults(false);
            setShowSpouseResults(false);
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    // Empêcher la soumission accidentelle du formulaire
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Empêcher la soumission du formulaire par Enter sauf dans la dernière étape
            if (e.key === 'Enter' && currentStep < 3) {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentStep]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            
            // Prévisualiser la photo
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            // Ne pas essayer d'uploader la photo maintenant - ça sera fait lors de la création du membre
        } else {
            setFormData(prev => ({ ...prev, photo: null, photoUrl: '' }));
            setImagePreview(null);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Avancer à l'étape suivante avec prévention de soumission
    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Validation pour l'étape 1
        if (currentStep === 1) {
            if (!formData.first_name?.trim()) {
                setError('Le prénom est requis pour continuer');
                return;
            }
            if (!formData.gender) {
                setError('Le genre est requis pour continuer');
                return;
            }
        }

        setError(null);
        setCurrentStep(prev => prev + 1);

        // Fermer tous les dropdowns de recherche lors du changement d'étape
        setShowFatherResults(false);
        setShowMotherResults(false);
        setShowSpouseResults(false);
    };

    // Retour à l'étape précédente
    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setError(null);
        setCurrentStep(prev => prev - 1);

        // Fermer tous les dropdowns de recherche lors du changement d'étape
        setShowFatherResults(false);
        setShowMotherResults(false);
        setShowSpouseResults(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Vérifier que nous sommes bien à la dernière étape
        if (currentStep !== 3) {
            setCurrentStep(3);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        if (!formData.first_name?.trim()) {
            setError('Le prénom est requis');
            setIsSubmitting(false);
            return;
        }

        if (!formData.gender) {
            setError('Le genre est requis');
            setIsSubmitting(false);
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            
            // Préparation des données du membre - SANS la photo
            const memberData: MemberFormData = {
                family: selectedFamily?.id || 0,
                first_name: formData.first_name,
                last_name: formData.last_name,
                birth_date: formData.birth_date,
                birth_place: formData.birth_place || '',
                death_date: formData.death_date || undefined,
                gender: formData.gender as 'male' | 'female' | 'other',
                occupation: formData.occupation || '',
                bio: formData.bio || '',
                // Ne pas inclure la photo ici
            };
            
            // 1. Créer le nouveau membre sans photo
            let newMember = await memberService.createMember(memberData);
            
            // 2. Si une photo a été sélectionnée, l'uploader séparément
            if (formData.photo instanceof File) {
                try {
                    await memberService.uploadPhoto(Number(newMember.id), formData.photo);
                    // Rafraîchir les données du membre après upload de la photo
                    newMember = await memberService.getMember(Number(newMember.id));
                } catch (photoError) {
                    console.error('Erreur lors du téléchargement de la photo:', photoError);
                    // Continuer même si l'upload de la photo échoue
                }
            }
            

            // Préparation des relations à créer
            const relationPromises = [];

            // Relation avec le père
            if (formData.fatherId) {
                relationPromises.push(
                    relationService.createRelation({
                        family: selectedFamily?.id || 0,
                        source: parseInt(formData.fatherId),
                        target: newMember.id,
                        type: RelationType.PARENT
                    })
                );
            }

            // Relation avec la mère
            if (formData.motherId) {
                relationPromises.push(
                    relationService.createRelation({
                        family: selectedFamily?.id || 0,
                        source: parseInt(formData.motherId),
                        target: newMember.id,
                        type: RelationType.PARENT
                    })
                );
            }

            // Relation avec le/la conjoint(e)
            if (formData.spouseId) {
                relationPromises.push(
                    relationService.createRelation({
                        family: selectedFamily?.id || 0,
                        source: newMember.id,
                        target: parseInt(formData.spouseId),
                        type: RelationType.SPOUSE
                    })
                );
            }

            // Attendre que toutes les relations soient créées
            if (relationPromises.length > 0) {
                await Promise.all(relationPromises);
            }

            // Rafraîchir les données
            await refreshFamilyData();

            // Fermer le modal et exécuter le callback de succès
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Erreur lors de la création du membre:', err);
            setError('Une erreur est survenue lors de la création du membre. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
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

    const slideVariants = {
        hidden: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -50 : 50,
            opacity: 0,
            transition: { duration: 0.2 }
        })
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                className="relative z-[101] bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden mx-4"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Ajouter un nouveau membre</h2>
                        <p className="text-sm text-gray-500">
                            {currentStep === 1 ? 'Informations personnelles' :
                                currentStep === 2 ? 'Détails biographiques' : 'Relations familiales'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="Fermer la modal"
                        disabled={isSubmitting}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`flex flex-col items-center ${step < currentStep ? 'text-black' : step === currentStep ? 'text-black' : 'text-gray-300'}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                    ${step < currentStep ? 'bg-green-100 text-green-700' : step === currentStep ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {step < currentStep ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span className="text-xs">
                                    {step === 1 ? 'Identité' : step === 2 ? 'Biographie' : 'Relations'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="w-full bg-gray-100 h-1 mt-2 rounded-full">
                        <div
                            className="bg-black h-1 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Body - Form */}
                <form onSubmit={handleSubmit} ref={formRef}>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Basic Info */}
                        <AnimatePresence mode="wait" initial={false}>
                            {currentStep === 1 && (
                                <motion.div
                                    className="space-y-6"
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
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
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
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
                                                {imagePreview ? "Changer la photo" : "Choisir une photo"}
                                            </button>
                                        </div>

                                        {/* Basic Info Fields */}
                                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Prénom */}
                                            <div className="space-y-1">
                                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Prénom *</label>
                                                <input
                                                    type="text" id="first_name" name="first_name" required
                                                    value={formData.first_name} onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                    placeholder="Ex: Jean"
                                                />
                                            </div>

                                            {/* Nom */}
                                            <div className="space-y-1">
                                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Nom</label>
                                                <input
                                                    type="text" id="last_name" name="last_name"
                                                    value={formData.last_name} onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                    placeholder="Ex: Dupont"
                                                />
                                            </div>

                                            {/* Genre */}
                                            <div className="space-y-1">
                                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Genre *</label>
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
                                            <div className="space-y-1">
                                                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Date de naissance</label>
                                                <input
                                                    type="date" id="birth_date" name="birth_date"
                                                    value={formData.birth_date} onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                />
                                            </div>

                                            {/* Date de Décès */}
                                            <div className="space-y-1">
                                                <label htmlFor="death_date" className="block text-sm font-medium text-gray-700">Date de décès</label>
                                                <input
                                                    type="date" id="death_date" name="death_date"
                                                    value={formData.death_date} onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                />
                                            </div>

                                            {/* Lieu de Naissance */}
                                            <div className="space-y-1">
                                                <label htmlFor="birth_place" className="block text-sm font-medium text-gray-700">Lieu de naissance</label>
                                                <input
                                                    type="text" id="birth_place" name="birth_place"
                                                    value={formData.birth_place} onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                    placeholder="Ex: Paris, France"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Biographical Info */}
                            {currentStep === 2 && (
                                <motion.div
                                    className="space-y-6"
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Occupation */}
                                    <div className="space-y-1">
                                        <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Profession</label>
                                        <input
                                            type="text" id="occupation" name="occupation"
                                            value={formData.occupation} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            placeholder="Ex: Ingénieur, Médecin..."
                                        />
                                    </div>

                                    {/* Biographie */}
                                    <div className="space-y-1">
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biographie</label>
                                        <textarea
                                            id="bio" name="bio" rows={6}
                                            value={formData.bio} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none"
                                            placeholder="Décrivez la vie, les réalisations ou toute autre information pertinente..."
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Family Relations - Version améliorée */}
                            {currentStep === 3 && (
                                <motion.div
                                    className="space-y-6"
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
                                        <h4 className="text-blue-800 font-semibold flex items-center mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Liens familiaux
                                        </h4>
                                        <p className="text-sm text-blue-700">
                                            Connectez ce membre à sa famille en sélectionnant ses parents et/ou son conjoint. Ces liens seront visibles dans l'arbre généalogique.
                                        </p>
                                    </div>

                                    {/* Section Parents */}
                                    <div className="bg-white border min-h-50 border-gray-200 rounded-lg overflow-auto">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                            <h3 className="font-medium text-gray-800">Parents</h3>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {/* Père - Avec recherche */}
                                            <div className="space-y-1 search-container">
                                                <label htmlFor="fatherId" className="block text-sm font-medium text-gray-700 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 010-12 6 6 0 010 12z" clipRule="evenodd" />
                                                    </svg>
                                                    Père
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Rechercher un membre..."
                                                        className="search-input w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        value={fatherSearchTerm || ''}
                                                        onChange={(e) => {
                                                            setFatherSearchTerm(e.target.value);
                                                            // Filtrer en temps réel
                                                            if (e.target.value) {
                                                                setFilteredFathers(
                                                                    fathers.filter(member =>
                                                                        `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(e.target.value.toLowerCase())
                                                                    )
                                                                );
                                                            } else {
                                                                setFilteredFathers(fathers);
                                                            }
                                                            // Afficher les résultats
                                                            setShowFatherResults(true);
                                                        }}
                                                        onFocus={() => setShowFatherResults(true)}
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                    {formData.fatherId && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData({...formData, fatherId: ''});
                                                                    setFatherSearchTerm('');
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Résultats de la recherche père */}
                                                <AnimatePresence>
                                                    {showFatherResults && (
                                                        <motion.div
                                                            className="relative"
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <div className="search-results absolute z-[200] mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200">
                                                                {filteredFathers.length > 0 ? (
                                                                    <>
                                                                        {filteredFathers.map(father => (
                                                                            <div
                                                                                key={father.id}
                                                                                className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                                onClick={() => {
                                                                                    setFormData({...formData, fatherId: father.id.toString()});
                                                                                    setFatherSearchTerm(`${father.first_name || ''} ${father.last_name || ''}`.trim());
                                                                                    setShowFatherResults(false);
                                                                                }}
                                                                            >
                                                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 mr-2">
                                                                                    {father.photo ? (
                                                                                        <img
                                                                                            src={father.photo}
                                                                                            alt={father.first_name || 'Photo'}
                                                                                            className="w-full h-full object-cover"
                                                                                            onError={(e) => {
                                                                                                const target = e.target as HTMLImageElement;
                                                                                                target.onerror = null;
                                                                                                target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                                            {father.first_name ? father.first_name.charAt(0).toUpperCase() : ''}
                                                                                            {father.last_name ? father.last_name.charAt(0).toUpperCase() : ''}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-medium">{father.first_name || ''} {father.last_name || ''}</div>
                                                                                    {father.birth_date && (
                                                                                        <div className="text-xs text-gray-500">
                                                                                            Né en {new Date(father.birth_date).getFullYear()}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {formData.fatherId === father.id.toString() && (
                                                                                    <div className="ml-auto">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    <div className="p-3 text-center text-sm text-gray-500">
                                                                        Aucun résultat trouvé
                                                                    </div>
                                                                )}
                                                                <div className="p-2 bg-gray-50 border-t border-gray-200">
                                                                    <button
                                                                        type="button"
                                                                        className="text-xs text-center w-full text-gray-500 hover:text-gray-600 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShowFatherResults(false);
                                                                        }}
                                                                    >
                                                                        Fermer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {formData.fatherId && (
                                                    <div className="mt-2">
                                                        {fathers.find(f => f.id.toString() === formData.fatherId) && (
                                                            <div className="flex items-center p-2 bg-blue-50 border border-blue-100 rounded-md">
                                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white mr-2">
                                                                    {fathers.find(f => f.id.toString() === formData.fatherId)?.photo ? (
                                                                        <img
                                                                            src={fathers.find(f => f.id.toString() === formData.fatherId)?.photo || ''}
                                                                            alt="Père sélectionné"
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                target.onerror = null;
                                                                                target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-blue-600 text-xs">
                                                                            {fathers.find(f => f.id.toString() === formData.fatherId)?.first_name?.charAt(0) || ''}
                                                                            {fathers.find(f => f.id.toString() === formData.fatherId)?.last_name?.charAt(0) || ''}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-blue-800">
                                                                        {fathers.find(f => f.id.toString() === formData.fatherId)?.first_name || ''}
                                                                        {' '}
                                                                        {fathers.find(f => f.id.toString() === formData.fatherId)?.last_name || ''}
                                                                    </div>
                                                                    <div className="text-xs text-blue-600">Père sélectionné</div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData({...formData, fatherId: ''});
                                                                        setFatherSearchTerm('');
                                                                    }}
                                                                    className="ml-auto text-blue-400 hover:text-red-500 p-1 rounded-full hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mère - Avec recherche - même structure que pour le père */}
                                            <div className="space-y-1 search-container">
                                                <label htmlFor="motherId" className="block text-sm font-medium text-gray-700 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 010-12 6 6 0 010 12z" clipRule="evenodd" />
                                                    </svg>
                                                    Mère
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Rechercher un membre..."
                                                        className="search-input w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all"
                                                        value={motherSearchTerm || ''}
                                                        onChange={(e) => {
                                                            setMotherSearchTerm(e.target.value);
                                                            if (e.target.value) {
                                                                setFilteredMothers(
                                                                    mothers.filter(member =>
                                                                        `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(e.target.value.toLowerCase())
                                                                    )
                                                                );
                                                            } else {
                                                                setFilteredMothers(mothers);
                                                            }
                                                            setShowMotherResults(true);
                                                        }}
                                                        onFocus={() => setShowMotherResults(true)}
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                    {formData.motherId && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData({...formData, motherId: ''});
                                                                    setMotherSearchTerm('');
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Résultats de recherche mère */}
                                                <AnimatePresence>
                                                    {showMotherResults && (
                                                        <motion.div
                                                            className="relative"
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <div className="search-results absolute z-[200] mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200">
                                                                {filteredMothers.length > 0 ? (
                                                                    <>
                                                                        {filteredMothers.map(mother => (
                                                                            <div
                                                                                key={mother.id}
                                                                                className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                                onClick={() => {
                                                                                    setFormData({...formData, motherId: mother.id.toString()});
                                                                                    setMotherSearchTerm(`${mother.first_name || ''} ${mother.last_name || ''}`.trim());
                                                                                    setShowMotherResults(false);
                                                                                }}
                                                                            >
                                                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 mr-2">
                                                                                    {mother.photo ? (
                                                                                        <img
                                                                                            src={mother.photo}
                                                                                            alt={mother.first_name || 'Photo'}
                                                                                            className="w-full h-full object-cover"
                                                                                            onError={(e) => {
                                                                                                const target = e.target as HTMLImageElement;
                                                                                                target.onerror = null;
                                                                                                target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                                            {mother.first_name ? mother.first_name.charAt(0).toUpperCase() : ''}
                                                                                            {mother.last_name ? mother.last_name.charAt(0).toUpperCase() : ''}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-medium">{mother.first_name || ''} {mother.last_name || ''}</div>
                                                                                    {mother.birth_date && (
                                                                                        <div className="text-xs text-gray-500">
                                                                                            Née en {new Date(mother.birth_date).getFullYear()}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {formData.motherId === mother.id.toString() && (
                                                                                    <div className="ml-auto">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    <div className="p-3 text-center text-sm text-gray-500">
                                                                        Aucun résultat trouvé
                                                                    </div>
                                                                )}
                                                                <div className="p-2 bg-gray-50 border-t border-gray-200">
                                                                    <button
                                                                        type="button"
                                                                        className="text-xs text-center w-full text-gray-500 hover:text-gray-600 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShowMotherResults(false);
                                                                        }}
                                                                    >
                                                                        Fermer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {formData.motherId && (
                                                    <div className="mt-2">
                                                        {mothers.find(m => m.id.toString() === formData.motherId) && (
                                                            <div className="flex items-center p-2 bg-pink-50 border border-pink-100 rounded-md">
                                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white mr-2">
                                                                    {mothers.find(m => m.id.toString() === formData.motherId)?.photo ? (
                                                                        <img
                                                                            src={mothers.find(m => m.id.toString() === formData.motherId)?.photo || ''}
                                                                            alt="Mère sélectionnée"
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                target.onerror = null;
                                                                                target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-pink-600 text-xs">
                                                                            {mothers.find(m => m.id.toString() === formData.motherId)?.first_name?.charAt(0) || ''}
                                                                            {mothers.find(m => m.id.toString() === formData.motherId)?.last_name?.charAt(0) || ''}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-pink-800">
                                                                        {mothers.find(m => m.id.toString() === formData.motherId)?.first_name || ''}
                                                                        {' '}
                                                                        {mothers.find(m => m.id.toString() === formData.motherId)?.last_name || ''}
                                                                    </div>
                                                                    <div className="text-xs text-pink-600">Mère sélectionnée</div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData({...formData, motherId: ''});
                                                                        setMotherSearchTerm('');
                                                                    }}
                                                                    className="ml-auto text-pink-400 hover:text-red-500 p-1 rounded-full hover:bg-pink-100 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Conjoint */}
                                    <div className="bg-white border min-h-30  border-gray-200 rounded-lg overflow-auto">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                            <h3 className="font-medium text-gray-800">Conjoint(e)</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="space-y-1 search-container">
                                                <label htmlFor="spouseId" className="block text-sm font-medium text-gray-700 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                    </svg>
                                                    Conjoint(e)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Rechercher un membre..."
                                                        className="search-input w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                        value={spouseSearchTerm || ''}
                                                        onChange={(e) => {
                                                            setSpouseSearchTerm(e.target.value);
                                                            if (e.target.value) {
                                                                setFilteredSpouses(
                                                                    spouses.filter(member =>
                                                                        `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(e.target.value.toLowerCase())
                                                                    )
                                                                );
                                                            } else {
                                                                setFilteredSpouses(spouses);
                                                            }
                                                            setShowSpouseResults(true);
                                                        }}
                                                        onFocus={() => setShowSpouseResults(true)}
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                    {formData.spouseId && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData({...formData, spouseId: ''});
                                                                    setSpouseSearchTerm('');
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Résultats de recherche conjoint */}
                                                <AnimatePresence>
                                                    {showSpouseResults && (
                                                        <motion.div
                                                            className="relative"
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <div className="search-results absolute z-[200] mt-1 w-full bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto border border-gray-200">
                                                                {filteredSpouses.length > 0 ? (
                                                                    <>
                                                                        {filteredSpouses.map(spouse => (
                                                                            <div
                                                                                key={spouse.id}
                                                                                className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                                onClick={() => {
                                                                                    setFormData({...formData, spouseId: spouse.id.toString()});
                                                                                    setSpouseSearchTerm(`${spouse.first_name || ''} ${spouse.last_name || ''}`.trim());
                                                                                    setShowSpouseResults(false);
                                                                                }}
                                                                            >
                                                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 mr-2">
                                                                                    {spouse.photo ? (
                                                                                        <img
                                                                                            src={spouse.photo}
                                                                                            alt={spouse.first_name || 'Photo'}
                                                                                            className="w-full h-full object-cover"
                                                                                            onError={(e) => {
                                                                                                const target = e.target as HTMLImageElement;
                                                                                                target.onerror = null;
                                                                                                target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                                            {spouse.first_name ? spouse.first_name.charAt(0).toUpperCase() : ''}
                                                                                            {spouse.last_name ? spouse.last_name.charAt(0).toUpperCase() : ''}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-medium">{spouse.first_name || ''} {spouse.last_name || ''}</div>
                                                                                    <div className="text-xs text-gray-500 flex items-center">
                                                                                        {spouse.gender === 'male' ? (
                                                                                            <>
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                                </svg>
                                                                                                Homme
                                                                                            </>
                                                                                        ) : spouse.gender === 'female' ? (
                                                                                            <>
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                                                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                                </svg>
                                                                                                Femme
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                                </svg>
                                                                                                Autre
                                                                                            </>
                                                                                        )}
                                                                                        {spouse.birth_date && ` • ${new Date(spouse.birth_date).getFullYear()}`}
                                                                                    </div>
                                                                                </div>
                                                                                {formData.spouseId === spouse.id.toString() && (
                                                                                    <div className="ml-auto">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    <div className="p-3 text-center text-sm text-gray-500">
                                                                        Aucun résultat trouvé
                                                                    </div>
                                                                )}
                                                                <div className="p-2 bg-gray-50 border-t border-gray-200">
                                                                    <button
                                                                        type="button"
                                                                        className="text-xs text-center w-full text-gray-500 hover:text-gray-600 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShowSpouseResults(false);
                                                                        }}
                                                                    >
                                                                        Fermer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {formData.spouseId && (
                                                    <div className="mt-2">
                                                        {spouses.find(s => s.id.toString() === formData.spouseId) && (
                                                            <div className="flex items-center p-2 bg-purple-50 border border-purple-100 rounded-md">
                                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white mr-2">
                                                                    {spouses.find(s => s.id.toString() === formData.spouseId)?.photo ? (
                                                                        <img
                                                                            src={spouses.find(s => s.id.toString() === formData.spouseId)?.photo || ''}
                                                                            alt="Conjoint sélectionné"
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                target.onerror = null;
                                                                                target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-purple-600 text-xs">
                                                                            {spouses.find(s => s.id.toString() === formData.spouseId)?.first_name?.charAt(0) || ''}
                                                                            {spouses.find(s => s.id.toString() === formData.spouseId)?.last_name?.charAt(0) || ''}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-purple-800">
                                                                        {spouses.find(s => s.id.toString() === formData.spouseId)?.first_name || ''}
                                                                        {' '}
                                                                        {spouses.find(s => s.id.toString() === formData.spouseId)?.last_name || ''}
                                                                    </div>
                                                                    <div className="text-xs text-purple-600">
                                                                        {spouses.find(s => s.id.toString() === formData.spouseId)?.gender === 'male' ? 'Époux' :
                                                                            spouses.find(s => s.id.toString() === formData.spouseId)?.gender === 'female' ? 'Épouse' :
                                                                                'Conjoint(e)'}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData({...formData, spouseId: ''});
                                                                        setSpouseSearchTerm('');
                                                                    }}
                                                                    className="ml-auto text-purple-400 hover:text-red-500 p-1 rounded-full hover:bg-purple-100 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Autres relations à venir */}
                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-amber-800 font-semibold">
                                                Relations supplémentaires
                                            </p>
                                            <p className="text-xs text-amber-700 mt-1">
                                                Vous pourrez ajouter d'autres relations (frères/sœurs, enfants) après la création du membre, en utilisant le menu d'édition des relations disponible sur la fiche du membre.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Résumé des relations sélectionnées */}
                                    {(formData.fatherId || formData.motherId || formData.spouseId) && (
                                        <motion.div
                                            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                        >
                                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Résumé des relations</h4>
                                            <div className="space-y-1 text-sm">
                                                {formData.fatherId && (
                                                    <div className="flex items-center text-gray-700">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                                        </svg>
                                                        <span>
                                                            <span className="font-medium">
                                                                {fathers.find(f => f.id.toString() === formData.fatherId)?.first_name || ''}
                                                                {' '}
                                                                {fathers.find(f => f.id.toString() === formData.fatherId)?.last_name || ''}
                                                            </span>
                                                            {' '}sera défini comme père
                                                        </span>
                                                    </div>
                                                )}
                                                {formData.motherId && (
                                                    <div className="flex items-center text-gray-700">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                                        </svg>
                                                        <span>
                                                            <span className="font-medium">
                                                                {mothers.find(m => m.id.toString() === formData.motherId)?.first_name || ''}
                                                                {' '}
                                                                {mothers.find(m => m.id.toString() === formData.motherId)?.last_name || ''}
                                                            </span>
                                                            {' '}sera définie comme mère
                                                        </span>
                                                    </div>
                                                )}
                                                {formData.spouseId && (
                                                    <div className="flex items-center text-gray-700">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>
                                                            <span className="font-medium">
                                                                {spouses.find(s => s.id.toString() === formData.spouseId)?.first_name || ''}
                                                                {' '}
                                                                {spouses.find(s => s.id.toString() === formData.spouseId)?.last_name || ''}
                                                            </span>
                                                            {' '}sera défini(e) comme
                                                            {spouses.find(s => s.id.toString() === formData.spouseId)?.gender === 'male' ? ' époux' :
                                                                spouses.find(s => s.id.toString() === formData.spouseId)?.gender === 'female' ? ' épouse' :
                                                                    ' conjoint(e)'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer - Actions */}
                    <div className="flex justify-between items-center p-5 border-t border-gray-100 bg-gray-50">
                        {currentStep > 1 ? (
                            <motion.button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting}
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Précédent
                                </div>
                            </motion.button>
                        ) : (
                            <div></div> // Placeholder pour maintenir l'alignement
                        )}

                        {currentStep < 3 ? (
                            <motion.button
                                type="button"
                                onClick={nextStep}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting}
                            >
                                <div className="flex items-center">
                                    Suivant
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </motion.button>
                        ) : (
                            <motion.button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
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
                                        Création en cours...
                                    </div>
                                ) : (
                                    "Ajouter le membre"
                                )}
                            </motion.button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddMemberForm;