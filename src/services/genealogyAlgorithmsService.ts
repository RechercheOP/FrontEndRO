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
            adj[sourceId].push({ id: targetId, type: 'child' });

            // Lien Enfant -> Parent
            if (!adj[targetId]) adj[targetId] = [];
            adj[targetId].push({ id: sourceId, type: 'parent' });
        } else if (rel.type === 'spouse') {
            // Lien Conjoint <-> Conjoint (bidirectionnel)
            if (!adj[sourceId]) adj[sourceId] = [];
            adj[sourceId].push({ id: targetId, type: 'spouse' });

            if (!adj[targetId]) adj[targetId] = [];
            adj[targetId].push({ id: sourceId, type: 'spouse' });
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

    if (adj[memberId]) {
        for (const neighbor of adj[memberId]) {
            if (!visited.has(neighbor.id)) {
                dfs(neighbor.id, adj, visited, componentMembers, memberMap);
            }
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

        if (adj[id]) {
            for (const neighbor of adj[id]) {
                // On ne remonte que par les liens 'parent'
                if (neighbor.type === 'parent' && !visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    ancestors.set(neighbor.id, distance + 1);
                    queue.push({ id: neighbor.id, distance: distance + 1 });
                }
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
        return { count: 0, components: [] };
    }

    const adj = buildAdjacencyList(members, relations);
    const visited = new Set<number>();
    const components: Member[][] = [];
    const memberMap = new Map(members.map(m => [Number(m.id), m]));

    for (const member of members) {
        const memberId = Number(member.id);
        if (!visited.has(memberId)) {
            const currentComponentMembers: Member[] = [];
            dfs(memberId, adj, visited, currentComponentMembers, memberMap);
            if (currentComponentMembers.length > 0) {
                components.push(currentComponentMembers);
            }
        }
    }

    return { count: components.length, components };
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
            if (d1 + d2 < dist1 + dist2) {
                dist1 = d1;
                dist2 = d2;
                lcaId = id1;
            }
        }
    });

    if (lcaId === undefined) {
        return { relationship: "Aucun lien de parenté trouvé (pas d'ancêtre commun)." };
    }

    const lca = memberMap.get(lcaId);

    // Interprétation des distances (simplifiée)
    let rel = "";
    if (dist1 === 0) { // member1 est l'ancêtre de member2
        rel = `Ancêtre (${dist2} génération${dist2 > 1 ? 's' : ''} au-dessus)`;
    } else if (dist2 === 0) { // member2 est l'ancêtre de member1
        rel = `Descendant (${dist1} génération${dist1 > 1 ? 's' : ''} en dessous)`;
    } else if (dist1 === 1 && dist2 === 1) {
        rel = "Frères/Soeurs";
    } else if (dist1 === 1 || dist2 === 1) {
        const [uncleDist, niblingDist] = dist1 === 1 ? [dist2, dist1] : [dist1, dist2];
        rel = `Oncle/Tante - Neveu/Nièce (${uncleDist - 1} degré${uncleDist - 1 > 1 ? 's' : ''})`;
    } else {
        // Cousins
        const degree = Math.min(dist1, dist2) - 1;
        const removal = Math.abs(dist1 - dist2);
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
        return null; // Membre(s) non trouvé(s)
    }
     if (startMemberId === endMemberId) {
         const member = memberMap.get(startMemberId)!;
        return { path: [member], distance: 0 };
    }

    const distances: { [id: number]: number } = {};
    const previous: { [id: number]: number | null } = {};
    const pq = new Map<number, number>(); // Simule une Priority Queue: Map<id, distance>

    members.forEach(m => {
        const id = Number(m.id);
        distances[id] = Infinity;
        previous[id] = null;
        pq.set(id, Infinity);
    });

    distances[startMemberId] = 0;
    pq.set(startMemberId, 0);

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

        if (u === undefined) break; // Tous les noeuds restants sont inatteignables

        pq.delete(u);

        if (u === endMemberId) break; // Cible atteinte

        if (adj[u]) {
            for (const neighbor of adj[u]) {
                const v = neighbor.id;
                // Ici, on considère que chaque lien a un coût de 1
                const alt = distances[u] + 1;

                if (alt < distances[v]) {
                    distances[v] = alt;
                    previous[v] = u;
                    pq.set(v, alt); // Mettre à jour la priorité dans la "PQ"
                }
            }
        }
    }

    // Reconstruction du chemin
    const pathMembers: Member[] = [];
    let currentId: number | null = endMemberId;

    if (previous[currentId] !== null || currentId === startMemberId) { // Vérifier si un chemin a été trouvé
        while (currentId !== null) {
            const member = memberMap.get(currentId);
            if (member) {
                pathMembers.unshift(member); // Ajouter au début
            }
            currentId = previous[currentId];
        }
    }

    if (pathMembers.length === 0 || pathMembers[0].id !== String(startMemberId)) {
        return null; // Aucun chemin trouvé
    }

    return {
        path: pathMembers,
        distance: distances[endMemberId],
    };
};