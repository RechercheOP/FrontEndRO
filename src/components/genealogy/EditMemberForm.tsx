// components/genealogy/EditMemberForm.tsx - Recodé intégralement
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import memberService, { Member, MemberFormData } from '../../services/memberService';
import { useFamily } from '../../contexts/FamilyContext';

interface EditMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  member: Member | null;
}

const EditMemberForm = ({ isOpen, onClose, onSuccess, member }: EditMemberFormProps) => {
  const { selectedFamily, refreshFamilyData } = useFamily();
  
  // États pour gérer le formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // État initial du formulaire
  const initialFormState: MemberFormData = {
    family: selectedFamily?.id || 0,
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: 'other',
    occupation: '',
    bio: '',
    photo: null,
  };
  
  const [formData, setFormData] = useState<MemberFormData>(initialFormState);
  
  // Charger les données du membre à éditer
  useEffect(() => {
    if (member) {
      // Extraire les données à afficher
      const memberData = {
        family: member.family,
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        birth_date: member.birth_date || '',
        birth_place: member.birth_place || '',
        death_date: member.death_date || '',
        gender: member.gender || 'other',
        occupation: member.occupation || '',
        bio: member.bio || '',
        // Ne pas inclure photo dans les données du formulaire
      };
      
      setFormData(memberData);
      
      // Définir l'aperçu de la photo si disponible
      const photoUrl = member.photo_url || member.photo;
      if (photoUrl) {
        setPhotoPreview(photoUrl);
      }
    }
  }, [member]);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Gérer le changement de photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Prévisualiser la photo
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFamily || !member) {
      setErrorMessage("Informations manquantes pour modifier ce membre");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      // 1. Mettre à jour les données textuelles du membre
      console.log('Mise à jour des données textuelles');
      await memberService.updateMember(Number(member.id), formData);
      
      // 2. Si une nouvelle photo a été sélectionnée, la télécharger séparément
      if (photoFile) {
        try {
          console.log('Téléchargement de la nouvelle photo');
          await memberService.uploadPhoto(Number(member.id), photoFile);
          console.log('Photo téléchargée avec succès');
        } catch (photoError) {
          console.error('Erreur lors du téléchargement de la photo:', photoError);
          setErrorMessage("La mise à jour a réussi mais le téléchargement de la photo a échoué.");
          // On continue le processus même avec cette erreur
        }
      }
      
      // Afficher un message de succès
      setSuccessMessage("Membre mis à jour avec succès!");
      
      // Rafraîchir les données de la famille
      if (refreshFamilyData) {
        await refreshFamilyData();
      }
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
      
      // Fermer le formulaire après un court délai
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      setErrorMessage("Une erreur est survenue lors de la mise à jour du membre");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gérer la suppression d'un membre
  const handleDelete = async () => {
    if (!member) return;
    
    try {
      setIsDeleting(true);
      await memberService.deleteMember(Number(member.id));
      
      // Rafraîchir les données de la famille
      if (refreshFamilyData) {
        await refreshFamilyData();
      }
      
      setSuccessMessage("Membre supprimé avec succès!");
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
      
      // Fermer le formulaire après un court délai
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      setErrorMessage("Une erreur est survenue lors de la suppression du membre");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Si le modal n'est pas ouvert ou pas de membre, ne rien afficher
  if (!isOpen || !member) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Modifier {member.first_name} {member.last_name}</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting || isDeleting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Body avec formulaire */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {successMessage}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo */}
                    <div className="md:col-span-2 flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-2 relative group">
                        {photoPreview ? (
                          <img src={photoPreview} alt={formData.first_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label htmlFor="photoUpload" className="cursor-pointer p-2 bg-white rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </label>
                          <input
                            id="photoUpload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            disabled={isSubmitting || isDeleting}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {photoFile ? photoFile.name : "Cliquez pour modifier la photo"}
                      </span>
                    </div>
                    
                    {/* Prénom */}
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        required
                        disabled={isSubmitting || isDeleting}
                      />
                    </div>
                    
                    {/* Nom */}
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        disabled={isSubmitting || isDeleting}
                      />
                    </div>
                    
                    {/* Genre */}
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        disabled={isSubmitting || isDeleting}
                      >
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    
                    {/* Date de naissance */}
                    <div>
                      <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                      <input
                        type="date"
                        id="birth_date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        disabled={isSubmitting || isDeleting}
                      />
                    </div>
                    
                    {/* Lieu de naissance */}
                    <div>
                      <label htmlFor="birth_place" className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                      <input
                        type="text"
                        id="birth_place"
                        name="birth_place"
                        value={formData.birth_place || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        disabled={isSubmitting || isDeleting}
                      />
                    </div>
                    
                    {/* Date de décès */}
                    <div>
                      <label htmlFor="death_date" className="block text-sm font-medium text-gray-700 mb-1">Date de décès</label>
                      <input
                        type="date"
                        id="death_date"
                        name="death_date"
                        value={formData.death_date || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        disabled={isSubmitting || isDeleting}
                      />
                    </div>
                    
                    {/* Profession */}
                    <div className="md:col-span-2">
                      <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                      <input
                        type="text"
                        id="occupation"
                        name="occupation"
                        value={formData.occupation || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        disabled={isSubmitting || isDeleting}
                      />
                    </div>
                    
                    {/* Biographie */}
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                        disabled={isSubmitting || isDeleting}
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <div>
                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          disabled={isSubmitting || isDeleting}
                        >
                          Supprimer
                        </button>
                      ) : (
                        <div className="flex space-x-2 items-center">
                          <span className="text-sm text-red-600">Confirmer la suppression ?</span>
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            disabled={isDeleting || isSubmitting}
                          >
                            {isDeleting ? (
                              <span className="flex items-center">
                                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Suppression...
                              </span>
                            ) : "Oui"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                            disabled={isDeleting || isSubmitting}
                          >
                            Non
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isSubmitting || isDeleting}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        disabled={isSubmitting || isDeleting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enregistrement...
                          </span>
                        ) : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditMemberForm;