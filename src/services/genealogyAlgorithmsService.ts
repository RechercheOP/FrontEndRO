// src/services/genealogyAlgorithmsService.ts
import { Member } from './memberService';
import { Relation, RelationType } from './relationService';

// --- Types Utilitaires ---
interface AdjacencyList {
    [memberId: number]: { // Les voisins sont les parents, enfants, et conjoints
        id: number;
        type: RelationType | 'child'; // Type de lien vers ce voisin
    }[];
}

export interface ConnectedComponentResult {
    count: number;
    components: Member[][]; // Liste des membres dans chaque composante
    isolatedMembers: Member[]; // Membres sans aucune relation
}

export interface RelationshipResult {
    relationship: string; // Description: "Frères/Soeurs", "Parent/Enfant", "Cousin germain", "Oncle/Nièce", "Aucun lien trouvé", etc.
    lca?: Member; // Plus proche ancêtre commun (Lowest Common Ancestor)
    distance1?: number; // Distance de membre 1 à LCA
    distance2?: number; // Distance de membre 2 à LCA
}

export interface ShortestPathResult {
    path: Member[]; // Chemin incluant le début et la fin
    distance: number; // "Coût" du chemin (nombre de liens)
}

// --- Fonctions Privées (Helpers) ---

/**
 * Construit une liste d'adjacence à partir des membres et relations.
 * Inclut parents, enfants, et conjoints.
 */
const buildAdjacencyList = (members: Member[], relations: Relation[]): AdjacencyList => {
    const adj: AdjacencyList = {};
    const memberMap = new Map(members.map(m => [Number(m.id), m]));

    members.forEach(m => {
        adj[Number(m.id)] = [];
    });

    relations.forEach(rel => {
        const sourceId = Number(rel.source);
        const targetId = Number(rel.target);

        // S'assurer que les membres existent
        if (!memberMap.has(sourceId) || !memberMap.has(targetId)) return;

        if (rel.type === 'parent') {
            // Lien Parent -> Enfant (stocké comme 'child' pour le parent)
            if (!adj[sourceId]) adj[sourceId] = [];
            // Eviter doublons si relation parent existe dans les deux sens par erreur
            if (!adj[sourceId].some(n => n.id === targetId && n.type === 'child')) {
                adj[sourceId].push({ id: targetId, type: 'child' });
            }


            // Lien Enfant -> Parent
            if (!adj[targetId]) adj[targetId] = [];
             if (!adj[targetId].some(n => n.id === sourceId && n.type === 'parent')) {
                adj[targetId].push({ id: sourceId, type: 'parent' });
             }
        } else if (rel.type === 'spouse') {
            // Lien Conjoint <-> Conjoint (bidirectionnel)
            if (!adj[sourceId]) adj[sourceId] = [];
            if (!adj[sourceId].some(n => n.id === targetId && n.type === 'spouse')) {
                adj[sourceId].push({ id: targetId, type: 'spouse' });
            }


            if (!adj[targetId]) adj[targetId] = [];
            if (!adj[targetId].some(n => n.id === sourceId && n.type === 'spouse')) {
                adj[targetId].push({ id: sourceId, type: 'spouse' });
            }
        }
    });

    return adj;
};

/**
 * Parcours en Profondeur (DFS) pour trouver une composante connexe.
 */
const dfs = (
    memberId: number,
    adj: AdjacencyList,
    visited: Set<number>,
    componentMembers: Member[],
    memberMap: Map<number, Member>
): void => {
    visited.add(memberId);
    const member = memberMap.get(memberId);
    if (member) {
        componentMembers.push(member);
    }

    // Vérifier si adj[memberId] existe avant d'itérer
    const neighbors = adj[memberId] || [];
    for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
            dfs(neighbor.id, adj, visited, componentMembers, memberMap);
        }
    }
};

/**
 * Trouve tous les ancêtres d'un membre et leur distance.
 */
const getAncestors = (
    memberId: number,
    adj: AdjacencyList
): Map<number, number> /* Map<ancestorId, distance> */ => {
    const ancestors = new Map<number, number>();
    const queue: { id: number; distance: number }[] = [{ id: memberId, distance: 0 }];
    const visited = new Set<number>([memberId]); // Pour éviter les cycles si données incohérentes

    ancestors.set(memberId, 0); // S'inclut lui-même à distance 0

    while (queue.length > 0) {
        const { id, distance } = queue.shift()!;

        // Vérifier si adj[id] existe
        const neighbors = adj[id] || [];
        for (const neighbor of neighbors) {
            // On ne remonte que par les liens 'parent'
            if (neighbor.type === 'parent' && !visited.has(neighbor.id)) {
                visited.add(neighbor.id);
                ancestors.set(neighbor.id, distance + 1);
                queue.push({ id: neighbor.id, distance: distance + 1 });
            }
        }
    }
    return ancestors;
};


// --- Fonctions Exportées du Service ---

/**
 * Trouve les composantes connexes dans l'arbre généalogique.
 * Utile pour détecter des sous-familles isolées.
 * Utilise un parcours DFS.
 */
export const findConnectedComponents = (
    members: Member[],
    relations: Relation[]
): ConnectedComponentResult => {
    if (!members || members.length === 0) {
        return { count: 0, components: [], isolatedMembers: [] };
    }

    const adj = buildAdjacencyList(members, relations);
    const visited = new Set<number>();
    const components: Member[][] = [];
    const memberMap = new Map(members.map(m => [Number(m.id), m]));
    const isolatedMembers: Member[] = [];
    const membersWithRelations = new Set<number>();

    // Identifier les membres avec relations et ceux sans
    relations.forEach(rel => {
        membersWithRelations.add(Number(rel.source));
        membersWithRelations.add(Number(rel.target));
    });

    members.forEach(member => {
        const memberId = Number(member.id);
        if (!membersWithRelations.has(memberId)) {
            // Ce membre n'a aucune relation listée
            isolatedMembers.push(member);
            visited.add(memberId); // Marquer comme visité, car il formera sa propre "composante" isolée
        }
    });


    // Parcourir uniquement les membres qui ont potentiellement des liens
    for (const member of members) {
        const memberId = Number(member.id);
        // Si le membre a des relations ET n'a pas encore été visité par un DFS précédent
        if (membersWithRelations.has(memberId) && !visited.has(memberId)) {
            const currentComponentMembers: Member[] = [];
            dfs(memberId, adj, visited, currentComponentMembers, memberMap);
            if (currentComponentMembers.length > 0) {
                components.push(currentComponentMembers);
            }
        }
    }

    // Le nombre total de "groupes" est le nombre de composants trouvés + le nombre de membres isolés
    // Cependant, la structure de retour demande count = components.length
    // On retourne les composants réels et la liste séparée des isolés.
    return {
        count: components.length, // Nombre de composants non triviaux (taille > 0, avec relations)
        components: components,
        isolatedMembers: isolatedMembers
     };
};

/**
 * Calcule le degré de parenté entre deux membres.
 * Basé sur la recherche du plus proche ancêtre commun (LCA).
 */
