import { useState } from 'react';
import { motion } from 'framer-motion';
import MemberDetailModal from "../components/genealogy/MemberDetails.tsx";
import FamilyTree from "../components/genealogy/Genealogygraph.tsx";

const HomePage = () => {
    // État pour gérer le membre sélectionné
    const [selectedMember, setSelectedMember] = useState<any>(null);


    const familyMembers = [
        {
            id: 1,
            name: "Jean Dupont",
            birthDate: "1920-05-15",
            deathDate: "2005-11-20",
            birthPlace: "Paris, France",
            occupation: "Ingénieur",
            bio: "Fondateur de l'entreprise familiale. A servi pendant la Seconde Guerre mondiale.",
            photoUrl: "https://randomuser.me/api/portraits/men/1.jpg",
            relations: [
                { type: "parent", name: "Pierre Dupont" },
                { type: "parent", name: "Claire Dupont" },
                { type: "conjoint", name: "Marie Martin" }
            ]
        },
        {
            id: 2,
            name: "Marie Martin",
            birthDate: "1925-08-22",
            deathDate: "2010-03-10",
            birthPlace: "Lyon, France",
            occupation: "Infirmière",
            bio: "A travaillé à l'hôpital local pendant 40 ans. Passionnée de jardinage.",
            photoUrl: "https://randomuser.me/api/portraits/women/1.jpg",
            relations: [
                { type: "parent", name: "Pierre Dupont" },
                { type: "parent", name: "Claire Dupont" },
                { type: "conjoint", name: "Jean Dupont" }
            ]
        },
        {
            id: 3,
            name: "Pierre Dupont",
            birthDate: "1950-07-30",
            deathDate: "",
            birthPlace: "Paris, France",
            occupation: "Médecin",
            bio: "Spécialiste en cardiologie. A publié plusieurs articles médicaux.",
            photoUrl: "https://randomuser.me/api/portraits/men/2.jpg",
            relations: [
                { type: "enfant", name: "Jean Dupont" },
                { type: "enfant", name: "Marie Martin" },
                { type: "parent", name: "Thomas Dupont" },
                { type: "conjoint", name: "Sophie Lambert" }
            ]
        },
        {
            id: 4,
            name: "Sophie Lambert",
            birthDate: "1955-02-14",
            deathDate: "",
            birthPlace: "Marseille, France",
            occupation: "Professeure",
            bio: "Enseigne la littérature française à l'université. Auteur de deux romans.",
            photoUrl: "https://randomuser.me/api/portraits/women/2.jpg",
            relations: [
                { type: "parent", name: "Thomas Dupont" },
                { type: "conjoint", name: "Pierre Dupont" }
            ]
        },
        {
            id: 5,
            name: "Thomas Dupont",
            birthDate: "1980-11-05",
            deathDate: "",
            birthPlace: "Lyon, France",
            occupation: "Avocat",
            bio: "Spécialisé en droit des affaires. Marié avec deux enfants.",
            photoUrl: "https://randomuser.me/api/portraits/men/3.jpg",
            relations: [
                { type: "enfant", name: "Pierre Dupont" },
                { type: "enfant", name: "Sophie Lambert" },
                { type: "parent", name: "Lucas Dupont" },
                { type: "parent", name: "Emma Dupont" },
                { type: "conjoint", name: "Julie Bernard" }
            ]
        },
        {
            id: 6,
            name: "Julie Bernard",
            birthDate: "1982-04-18",
            deathDate: "",
            birthPlace: "Toulouse, France",
            occupation: "Architecte",
            bio: "A conçu plusieurs bâtiments primés. Passionnée d'art moderne.",
            photoUrl: "https://randomuser.me/api/portraits/women/3.jpg",
            relations: [
                { type: "parent", name: "Lucas Dupont" },
                { type: "parent", name: "Emma Dupont" },
                { type: "conjoint", name: "Thomas Dupont" }
            ]
        },
        {
            id: 7,
            name: "Lucas Dupont",
            birthDate: "2010-09-12",
            deathDate: "",
            birthPlace: "Lyon, France",
            occupation: "Étudiant",
            bio: "Élève au lycée. Passionné de football et de programmation.",
            photoUrl: "https://randomuser.me/api/portraits/men/4.jpg",
            relations: [
                { type: "enfant", name: "Thomas Dupont" },
                { type: "enfant", name: "Julie Bernard" }
            ]
        },
        {
            id: 8,
            name: "Emma Dupont",
            birthDate: "2012-03-25",
            deathDate: "",
            birthPlace: "Lyon, France",
            occupation: "Étudiante",
            bio: "Aime la danse et la musique. Souhaite devenir vétérinaire.",
            photoUrl: "https://randomuser.me/api/portraits/women/4.jpg",
            relations: [
                { type: "enfant", name: "Thomas Dupont" },
                { type: "enfant", name: "Julie Bernard" }
            ]
        },
        {
            id: 9,
            name: "Claire Dupont",
            birthDate: "1952-12-03",
            deathDate: "",
            birthPlace: "Paris, France",
            occupation: "Artiste",
            bio: "Peintre renommée. Expositions internationales.",
            photoUrl: "https://randomuser.me/api/portraits/women/5.jpg",
            relations: [
                { type: "enfant", name: "Jean Dupont" },
                { type: "enfant", name: "Marie Martin" },
                { type: "conjoint", name: "Jacques Leroy" }
            ]
        },
        {
            id: 10,
            name: "Jacques Leroy",
            birthDate: "1948-06-19",
            deathDate: "",
            birthPlace: "Nice, France",
            occupation: "Journaliste",
            bio: "Correspondant à l'étranger pendant 20 ans. Maintenant à la retraite.",
            photoUrl: "https://randomuser.me/api/portraits/men/5.jpg",
            relations: [
                { type: "conjoint", name: "Claire Dupont" }
            ]
        }
    ];
    const familyRelations = [
        // Relations parentales (sans label explicite sur l'arête pour alléger)
        { from: 1, to: 3, type:"parent" }, // Utilise le label pour identifier le type, mais on peut le cacher visuellement
        { from: 2, to: 3, type:"parent" },
        { from: 1, to: 2, type:"conjoint" },
        { from: 3, to: 5, type:"parent" },
        { from: 1, to: 6, type:"conjoint" },
        { from: 4, to: 5, type:"parent" },
        { from: 5, to: 7, type:"parent" },
        { from: 6, to: 7, type:"parent" },
        { from: 5, to: 8, type:"parent" },
        { from: 6, to: 8, type:"parent" },
        { from: 1, to: 9, type:"parent" },
        { from: 2, to: 9, type:"parent" },

        // Relations de couple (avec un label 'marié' ou symbole, et style différent)
        // IMPORTANT: Pour un layout hiérarchique propre, on utilise un nœud 'union' invisible
        // { from: 1, to: 2, label: "marié", dashes: true, color: { color: "#888888" } }, // Remplacé par noeud union
        // { from: 3, to: 4, label: "marié", dashes: true, color: { color: "#888888" } }, // Remplacé par noeud union
        // { from: 5, to: 6, label: "marié", dashes: true, color: { color: "#888888" } }, // Remplacé par noeud union
        // { from: 9, to: 10, label: "marié", dashes: true, color: { color: "#888888" } }, // Remplacé par noeud union
    ];
    // Fonction pour gérer la sélection d'un membre
    const handleSelectMember = (member) => {
        setSelectedMember(member);
    };

    return (
        <div className="relative z-0 flex flex-col" style={{ minHeight: 'calc(100vh - 6rem)' }}>
            {/* Cercles décoratifs en arrière-plan */}
            <div className="fixed -top-40 -left-40 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="fixed bottom-60 right-10 w-80 h-80 bg-gray-200 rounded-full opacity-30 blur-3xl"></div>

            {/* Conteneur principal avec flex-grow pour occuper l'espace disponible */}
            <div className="flex-grow flex flex-col">
                {/* Visualisation de l'arbre - maintenant responsive */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-hidden backdrop-blur-sm flex-grow">
                    <FamilyTree
                        members={familyMembers}
                        relations={familyRelations}
                        onSelectMember={handleSelectMember}
                    />
                </div>

                {/* Espace en bas si nécessaire */}
                <div className="h-0"></div>
            </div>

            <MemberDetailModal
                selectedMember={selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        </div>
    );
};

export default HomePage;