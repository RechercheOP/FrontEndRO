import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Member } from '../../services/memberService';
import { Relation } from '../../services/relationService';
import { useFamily } from '../../contexts/FamilyContext'; // Assurez-vous que ce chemin est correct
import EditMemberForm from './EditMemberForm';

interface MemberDetailModalProps {
    selectedMember: Member | null;
    onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
                                                                 selectedMember,
                                                                 onClose
                                                             }) => {
    const { members, relations } = useFamily(); // Récupère les données du contexte FamilyContext
    const [activeTab, setActiveTab] = useState<'info' | 'relations'>('info');
    const [memberWithRelations, setMemberWithRelations] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    useEffect(() => {
        if (!selectedMember || !members || !relations) return;

        try {
            // On cherche toutes les relations réelles
            const parents: Member[] = [];
            const children: Member[] = [];
            const spouses: Member[] = [];
            const siblings: Member[] = [];

            // Parents = tous ceux qui ont une relation parent vers ce membre
            relations.forEach(rel => {
                if (rel.type === 'parent' && Number(rel.target) === Number(selectedMember.id)) {
                    const parent = members.find(m => Number(m.id) === Number(rel.source));
                    if (parent && !parents.some(p => Number(p.id) === Number(parent.id))) {
                        parents.push(parent);
                    }
                }
            });

            // Enfants = tous ceux qui ont une relation parent depuis ce membre
            relations.forEach(rel => {
                if (rel.type === 'parent' && Number(rel.source) === Number(selectedMember.id)) {
                    const child = members.find(m => Number(m.id) === Number(rel.target));
                    if (child && !children.some(c => Number(c.id) === Number(child.id))) {
                        children.push(child);
                    }
                }
            });

            // Conjoints = tous ceux qui ont une relation spouse (dans les deux sens)
            relations.forEach(rel => {
                if (rel.type === 'spouse' &&
                    (Number(rel.source) === Number(selectedMember.id) || Number(rel.target) === Number(selectedMember.id))) {
                    const spouseId = Number(rel.source) === Number(selectedMember.id) ? Number(rel.target) : Number(rel.source);
                    const spouse = members.find(m => Number(m.id) === spouseId);
                    if (spouse && !spouses.some(s => Number(s.id) === Number(spouse.id))) {
                        spouses.push(spouse);
                    }
                }
            });

            // Frères/sœurs = tous ceux qui partagent au moins un parent avec le membre, excluant lui-même
            if (parents.length > 0) {
                const parentIds = parents.map(p => Number(p.id));
                members.forEach(potentialSibling => {
                    // Ne pas s'inclure soi-même
                    if (Number(potentialSibling.id) === Number(selectedMember.id)) return;

                    // Vérifier si ce membre a au moins un parent en commun
                    const siblingParents = relations
                        .filter(rel => rel.type === 'parent' && Number(rel.target) === Number(potentialSibling.id))
                        .map(rel => Number(rel.source));

                    const hasCommonParent = siblingParents.some(parentId => parentIds.includes(parentId));

                    if (hasCommonParent && !siblings.some(s => Number(s.id) === Number(potentialSibling.id))) {
                        siblings.push(potentialSibling);
                    }
                });
            }

            setMemberWithRelations({
                ...selectedMember,
                relations: {
                    parents,
                    children,
                    siblings,
                    spouses
                }
            });
        } catch (error) {
            console.error("Erreur lors du chargement des relations:", error);
            // Fallback en cas d'erreur
            setMemberWithRelations({
                ...selectedMember,
                relations: {
                    parents: [],
                    children: [],
                    siblings: [],
                    spouses: []
                }
            });
        }
    }, [selectedMember, members, relations]);

    if (!selectedMember || !memberWithRelations) {
        return null;
    }

    // Extraction des données
    const fullName = `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim();
    const birth_date = selectedMember.birth_date ? new Date(selectedMember.birth_date).toLocaleDateString() : 'Inconnue';
    const death_date = selectedMember.death_date ? new Date(selectedMember.death_date).toLocaleDateString() : '';
    const age = calculateAge(selectedMember.birth_date, selectedMember.death_date);

    // Fonction pour calculer l'âge
    function calculateAge(birth_dateStr: string | null, death_dateStr: string | null): string {
        if (!birth_dateStr) return 'Inconnu';
        try {
            const birth_date = new Date(birth_dateStr);
            const endDate = death_dateStr ? new Date(death_dateStr) : new Date();
            let age = endDate.getFullYear() - birth_date.getFullYear();
            const monthDiff = endDate.getMonth() - birth_date.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth_date.getDate())) {
                age--;
            }
            return age.toString();
        } catch (e) {
            console.error("Erreur de calcul d'âge:", e);
            return 'Inconnu';
        }
    }

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

    // Fonction de rendu pour un membre dans les relations
    const renderMemberCard = (member: Member, relation: string) => (
        <div key={member.id} className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-3 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                {member.photo ? (
                    <img
                        src={member.photo}
                        alt={`${member.first_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback pour les images qui ne chargent pas
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                        {member.first_name ? member.first_name.charAt(0) : ''}
                        {member.last_name ? member.last_name.charAt(0) : ''}
                    </div>
                )}
            </div>
            <div>
                <div className="font-medium">{member.first_name} {member.last_name}</div>
                <div className="text-xs text-gray-500">{relation}</div>
            </div>
        </div>
    );

    return (
        <>
        <AnimatePresence>
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
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden mx-4 max-h-[80vh] flex flex-col"
                    variants={modalVariants}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {/* Header with background and profile pic */}
                    <div className="h-40 bg-gray-100 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                                {selectedMember.photo_url ? (
                                    <img
                                        src={selectedMember.photo_url}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback pour les images qui ne chargent pas
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-2xl">
                                        {selectedMember.first_name ? selectedMember.first_name.charAt(0) : ''}
                                        {selectedMember.last_name ? selectedMember.last_name.charAt(0) : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-36 right-4 text-white">
                            <h2 className="text-2xl font-bold">{fullName}</h2>
                            <p className="text-sm opacity-90">
                                {selectedMember.birth_date && (
                                    <>
                                        {birth_date}
                                        {selectedMember.death_date && <> — {death_date}</>}
                                        {age && <> • {age} ans</>}
                                    </>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/30 text-white p-1.5 rounded-full hover:bg-black/50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                       
                    </div>

                    {/* Tabs navigation */}
                    <div className="px-8 pt-16 border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'info'
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } transition-colors`}
                            >
                                Informations
                            </button>
                            <button
                                onClick={() => setActiveTab('relations')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'relations'
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } transition-colors`}
                            >
                                Relations familiales
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content - avec défilement */}
                    <div className="p-8 overflow-y-auto flex-grow">
                        {activeTab === 'info' ? (
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informations personnelles</h3>
                                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500">Date de naissance</div>
                                            <div className="font-medium">{birth_date}</div>
                                        </div>
                                        {selectedMember.birth_place && (
                                            <div>
                                                <div className="text-xs text-gray-500">Lieu de naissance</div>
                                                <div className="font-medium">{selectedMember.birth_place}</div>
                                            </div>
                                        )}
                                        {selectedMember.death_date && (
                                            <div>
                                                <div className="text-xs text-gray-500">Date de décès</div>
                                                <div className="font-medium">{death_date}</div>
                                            </div>
                                        )}
                                        {selectedMember.occupation && (
                                            <div>
                                                <div className="text-xs text-gray-500">Profession</div>
                                                <div className="font-medium">{selectedMember.occupation}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xs text-gray-500">Genre</div>
                                            <div className="font-medium">
                                                {selectedMember.gender === 'male' ? 'Homme' :
                                                    selectedMember.gender === 'female' ? 'Femme' : 'Autre'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {selectedMember.bio && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Biographie</h3>
                                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                                            <p className="text-gray-700 whitespace-pre-line">{selectedMember.bio}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Parents */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Parents</h3>
                                    {memberWithRelations.relations.parents && memberWithRelations.relations.parents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {memberWithRelations.relations.parents.map((parent: Member) =>
                                                renderMemberCard(parent, parent.gender === 'female' ? 'Mère' :
                                                    parent.gender === 'male' ? 'Père' : 'Parent')
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-center text-gray-500">
                                            Aucun parent enregistré
                                        </div>
                                    )}
                                </div>

                                {/* Spouses */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Conjoints</h3>
                                    {memberWithRelations.relations.spouses && memberWithRelations.relations.spouses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {memberWithRelations.relations.spouses.map((spouse: Member) =>
                                                renderMemberCard(spouse, spouse.gender === 'female' ? 'Épouse' :
                                                    spouse.gender === 'male' ? 'Époux' : 'Conjoint(e)')
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-center text-gray-500">
                                            Aucun conjoint enregistré
                                        </div>
                                    )}
                                </div>

                                {/* Children */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Enfants</h3>
                                    {memberWithRelations.relations.children && memberWithRelations.relations.children.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {memberWithRelations.relations.children.map((child: Member) =>
                                                renderMemberCard(child, child.gender === 'female' ? 'Fille' :
                                                    child.gender === 'male' ? 'Fils' : 'Enfant')
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-center text-gray-500">
                                            Aucun enfant enregistré
                                        </div>
                                    )}
                                </div>

                                {/* Siblings */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Frères et sœurs</h3>
                                    {memberWithRelations.relations.siblings && memberWithRelations.relations.siblings.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {memberWithRelations.relations.siblings.map((sibling: Member) =>
                                                renderMemberCard(sibling, sibling.gender === 'female' ? 'Sœur' :
                                                    sibling.gender === 'male' ? 'Frère' : 'Frère/Sœur')
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-center text-gray-500">
                                            Aucun frère ou sœur enregistré
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Modifier"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Fermer
                        </button>
                        
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
        <EditMemberForm
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={onClose} // Si vous voulez fermer le modal de détails après modification
            member={selectedMember}
            />
        </>
    );
};

export default MemberDetailModal;