export const findRelationship = (
    member1Id: number,
    member2Id: number,
    members: Member[],
    relations: Relation[]
): RelationshipResult => {
    const adj = buildAdjacencyList(members, relations);
    const memberMap = new Map(members.map(m => [Number(m.id), m]));

    if (!memberMap.has(member1Id) || !memberMap.has(member2Id)) {
        return { relationship: "Membre(s) introuvable(s)." };
    }
    if (member1Id === member2Id) {
        return { relationship: "Même personne." };
    }

    const ancestors1 = getAncestors(member1Id, adj);
    const ancestors2 = getAncestors(member2Id, adj);

    let lcaId: number | undefined = undefined;
    let dist1 = Infinity;
    let dist2 = Infinity;

    // Trouver le LCA avec la plus petite somme de distances
    ancestors1.forEach((d1, id1) => {
        if (ancestors2.has(id1)) {
            const d2 = ancestors2.get(id1)!;
            // Priorité à l'ancêtre le plus "bas" (distance max depuis la racine, OU somme min depuis les enfants)
             // Ici on prend la somme des distances minimale.
            if (d1 + d2 < dist1 + dist2) {
                dist1 = d1;
                dist2 = d2;
                lcaId = id1;
            }
             // En cas d'égalité de somme, on pourrait préférer celui qui est le plus "profond"
             // (le plus grand d1 ou d2) mais la somme minimale est souvent suffisante.
        }
    });

    if (lcaId === undefined) {
        // Vérifier s'ils sont conjoints, car ils n'auront pas d'ancêtre commun via la fonction getAncestors
        const neighbors1 = adj[member1Id] || [];
        if (neighbors1.some(n => n.id === member2Id && n.type === 'spouse')) {
            return { relationship: "Conjoints" };
        }
        return { relationship: "Aucun lien de parenté trouvé (pas d'ancêtre commun ou lien direct détecté)." };
    }

    const lca = memberMap.get(lcaId);

    // Interprétation des distances (simplifiée)
    let rel = "";
    if (dist1 === 0) { // member1 est l'ancêtre de member2
        rel = `Ancêtre / Descendant (${dist2} génération${dist2 > 1 ? 's' : ''} d'écart)`;
    } else if (dist2 === 0) { // member2 est l'ancêtre de member1
        rel = `Ancêtre / Descendant (${dist1} génération${dist1 > 1 ? 's' : ''} d'écart)`;
    } else if (dist1 === 1 && dist2 === 1) {
        rel = "Frères/Soeurs (ou demi-frères/soeurs)";
    } else if (dist1 === 1 || dist2 === 1) {
        const [parentDist, niblingDist] = dist1 === 1 ? [dist2, dist1] : [dist1, dist2];
        // parentDist est la distance du parent commun (LCA) à l'oncle/tante.
        // Si LCA est le parent direct de l'oncle/tante (parentDist=1), alors c'est Oncle/Tante direct.
        // Si parentDist > 1, c'est un grand-oncle/tante, etc.
        // Le calcul degré ici est moins direct. Disons juste Oncle/Tante - Neveu/Nièce pour simplifier.
         if (dist1 === 1 && dist2 === 2) rel = "Oncle/Tante - Neveu/Nièce";
         else if (dist1 === 2 && dist2 === 1) rel = "Oncle/Tante - Neveu/Nièce";
         else rel = "Oncle/Tante - Neveu/Nièce (plus éloigné)"; // Grand-oncle, etc.

    } else {
        // Cousins
        const degree = Math.min(dist1, dist2) - 1; // Degré de cousinage (1=germain, 2=issu de germain)
        const removal = Math.abs(dist1 - dist2); // Écart de génération
        let degreeStr = "";
        if (degree === 1) degreeStr = "germains";
        else if (degree === 2) degreeStr = "issus de germains";
        else degreeStr = `au ${degree}e degré`;

        rel = `Cousins ${degreeStr}`;
        if (removal > 0) {
            rel += ` (${removal} génération${removal > 1 ? 's' : ''} d'écart)`;
        }
    }

    return { relationship: rel, lca, distance1: dist1, distance2: dist2 };
};


/**
 * Trouve le plus court chemin entre deux membres en utilisant Dijkstra.
 * Le "coût" d'un lien (parent, enfant, conjoint) est de 1.
 */
