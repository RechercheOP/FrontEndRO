// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddMemberForm from "../genealogy/AddMemberForm";
import { useFamily } from '../../contexts/FamilyContext';
// Import du service et des types de résultats mis à jour
import genealogyAlgorithmsService, {
    ConnectedComponentResult,
    RelationshipResult,
    ShortestPathResult
} from '../../services/genealogyAlgorithmsService'; // Changement ici
import { Member } from '../../services/memberService';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    onCreateFamilyClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, onCreateFamilyClick }) => {
    // États existants
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { selectedFamily, members, relations, loadingMembers, selectedMemberId, setSelectedMemberId, refreshFamilyData } = useFamily(); // Ajouter relations, loadingMembers, selectedMemberId, setSelectedMemberId, refreshFamilyData

    // États pour les algorithmes RO
    const [member1IdInput, setMember1IdInput] = useState<string>('');
    const [member2IdInput, setMember2IdInput] = useState<string>('');
    const [algoResult, setAlgoResult] = useState<string | null>(null);
    const [isAlgoLoading, setIsAlgoLoading] = useState<boolean>(false);

    // --- HANDLERS (PAS DE CHANGEMENTS MAJEURS ICI) ---
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        console.log("Searching for:", e.target.value);
        // Logique de recherche...
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    // --- HANDLERS POUR LES ALGORITHMES (ADAPTÉS AUX NOUVEAUX RÉSULTATS) ---

    const handleCalculateConnectivity = () => {
        if (!selectedFamily || loadingMembers || members.length === 0) {
             setAlgoResult("Veuillez sélectionner une famille avec des membres chargés.");
             return;
        }
        setIsAlgoLoading(true);
        setAlgoResult("Calcul de la connexité en cours...");
        try {
            // Utilisation de la fonction du service importé
            const result: ConnectedComponentResult = genealogyAlgorithmsService.findConnectedComponents(members, relations);
            let output = `Nombre de groupes (composantes + isolés) : ${result.count + result.isolatedMembers.length}\n`;
             output += `Nombre de composantes avec liens : ${result.count}\n`;
            output += `Nombre de membres isolés : ${result.isolatedMembers.length}\n\n`;

             if (result.isolatedMembers.length > 0) {
                 output += `Membres Isolés:\n - ${result.isolatedMembers.map(m => `${m.first_name} ${m.last_name} (ID:${m.id})`).join('\n - ')}\n\n`;
             }

             if (result.components.length > 0) {
                output += `Détail des Composantes Connectées (${result.count}) :\n`;
                 result.components.forEach((componentMembers, index) => {
                    const names = componentMembers.map(m => `${m.first_name} ${m.last_name} (ID:${m.id})`).join(', ');
                    output += ` Composante ${index + 1} (${componentMembers.length} membres): [${names}]\n`;
                 });
             } else {
                 output += "Aucune composante connexe (avec liens) trouvée.\n";
             }


            setAlgoResult(output);
        } catch (error) {
            console.error("Erreur lors du calcul de la connexité:", error);
            setAlgoResult(`Erreur lors du calcul : ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsAlgoLoading(false);
        }
    };

    const handleFindRelationship = () => { // Renommé pour correspondre à la fonction
        if (!selectedFamily || loadingMembers) {
             setAlgoResult("Veuillez sélectionner une famille avec des membres chargés.");
             return;
        }
        const id1 = parseInt(member1IdInput, 10);
        const id2 = parseInt(member2IdInput, 10);

        if (isNaN(id1) || isNaN(id2)) {
            setAlgoResult("Veuillez entrer des ID de membre valides (nombres).");
            return;
        }

         const member1 = members.find(m => Number(m.id) === id1);
         const member2 = members.find(m => Number(m.id) === id2);

         if (!member1 || !member2) {
             setAlgoResult("Un ou les deux membres spécifiés n'ont pas été trouvés.");
             return;
         }


        setIsAlgoLoading(true);
        setAlgoResult(`Calcul du lien de parenté entre ${member1.first_name} et ${member2.first_name}...`);
        try {
            // Utilisation de la fonction du service importé
            const result: RelationshipResult = genealogyAlgorithmsService.findRelationship(id1, id2, members, relations);

             let output = `Relation entre ${member1.first_name} et ${member2.first_name}:\n`;
             output += ` -> ${result.relationship}\n`;

             if (result.lca) {
                 output += `\nAncêtre Commun le Plus Proche (LCA):\n`;
                 output += ` -> ${result.lca.first_name} ${result.lca.last_name} (ID:${result.lca.id})\n`;
                 output += `Distance de ${member1.first_name} à LCA: ${result.distance1} génération(s)\n`;
                 output += `Distance de ${member2.first_name} à LCA: ${result.distance2} génération(s)\n`;
             }

            setAlgoResult(output);

        } catch (error) {
            console.error("Erreur lors de la recherche de relation:", error);
            setAlgoResult(`Erreur lors de la recherche de relation : ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsAlgoLoading(false);
        }
    };

    const handleShortestPath = () => {
         if (!selectedFamily || loadingMembers) {
              setAlgoResult("Veuillez sélectionner une famille avec des membres chargés.");
              return;
         }
        const id1 = parseInt(member1IdInput, 10);
        const id2 = parseInt(member2IdInput, 10);

        if (isNaN(id1) || isNaN(id2)) {
            setAlgoResult("Veuillez entrer des ID de membre valides (nombres).");
            return;
        }

        const member1 = members.find(m => Number(m.id) === id1);
        const member2 = members.find(m => Number(m.id) === id2);

        if (!member1 || !member2) {
            setAlgoResult("Un ou les deux membres spécifiés n'ont pas été trouvés.");
            return;
        }

        setIsAlgoLoading(true);
        setAlgoResult(`Recherche du plus court chemin entre ${member1.first_name} et ${member2.first_name}...`);
        try {
            // Utilisation de la fonction du service importé
            const result: ShortestPathResult | null = genealogyAlgorithmsService.findShortestPath(id1, id2, members, relations);
            if (result && result.path.length > 0) {
                const pathNames = result.path
                    .map(m => `${m.first_name} ${m.last_name} (ID:${m.id})`)
                    .join('\n -> '); // Affichage sur plusieurs lignes pour la lisibilité
                setAlgoResult(
                    `Plus Court Chemin (Dijkstra) entre ${member1.first_name} et ${member2.first_name}:\n` +
                    `Distance: ${result.distance} lien(s)\n\n` +
                    `Chemin:\n -> ${pathNames}`
                );
            } else {
                 setAlgoResult(`Aucun chemin trouvé entre ${member1.first_name} et ${member2.first_name} via les liens enregistrés.`);
            }
        } catch (error) {
            console.error("Erreur lors de la recherche du plus court chemin:", error);
            setAlgoResult(`Erreur lors de la recherche du chemin : ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsAlgoLoading(false);
        }
    };

     // --- Gestion du clic sur un membre récent ---
     const handleRecentMemberClick = (member: Member) => {
         const memberIdNum = Number(member.id);
        setSelectedMemberId(memberIdNum); // Met à jour le contexte (pour FamilyTree)

         // Mettre à jour les inputs pour les algos
         if (!member1IdInput || (member1IdInput && member2IdInput)) { // Si le 1er est vide ou si les deux sont pleins
             setMember1IdInput(String(memberIdNum));
             setMember2IdInput(''); // Effacer le second
         } else if (!member2IdInput) { // Si seul le 1er est rempli
             setMember2IdInput(String(memberIdNum));
         }
     };

    // --- FIN DES HANDLERS ADAPTÉS ---

    // Variante pour l'animation de la sidebar
    const sidebarVariants = {
        open: { width: 320, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        collapsed: { width: 80, transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    const contentVariants = {
        open: { opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.2 } },
        collapsed: { opacity: 0, x: -20, transition: { duration: 0.1 } }
    };

    const iconVariants = {
        open: { opacity: 0, scale: 0.5, transition: { duration: 0.1 } },
        collapsed: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.2 } }
    };

    // Statistiques familiales (placeholder)
    const calculateGenerations = () => {
        if (!members || members.length === 0) return 0;
        // Pourrait utiliser findRelationship pour trouver la distance max à un ancêtre racine ?
        return 4; // Placeholder
    }

    const familyStats = {
        totalMembers: members.length,
        generations: selectedFamily ? calculateGenerations() : 0,
        lastUpdate: selectedFamily ? new Date(selectedFamily.updated_at).toLocaleDateString() : "-"
    };

    return (
        <>
            <motion.div
                className={`fixed top-16 left-0 bottom-0 rounded-r-xl z-20 flex ml-1.5`}
                initial={false}
                animate={isCollapsed ? "collapsed" : "open"}
                variants={sidebarVariants}
                style={{ height: 'calc(100vh - 64px)' }}
            >
                {/* Conteneur réel du panneau avec padding et styles */}
                <div className="h-full w-full bg-black text-gray-100 flex flex-col p-4 pt-6 shadow-lg overflow-hidden">
                    {/* Bouton pour réduire/agrandir */}
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 right-0 translate-x-1/2 p-2 bg-gray-800 text-gray-300 hover:bg-black hover:text-white rounded-full shadow-md z-50 transition-all"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <motion.svg
                            xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </motion.svg>
                    </button>

                    {/* Contenu conditionnel (complètement différent si replié) */}
                    {isCollapsed ? (
                        // --- VUE RÉDUITE ---
                        <motion.div
                            className="flex flex-col items-center space-y-6 mt-10"
                            variants={iconVariants}
                            initial="open"
                            animate="collapsed"
                            exit="open"
                        >
                            {/* --- Icônes inchangées par rapport à votre code --- */}
                            {/* Icône Recherche */}
                            <button className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Rechercher">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            {/* Icône Ajouter Membre */}
                            <button onClick={handleOpenAddModal} className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors" title="Ajouter un membre" disabled={!selectedFamily}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            {/* Icône Famille */}
                            <Link to="/app/families" className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Gérer les familles">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </Link>
                             {/* Icône Algorithmes RO */}
                             <button className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Algorithmes RO">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5-2.986-7.014A8.002 8.002 0 0110 2a8 8 0 0110 10c0 .752-.1 1.477-.292 2.168-.656.83-1.618 1.474-2.74 1.898-1.157.44-2.456.534-3.805.218-.849-.197-1.64-.54-2.343-.994S7.9 16.46 7.5 16c-.4-.46-.5-.9-.5-1.4v-1.2c.8-.4 1.5-1.2 1.5-2.4 0-1.2-.7-2-1.5-2.4V7.6c0-.5.1-.94.5-1.4.4-.46.9-.84 1.5-1.1.6-.26 1.2-.41 1.8-.46.6-.05 1.2-.01 1.7.13.5.14 1 .38 1.5.72.5.34.9.78 1.2 1.3.3.5.5 1.1.5 1.7v.1c-.8.4-1.5 1.2-1.5 2.4 0 1.2.7 2 1.5 2.4v1.2c0 .5-.1.94-.5 1.4z" />
                                 </svg>
                             </button>
                            {/* Icône Statistiques */}
                            <Link to="/app/statistics" className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors" title="Statistiques">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </Link>
                        </motion.div>
                    ) : (
                        // --- VUE COMPLÈTE ---
                        <motion.div
                            className="flex flex-col h-full overflow-hidden"
                            variants={contentVariants}
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                        >
                            {/* Scroll container */}
                            <div className="flex flex-col h-full overflow-y-auto pr-1 custom-scrollbar">
                                {/* Section Titre/Logo */}
                                <div className="mb-6 flex items-center justify-between flex-shrink-0">
                                    <h1 className="text-xl font-bold text-white">
                                        {selectedFamily ? selectedFamily.name : "Aucune famille sélectionnée"}
                                    </h1>
                                </div>

                                {/* Section Famille */}
                                <div className="mb-6 flex-shrink-0">
                                     {/* Code de la section Famille inchangé */}
                                      <div className="flex justify-between items-center mb-3">
                                          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Famille</h2>
                                          <Link
                                              to="/app/families"
                                              className="text-xs text-gray-400 hover:text-white transition-colors"
                                          >
                                              Voir toutes
                                          </Link>
                                      </div>
                                      <div className="flex flex-col space-y-2">
                                          {selectedFamily ? (
                                              <div className="bg-gray-800/50 rounded-lg p-3">
                                                  {/* ... Contenu famille sélectionnée ... */}
                                                   <div className="flex justify-between items-center">
                                                       <div className="flex items-center">
                                                           <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-white mr-3">
                                                               {selectedFamily.name.charAt(0)}
                                                           </div>
                                                           <div>
                                                               <h3 className="font-medium text-white">{selectedFamily.name}</h3>
                                                               <p className="text-xs text-gray-400">
                                                                   {selectedFamily.description && selectedFamily.description.length > 30
                                                                       ? `${selectedFamily.description.substring(0, 30)}...`
                                                                       : selectedFamily.description || "Aucune description"}
                                                               </p>
                                                           </div>
                                                       </div>
                                                       <div className="ml-2">
                                                           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                                                               {selectedFamily.is_public ? 'Public' : 'Privé'}
                                                           </span>
                                                       </div>
                                                   </div>
                                              </div>
                                          ) : (
                                              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                                  {/* ... Contenu aucune famille sélectionnée ... */}
                                                   <p className="text-gray-400 text-sm mb-3">Aucune famille sélectionnée</p>
                                                   <Link
                                                       to="/app/families"
                                                       className="inline-flex items-center justify-center w-full bg-white text-black py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                                   >
                                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                       </svg>
                                                       Choisir une famille
                                                   </Link>
                                                   <button
                                                       onClick={onCreateFamilyClick}
                                                       className="inline-flex items-center justify-center w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium mt-2 hover:bg-gray-600 transition-colors"
                                                   >
                                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                       </svg>
                                                       Créer une famille
                                                   </button>
                                              </div>
                                          )}
                                      </div>
                                </div>

                                {/* Section Actions */}
                                <div className="space-y-2 mb-6 flex-shrink-0">
                                     {/* Code des boutons Actions inchangé */}
                                      <button
                                          onClick={handleOpenAddModal}
                                          className="w-full flex items-center justify-center bg-white text-black py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                                          disabled={!selectedFamily || loadingMembers}
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                          </svg>
                                          Ajouter un membre
                                      </button>
                                      <Link
                                          to="/app/families"
                                          className="w-full flex items-center justify-center bg-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors"
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                          </svg>
                                          Gérer les familles
                                      </Link>
                                      <Link
                                          to="/app/statistics"
                                          className="w-full flex items-center justify-center bg-gray-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors"
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                          </svg>
                                          Voir les statistiques
                                      </Link>
                                </div>

                                {/* --- SECTION ALGORITHMES RO (ADAPTÉE) --- */}
                                <div className="mb-6 flex-shrink-0">
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Algorithmes RO</h2>
                                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                                        {/* Champs pour ID Membre */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="member1Id" className="block text-xs font-medium text-gray-300 mb-1">Membre 1 ID</label>
                                                <input
                                                    type="number"
                                                    id="member1Id"
                                                    value={member1IdInput}
                                                    onChange={(e) => setMember1IdInput(e.target.value)}
                                                    placeholder="Entrez ID"
                                                    className="w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm text-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                                    disabled={!selectedFamily || loadingMembers}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="member2Id" className="block text-xs font-medium text-gray-300 mb-1">Membre 2 ID</label>
                                                <input
                                                    type="number"
                                                    id="member2Id"
                                                    value={member2IdInput}
                                                    onChange={(e) => setMember2IdInput(e.target.value)}
                                                    placeholder="Entrez ID"
                                                    className="w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm text-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
                                                    disabled={!selectedFamily || loadingMembers}
                                                />
                                            </div>
                                        </div>

                                        {/* Boutons d'action */}
                                        <div className="space-y-2">
                                            <button
                                                onClick={handleCalculateConnectivity}
                                                className="w-full flex items-center justify-center bg-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                                disabled={!selectedFamily || loadingMembers || isAlgoLoading}
                                                title="Trouve les groupes de personnes connectées entre elles"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /> {/* Exemple icône connexité */}
                                                </svg>
                                                {isAlgoLoading ? 'Calcul...' : 'Analyser Connexité'}
                                            </button>
                                            <button
                                                onClick={handleFindRelationship} // Nom du handler mis à jour
                                                className="w-full flex items-center justify-center bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                                disabled={!selectedFamily || loadingMembers || isAlgoLoading || !member1IdInput || !member2IdInput}
                                                title="Trouve le lien de parenté entre les deux membres via leur ancêtre commun"
                                            >
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                   <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> {/* Exemple icône relation */}
                                                 </svg>
                                                {isAlgoLoading ? 'Calcul...' : 'Trouver Lien de Parenté'}
                                            </button>
                                             <button
                                                 onClick={handleShortestPath}
                                                 className="w-full flex items-center justify-center bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                                 disabled={!selectedFamily || loadingMembers || isAlgoLoading || !member1IdInput || !member2IdInput}
                                                 title="Trouve le chemin le plus court entre deux membres (via parents, enfants, conjoints)"
                                             >
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                   <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /> {/* Exemple icône chemin */}
                                                 </svg>
                                                 {isAlgoLoading ? 'Calcul...' : 'Plus Court Chemin'}
                                             </button>
                                        </div>

                                        {/* Affichage des résultats */}
                                        {(algoResult || isAlgoLoading) && ( // Afficher la boîte même pendant le chargement
                                            <div className="mt-4 p-3 bg-gray-900 rounded-md border border-gray-700">
                                                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Résultat de l'analyse :</h4>
                                                <pre className="text-xs text-gray-200 whitespace-pre-wrap break-words font-mono leading-relaxed">
                                                    {isAlgoLoading ? "Calcul en cours..." : algoResult}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* --- FIN SECTION ALGORITHMES RO --- */}


                                {/* Liste des membres récents */}
                                {selectedFamily && members.length > 0 && (
                                     <div className="mb-6 flex-shrink-0">
                                         {/* Code Liste Membres Récents inchangé */}
                                          <div className="flex justify-between items-center mb-3">
                                              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Membres récents</h2>
                                          </div>
                                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                              {members
                                                  .slice()
                                                  .sort((a, b) => Number(b.id) - Number(a.id))
                                                  .slice(0, 5)
                                                  .map(member => (
                                                  <motion.div
                                                      key={member.id}
                                                      className="bg-gray-800/50 rounded-lg p-2 flex items-center cursor-pointer hover:bg-gray-700/60 transition-colors"
                                                      whileHover={{ x: 5 }}
                                                       onClick={() => handleRecentMemberClick(member)}
                                                       title={`ID: ${member.id} - Cliquer pour sélectionner`}
                                                  >
                                                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3 flex-shrink-0">
                                                          {member.photo_url ? (
                                                              <img
                                                                  src={member.photo_url}
                                                                  alt={`${member.first_name} ${member.last_name}`}
                                                                  className="w-full h-full object-cover"
                                                                  onError={(e) => (e.currentTarget.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png')}
                                                              />
                                                          ) : (
                                                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                                                                  {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                                                              </div>
                                                          )}
                                                      </div>
                                                      <div className="truncate">
                                                          <h3 className="font-medium text-white text-sm truncate">{member.first_name} {member.last_name}</h3>
                                                          <p className="text-xs text-gray-400 truncate">
                                                              {member.birth_date ? new Date(member.birth_date).getFullYear() : 'N/A'}
                                                              {member.occupation ? ` • ${member.occupation}` : ''}
                                                          </p>
                                                      </div>
                                                  </motion.div>
                                              ))}
                                          </div>
                                     </div>
                                )}

                                {/* Section Statistiques */}
                                <div className="mt-auto pt-6 border-t border-gray-700 flex-shrink-0">
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Aperçu</h2>
                                    <div className="space-y-3">
                                         {/* Code des Stats Items inchangé */}
                                          {/* Stat Item 1 */}
                                          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                               <div className="flex items-center">
                                                   <div className="p-1.5 bg-gray-700 rounded-md mr-3">
                                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                       </svg>
                                                   </div>
                                                   <span className="text-sm text-gray-300">Membres</span>
                                               </div>
                                               <span className="text-sm font-semibold text-white">{familyStats.totalMembers}</span>
                                          </div>
                                          {/* Stat Item 2 */}
                                          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                               <div className="flex items-center">
                                                   <div className="p-1.5 bg-gray-700 rounded-md mr-3">
                                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                       </svg>
                                                   </div>
                                                   <span className="text-sm text-gray-300">Générations</span>
                                               </div>
                                               <span className="text-sm font-semibold text-white">{familyStats.generations}</span>
                                          </div>
                                          {/* Stat Item 3 */}
                                          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                               <div className="flex items-center">
                                                   <div className="p-1.5 bg-gray-700 rounded-md mr-3">
                                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                       </svg>
                                                   </div>
                                                   <span className="text-sm text-gray-300">Mis à jour</span>
                                               </div>
                                               <span className="text-xs font-medium text-gray-400">{familyStats.lastUpdate}</span>
                                          </div>
                                    </div>
                                </div>
                            </div> {/* Fin scroll container */}
                        </motion.div> // Fin Vue Complète
                    )}
                </div> {/* Fin conteneur réel */}
            </motion.div> {/* Fin motion.div principal */}

            {/* Rendu de la Modal pour ajouter un membre */}
            <AddMemberForm
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={() => {
                    handleCloseAddModal();
                    // Rafraîchir les données après ajout pour que les algos aient les dernières infos
                     refreshFamilyData(); // Appel de la fonction du contexte
                }}
            />
        </>
    );
};

export default Sidebar;