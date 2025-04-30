import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamily } from '../../contexts/FamilyContext';
import { Member } from '../../services/memberService';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { searchMembers, setSelectedMemberId } = useFamily();

    // Gérer la fermeture du dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Recherche avec debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsDropdownOpen(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchMembers(searchTerm);
                setSearchResults(results);
                setIsDropdownOpen(true);
            } catch (error) {
                console.error('Erreur lors de la recherche:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchMembers]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setIsDropdownOpen(false);
    };

    const selectResult = (member: Member) => {
        // Ici nous ajoutons la mise à jour du membre sélectionné
        if (setSelectedMemberId) {
            setSelectedMemberId(Number(member.id));
        }
        console.log('Membre sélectionné:', member);
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Rechercher un membre..."
                    className="w-64 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-8 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {searchTerm && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {isSearching && (
                    <div className="absolute right-3 top-2.5">
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isDropdownOpen && searchResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-80 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
                    >
                        <div className="max-h-96 overflow-y-auto p-1">
                            {searchResults.map((member) => (
                                // Utiliser un div au lieu d'un button pour le conteneur principal
                                <motion.div
                                    key={member.id}
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                    onClick={() => selectResult(member)}
                                    className="w-full px-4 py-3 flex items-center text-left rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                        {member.photo ? (
                                            <img src={member.photo} alt={member.first_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <div className="font-medium text-gray-800">{member.first_name} {member.last_name}</div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                            {member.birth_date && (
                                                <span className="mr-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(member.birth_date).getFullYear()}
                                                </span>
                                            )}
                                            {member.occupation && (
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {member.occupation}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-2">
                                        <div className="p-1 rounded-full hover:bg-black hover:text-white transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {isDropdownOpen && searchTerm && searchResults.length === 0 && !isSearching && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-64 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg p-4 text-center"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-gray-600">Aucun résultat pour <strong>"{searchTerm}"</strong></p>
                        <p className="text-xs text-gray-500 mt-1">Essayez avec un autre terme de recherche</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;