import { motion, AnimatePresence } from 'framer-motion';
import { FC } from 'react';

// Définition des types
interface Relation {
    type: string;
    name: string;
}

interface MemberDetailModalProps {
    selectedMember: {
        id: number;
        name: string;
        birthDate: string;
        birthPlace: string;
        deathDate: string;
        occupation: string;
        bio: string;
        photoUrl: string;
        relations: Relation[];
    } | null;
    onClose: () => void;
}

const MemberDetailModal: FC<MemberDetailModalProps> = ({ selectedMember, onClose }) => {
    if (!selectedMember) return null;

    return (
        <AnimatePresence>
            {selectedMember && (
                <motion.div
                    className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="relative h-35 bg-gray-900 overflow-hidden">
                            <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: `url(${selectedMember.photoUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'grayscale(100%) blur(4px)'
                            }}></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <motion.button
                                    className="p-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full text-white hover:bg-opacity-20 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </motion.button>
                                <motion.button
                                    onClick={onClose}
                                    className="p-2 bg-white bg-opacity-10 backdrop-blur-md rounded-full text-white hover:bg-opacity-20 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                            <div className="absolute bottom-6 left-6 flex items-end">
                                <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden shadow-lg">
                                    <img
                                        src={selectedMember.photoUrl}
                                        alt={selectedMember.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="ml-4">
                                    <motion.h2
                                        className="text-2xl font-bold text-white"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {selectedMember.name}
                                    </motion.h2>
                                    <motion.p
                                        className="text-white text-opacity-80"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {selectedMember.occupation}
                                    </motion.p>
                                </div>
                            </div>
                        </div>

                        {/* Contenu du profil  */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Informations principales */}
                                <div className="space-y-6">
                                    <motion.div
                                        className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-gray-500">Date de naissance</span>
                                                <span className="font-medium text-gray-900">{selectedMember.birthDate || 'Inconnue'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-gray-500">Lieu de naissance</span>
                                                <span className="font-medium text-gray-900">{selectedMember.birthPlace || 'Inconnu'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-gray-500">Date de décès</span>
                                                <span className="font-medium text-gray-900">{selectedMember.deathDate || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Profession</span>
                                                <span className="font-medium text-gray-900">{selectedMember.occupation || 'Inconnue'}</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biographie</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {selectedMember.bio || 'Aucune information biographique disponible.'}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Relations */}
                                <div className="space-y-6">
                                    <motion.div
                                        className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relations familiales</h3>
                                        <div className="space-y-4">
                                            {selectedMember.relations.map((relation: Relation, index: number) => (
                                                <motion.div
                                                    key={index}
                                                    className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-gray-500">{relation.type}</p>
                                                        <p className="font-medium text-gray-900">{relation.name}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                                        <div className="flex flex-col gap-3">
                                            <motion.button
                                                className="w-full bg-black text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center shadow-sm"
                                                whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                                                whileTap={{ y: 0 }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Ajouter un parent
                                            </motion.button>
                                            <motion.button
                                                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg border border-gray-200 transition-all flex items-center justify-center shadow-sm"
                                                whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                                                whileTap={{ y: 0 }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                Ajouter un enfant
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MemberDetailModal;