export const findShortestPath = (
    startMemberId: number,
    endMemberId: number,
    members: Member[],
    relations: Relation[]
): ShortestPathResult | null => {
    const adj = buildAdjacencyList(members, relations);
    const memberMap = new Map(members.map(m => [Number(m.id), m]));

    if (!memberMap.has(startMemberId) || !memberMap.has(endMemberId)) {
        console.error("ID de départ ou d'arrivée non trouvé dans memberMap.");
        return null; // Membre(s) non trouvé(s)
    }
     if (startMemberId === endMemberId) {
         const member = memberMap.get(startMemberId)!;
        return { path: [member], distance: 0 };
    }

    const distances: { [id: number]: number } = {};
    const previous: { [id: number]: number | null } = {};
    // Utilisation d'une Map comme file de priorité (simple implémentation)
    const pq = new Map<number, number>(); // Map<id, distance>

    // Initialisation
    memberMap.forEach((_, id) => {
        distances[id] = Infinity;
        previous[id] = null;
    });

    distances[startMemberId] = 0;
    pq.set(startMemberId, 0); // Ajouter le point de départ à la PQ

    while (pq.size > 0) {
        // Extraire le noeud avec la plus petite distance (simulation de PQ)
        let u: number | undefined;
        let minDist = Infinity;
        pq.forEach((dist, id) => {
            if (dist < minDist) {
                minDist = dist;
                u = id;
            }
        });

        // Si u est undefined, cela signifie que les nœuds restants ne sont pas atteignables
        if (u === undefined) {
             console.log("Plus aucun noeud atteignable dans la PQ.");
             break;
         }

        const uDist = distances[u]; // Utiliser la distance stockée qui est correcte
        pq.delete(u);

        // Si on a trouvé la cible ou si la distance est infinie (non atteignable)
        if (u === endMemberId || uDist === Infinity) {
            console.log(`Cible atteinte (u=${u}) ou distance infinie (dist=${uDist}). Arrêt de Dijkstra.`);
            break;
        }


        // Parcourir les voisins
        const neighbors = adj[u] || [];
        for (const neighbor of neighbors) {
            const v = neighbor.id;
            // Ici, on considère que chaque lien a un coût de 1
            const alt = uDist + 1;

            // Si un chemin plus court est trouvé vers v
            if (alt < distances[v]) {
                distances[v] = alt;
                previous[v] = u;
                pq.set(v, alt); // Mettre à jour la priorité dans la "PQ"
            }
        }
    }

    // Reconstruction du chemin
    const pathMembers: Member[] = [];
    let currentId: number | null = endMemberId;

    // Vérifier si un chemin a été trouvé (si la distance n'est pas infinie)
    if (distances[endMemberId] === Infinity) {
        console.log(`Aucun chemin trouvé de ${startMemberId} à ${endMemberId}. Distance infinie.`);
        return null;
    }

    // Remonter les prédécesseurs
    while (currentId !== null) {
        const member = memberMap.get(currentId);
        if (member) {
            pathMembers.unshift(member); // Ajouter au début
        } else {
             console.error(`Membre avec ID ${currentId} non trouvé dans memberMap pendant la reconstruction du chemin.`);
            return null; // Erreur critique si un membre du chemin n'existe pas
        }
        // Si on est revenu au début, on arrête
        if (currentId === startMemberId) {
            break;
        }
        currentId = previous[currentId];
         // Sécurité: éviter boucle infinie si structure de 'previous' est mauvaise
         if (pathMembers.length > memberMap.size) {
             console.error("Boucle infinie détectée lors de la reconstruction du chemin.");
             return null;
         }
    }


    // Vérifier si le chemin reconstruit commence bien par startMemberId
    if (pathMembers.length === 0 || Number(pathMembers[0].id) !== startMemberId) {
        console.log("Échec de la reconstruction du chemin ou chemin non trouvé.", pathMembers);
        return null;
    }

    return {
        path: pathMembers,
        distance: distances[endMemberId],
    };
};

// Exporter un objet contenant toutes les fonctions pour une importation plus propre
const genealogyAlgorithmsService = {
    findConnectedComponents,
    findRelationship,
    findShortestPath
};

export default genealogyAlgorithmsService;