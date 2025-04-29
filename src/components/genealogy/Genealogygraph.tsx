import { useEffect, useRef, useState, useCallback } from 'react';
import { Network, DataSet, Node, Edge, Options } from 'vis-network/standalone';
import { motion, AnimatePresence } from 'framer-motion';
import { Member } from '../../services/memberService';
import { Relation } from '../../services/relationService';

interface FamilyTreeProps {
    members: Member[];
    relations: Relation[];
    onSelectMember: (member: Member) => void;
}

interface UnionNode {
    id: string;
    parentIds: [number, number];
}

const FamilyTree = ({ members, relations, onSelectMember }: FamilyTreeProps) => {
    const networkRef = useRef<HTMLDivElement>(null);
    const [network, setNetwork] = useState<Network | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(true);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'free'>('hierarchical');
    const [highlightMode, setHighlightMode] = useState<'none' | 'ancestors' | 'descendants'>('none');
    const [selectedNode, setSelectedNode] = useState<number | string | null>(null);
    const [nodes, setNodes] = useState<DataSet<Node> | null>(null);
    const [edges, setEdges] = useState<DataSet<Edge> | null>(null);
    const [showControls, setShowControls] = useState(true);

    // Écouteur d'événement pour redimensionnement
    useEffect(() => {
        const handleResize = () => {
            if (network) {
                network.fit({ animation: true });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [network]);

    // --- 1. Préparation des données pour le graphe ---
    const buildGraphData = useCallback(() => {
        // Map pour accès rapide
        const memberMap = new Map<number, Member>();
        members.forEach(m => memberMap.set(Number(m.id), m));

        // Mapping des enfants → [parents]
        const childToParents = new Map<number, number[]>();
        relations.forEach(rel => {
            if (rel.type === 'parent') {
                const childId = Number(rel.targetId);
                const parentId = Number(rel.sourceId);
                if (!childToParents.has(childId)) childToParents.set(childId, []);
                childToParents.get(childId)!.push(parentId);
            }
        });

        // --- Création des nœuds union uniquement pour enfants à 2 parents ---
        const unionNodes: UnionNode[] = [];
        const unionNodeMap = new Map<string, UnionNode>();
        childToParents.forEach((parents, childId) => {
            if (parents.length === 2) {
                const sortedParents = [...parents].sort((a, b) => a - b) as [number, number];
                const key = sortedParents.join('-');
                if (!unionNodeMap.has(key)) {
                    const unionId = 'U' + (unionNodes.length + 1);
                    const unionNode: UnionNode = { id: unionId, parentIds: sortedParents };
                    unionNodes.push(unionNode);
                    unionNodeMap.set(key, unionNode);
                }
            }
        });

        // --- Calcul des niveaux ---
        // - Membres sans parents : niveau 0
        // - Union : max(niveau parents) +1
        // - Enfant : union+1 si 2 parents, parent+1 si 1 parent
        const levels = new Map<string | number, number>();

        // 1. Membres racines (sans parents)
        members.forEach(member => {
            if (!Array.from(childToParents.keys()).includes(Number(member.id))) {
                levels.set(Number(member.id), 0);
            }
        });

        function getMemberLevel(id: number): number {
            if (levels.has(id)) return levels.get(id)!;
            const parentIds = childToParents.get(id);
            if (!parentIds || parentIds.length === 0) {
                levels.set(id, 0);
                return 0;
            }
            if (parentIds.length === 1) {
                const lvl = getMemberLevel(parentIds[0]) + 1;
                levels.set(id, lvl);
                return lvl;
            }
            // 2 parents → nœud union
            const sorted = [...parentIds].sort((a, b) => a - b) as [number, number];
            const key = sorted.join('-');
            const unionId = unionNodeMap.get(key)?.id;
            if (unionId) {
                const unionLevel = getUnionLevel(unionId);
                levels.set(id, unionLevel + 1);
                return unionLevel + 1;
            }
            // fallback
            const maxLvl = Math.max(...parentIds.map(getMemberLevel));
            levels.set(id, maxLvl + 1);
            return maxLvl + 1;
        }

        function getUnionLevel(unionId: string): number {
            if (levels.has(unionId)) return levels.get(unionId)!;
            const union = unionNodes.find(u => u.id === unionId);
            if (!union) return 0;
            const lvl = Math.max(getMemberLevel(union.parentIds[0]), getMemberLevel(union.parentIds[1])) + 1;
            levels.set(unionId, lvl);
            return lvl;
        }

        members.forEach(member => { getMemberLevel(Number(member.id)); });
        unionNodes.forEach(union => { getUnionLevel(union.id); });

        // Ajustement des conjoints pour qu'ils soient au même niveau
        const processedSpousePairs = new Set<string>();
        relations.forEach(rel => {
            if (rel.type === 'spouse') {
                const id1 = Number(rel.sourceId);
                const id2 = Number(rel.targetId);
                const sortedIds = [id1, id2].sort((a, b) => a - b);
                const pairKey = sortedIds.join('-');

                // Éviter de traiter deux fois la même paire
                if (processedSpousePairs.has(pairKey)) return;
                processedSpousePairs.add(pairKey);

                // Si les deux conjoints ont des niveaux différents, les mettre au même niveau
                if (levels.has(id1) && levels.has(id2)) {
                    const level1 = levels.get(id1)!;
                    const level2 = levels.get(id2)!;

                    // Toujours prendre le niveau le plus bas (plus profond dans l'arbre)
                    const maxLevel = Math.max(level1, level2);

                    // Forcer les deux conjoints à être au même niveau
                    levels.set(id1, maxLevel);
                    levels.set(id2, maxLevel);
                }
            }
        });

        // Pour les nœuds union, assurez-vous que le niveau correspond à celui des parents
        unionNodes.forEach(union => {
            const [parent1, parent2] = union.parentIds;
            const parent1Level = levels.get(parent1) || 0;
            const parent2Level = levels.get(parent2) || 0;

            // Le nœud d'union doit être au même niveau que ses parents
            const parentMaxLevel = Math.max(parent1Level, parent2Level);
            levels.set(union.id, parentMaxLevel);

            // Et maintenant, assurons-nous que les deux parents sont au même niveau
            levels.set(parent1, parentMaxLevel);
            levels.set(parent2, parentMaxLevel);
        });

        // --- Construction des nœuds ---
        const nodesData: Node[] = [];
        members.forEach(member => {
            const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
            const birthYear = member.birthDate ? member.birthDate.substring(0, 4) : '?';
            const deathYear = member.deathDate ? member.deathDate.substring(0, 4) : '';
            const label = fullName + (deathYear
                ? `\n(${birthYear}-${deathYear})`
                : `\n(${birthYear}${member.birthDate ? '-' : ''})`);
            nodesData.push({
                id: member.id,
                label,
                shape: 'circularImage',
                image: member.photoUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', // Fallback image
                borderWidth: 2,
                size: 45,
                level: levels.get(Number(member.id)),
                title: `${fullName}\n${member.occupation || ''}`,
                font: {
                    multi: 'html',
                    face: 'Inter, system-ui, sans-serif'
                },
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.2)',
                    size: 10,
                    x: 0,
                    y: 2
                },
                borderWidthSelected: 4,
                color: {
                    border: member.gender === 'male' ? '#3182CE' :
                        member.gender === 'female' ? '#D53F8C' : '#718096',
                    background: '#FFFFFF',
                    highlight: {
                        border: '#4A5568',
                        background: '#F7FAFC'
                    },
                    hover: {
                        border: '#2D3748',
                        background: '#EDF2F7'
                    }
                }
            });
        });

        unionNodes.forEach(union => {
            nodesData.push({
                id: union.id,
                label: '⚭',
                shape: 'dot',
                size: 20,
                level: levels.get(union.id),
                color: { background: '#fff', border: '#aaa' },
                borderWidth: 1,
                font: { color: '#aaa', size: 8 },
                physics: false,
                title: 'Union/Couple',
                chosen: {
                    node: false, // Désactiver la mise en surbrillance de sélection
                    label: false
                }
            });
        });

        // --- Construction des arêtes ---
        const edgesData: Edge[] = [];
        // Parents → union, union → enfants
        unionNodes.forEach(union => {
            const [parent1, parent2] = union.parentIds;
            edgesData.push({
                id: `P1U-${union.id}`,
                from: parent1,
                to: union.id,
                width: 1.5,
                color: { color: '#bbb' },
                dashes: false,
                arrows: { to: { enabled: true, type: 'arrow' } },
                smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 }
            });
            edgesData.push({
                id: `P2U-${union.id}`,
                from: parent2,
                to: union.id,
                width: 1.5,
                color: { color: '#bbb' },
                dashes: false,
                arrows: { to: { enabled: true, type: 'arrow' } },
                smooth: { enabled: true, type: 'curvedCCW', roundness: 0.2 }
            });
            // Union → enfants
            childToParents.forEach((parents, childId) => {
                if (parents.length === 2) {
                    const sorted = [...parents].sort((a, b) => a - b);
                    if (sorted[0] === union.parentIds[0] && sorted[1] === union.parentIds[1]) {
                        edgesData.push({
                            id: `U${union.id}-C${childId}`,
                            from: union.id,
                            to: childId,
                            width: 2,
                            color: { color: '#59ba00' },
                            label: '',
                            arrows: { to: { enabled: true, type: 'arrow' } },
                            smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.6 }
                        });
                    }
                }
            });
        });
        // Enfant avec un seul parent
        childToParents.forEach((parents, childId) => {
            if (parents.length === 1) {
                edgesData.push({
                    id: `P${parents[0]}-C${childId}`,
                    from: parents[0],
                    to: childId,
                    width: 2,
                    color: { color: '#59ba00' },
                    label: '',
                    arrows: { to: { enabled: true, type: 'arrow' } },
                    smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 }
                });
            }
        });
        // Spouse edges pour couples SANS enfants communs
        const spousePairsDone = new Set<string>();
        relations.forEach(rel => {
            if (rel.type === 'spouse') {
                const id1 = Number(rel.sourceId);
                const id2 = Number(rel.targetId);
                const key = [id1, id2].sort((a, b) => a - b).join('-');
                if (!unionNodeMap.has(key) && !spousePairsDone.has(key)) {
                    edgesData.push({
                        id: `S${id1}-${id2}`,
                        from: id1,
                        to: id2,
                        color: { color: '#e67e22' },
                        width: 1.5,
                        dashes: true,
                        label: 'conjoints',
                        arrows: {},
                        smooth: { enabled: true, type: 'curvedCW', roundness: 0.3 }
                    });
                    spousePairsDone.add(key);
                }
            }
        });

        return { nodes: nodesData, edges: edgesData, unionNodeMap, childToParents };
    }, [members, relations]);

    // Fonction pour mettre en évidence les ancêtres
    const highlightAncestors = useCallback((nodeId: number | string) => {
        if (!nodes || !edges) return;

        // Vérifier si c'est un nœud union
        if (typeof nodeId === 'string' && nodeId.startsWith('U')) {
            return; // Ne pas mettre en évidence les ancêtres pour les nœuds union
        }

        const numericId = Number(nodeId);
        const { childToParents } = buildGraphData();

        // Ensemble pour suivre les ancêtres
        const ancestorIds = new Set<number>();

        // Fonction récursive pour trouver les ancêtres
        const findAncestors = (id: number) => {
            const parents = childToParents.get(id) || [];
            parents.forEach(parentId => {
                if (!ancestorIds.has(parentId)) {
                    ancestorIds.add(parentId);
                    findAncestors(parentId);
                }
            });
        };

        // Commencer la recherche
        findAncestors(numericId);

        // Mise à jour visuelle des nœuds
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            const currentId = node.id;
            const numCurrentId = typeof currentId === 'string' && !currentId.startsWith('U')
                ? Number(currentId)
                : null;

            if (currentId === nodeId) {
                // Nœud sélectionné
                nodes.update({
                    id: currentId,
                    borderWidth: 4,
                    color: { border: '#F39C12', background: '#FFFFFF' },
                    font: { color: '#000000', bold: true }
                });
            } else if (numCurrentId && ancestorIds.has(numCurrentId)) {
                // Ancêtre
                nodes.update({
                    id: currentId,
                    borderWidth: 3,
                    color: { border: '#3498DB', background: '#EBF5FB' },
                    font: { color: '#2980B9', bold: true }
                });
            } else if (!String(currentId).startsWith('U')) {
                // Autres nœuds (pas les unions)
                nodes.update({
                    id: currentId,
                    borderWidth: 2,
                    color: {
                        border: '#E0E0E0',
                        background: '#F5F5F5'
                    },
                    font: { color: '#9E9E9E', bold: false }
                });
            }
        });

        // Mise à jour visuelle des arêtes
        const allEdges = edges.get();
        allEdges.forEach(edge => {
            const fromId = typeof edge.from === 'string' && !edge.from.startsWith('U')
                ? Number(edge.from)
                : edge.from;
            const toId = typeof edge.to === 'string' && !edge.to.startsWith('U')
                ? Number(edge.to)
                : edge.to;

            const isAncestorPath =
                (ancestorIds.has(fromId as number) && toId === nodeId) ||
                (ancestorIds.has(fromId as number) && ancestorIds.has(toId as number));

            edges.update({
                id: edge.id,
                width: isAncestorPath ? 3 : 1,
                color: isAncestorPath ? { color: '#3498DB' } : { color: '#E0E0E0' }
            });
        });
    }, [nodes, edges, buildGraphData]);

    // Fonction pour mettre en évidence les descendants
    const highlightDescendants = useCallback((nodeId: number | string) => {
        if (!nodes || !edges) return;

        // Vérifier si c'est un nœud union
        if (typeof nodeId === 'string' && nodeId.startsWith('U')) {
            return; // Ne pas mettre en évidence les descendants pour les nœuds union
        }

        const numericId = Number(nodeId);

        // Construire un map de parent -> [enfants]
        const parentToChildren = new Map<number, number[]>();
        relations.forEach(rel => {
            if (rel.type === 'parent') {
                const parentId = Number(rel.sourceId);
                const childId = Number(rel.targetId);
                if (!parentToChildren.has(parentId)) parentToChildren.set(parentId, []);
                parentToChildren.get(parentId)!.push(childId);
            }
        });

        // Ensemble pour suivre les descendants
        const descendantIds = new Set<number>();

        // Fonction récursive pour trouver les descendants
        const findDescendants = (id: number) => {
            const children = parentToChildren.get(id) || [];
            children.forEach(childId => {
                if (!descendantIds.has(childId)) {
                    descendantIds.add(childId);
                    findDescendants(childId);
                }
            });
        };

        // Commencer la recherche
        findDescendants(numericId);

        // Mise à jour visuelle des nœuds
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            const currentId = node.id;
            const numCurrentId = typeof currentId === 'string' && !currentId.startsWith('U')
                ? Number(currentId)
                : null;

            if (currentId === nodeId) {
                // Nœud sélectionné
                nodes.update({
                    id: currentId,
                    borderWidth: 4,
                    color: { border: '#F39C12', background: '#FFFFFF' },
                    font: { color: '#000000', bold: true }
                });
            } else if (numCurrentId && descendantIds.has(numCurrentId)) {
                // Descendant
                nodes.update({
                    id: currentId,
                    borderWidth: 3,
                    color: { border: '#2ECC71', background: '#EAFAF1' },
                    font: { color: '#27AE60', bold: true }
                });
            } else if (!String(currentId).startsWith('U')) {
                // Autres nœuds (pas les unions)
                nodes.update({
                    id: currentId,
                    borderWidth: 2,
                    color: {
                        border: '#E0E0E0',
                        background: '#F5F5F5'
                    },
                    font: { color: '#9E9E9E', bold: false }
                });
            }
        });

        // Mise à jour visuelle des arêtes
        const allEdges = edges.get();
        allEdges.forEach(edge => {
            const fromId = typeof edge.from === 'string' && !edge.from.startsWith('U')
                ? Number(edge.from)
                : edge.from;
            const toId = typeof edge.to === 'string' && !edge.to.startsWith('U')
                ? Number(edge.to)
                : edge.to;

            const isDescendantPath =
                (fromId === nodeId && descendantIds.has(toId as number)) ||
                (descendantIds.has(fromId as number) && descendantIds.has(toId as number));

            edges.update({
                id: edge.id,
                width: isDescendantPath ? 3 : 1,
                color: isDescendantPath ? { color: '#2ECC71' } : { color: '#E0E0E0' }
            });
        });
    }, [nodes, edges, relations]);

    // Fonction pour réinitialiser la mise en évidence
    const resetHighlighting = useCallback(() => {
        if (!nodes || !edges) return;

        // Réinitialiser tous les nœuds
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            const currentId = node.id;
            if (String(currentId).startsWith('U')) {
                // Nœud union
                nodes.update({
                    id: currentId,
                    borderWidth: 1,
                    color: { background: '#fff', border: '#aaa' },
                    font: { color: '#aaa', size: 8 }
                });
            } else {
                // Nœud membre
                const member = members.find(m => Number(m.id) === Number(currentId));
                nodes.update({
                    id: currentId,
                    borderWidth: 2,
                    color: {
                        border: member?.gender === 'male' ? '#3182CE' :
                            member?.gender === 'female' ? '#D53F8C' : '#718096',
                        background: '#FFFFFF',
                        highlight: {
                            border: '#4A5568',
                            background: '#F7FAFC'
                        },
                        hover: {
                            border: '#2D3748',
                            background: '#EDF2F7'
                        }
                    },
                    font: {
                        color: '#000000',
                        bold: false
                    }
                });
            }
        });

        // Réinitialiser toutes les arêtes
        const allEdges = edges.get();
        allEdges.forEach(edge => {
            const edgeId = String(edge.id);

            if (edgeId.startsWith('P1U-') || edgeId.startsWith('P2U-')) {
                // Arête parent → union
                edges.update({
                    id: edge.id,
                    width: 1.5,
                    color: { color: '#bbb' }
                });
            } else if (edgeId.startsWith('U')) {
                // Arête union → enfant
                edges.update({
                    id: edge.id,
                    width: 2,
                    color: { color: '#59ba00' }
                });
            } else if (edgeId.startsWith('P')) {
                // Arête parent → enfant (cas d'un seul parent)
                edges.update({
                    id: edge.id,
                    width: 2,
                    color: { color: '#59ba00' }
                });
            } else if (edgeId.startsWith('S')) {
                // Arête conjoint
                edges.update({
                    id: edge.id,
                    width: 1.5,
                    color: { color: '#e67e22' }
                });
            } else {
                // Autre type d'arête
                edges.update({
                    id: edge.id,
                    width: 1.5,
                    color: { color: '#aaaaaa' }
                });
            }
        });
    }, [nodes, edges, members]);

    // Mettre à jour la mise en évidence lorsque le mode change
    useEffect(() => {
        if (selectedNode === null || highlightMode === 'none') {
            resetHighlighting();
            return;
        }

        if (highlightMode === 'ancestors') {
            highlightAncestors(selectedNode);
        } else if (highlightMode === 'descendants') {
            highlightDescendants(selectedNode);
        }
    }, [highlightMode, selectedNode, highlightAncestors, highlightDescendants, resetHighlighting]);

    useEffect(() => {
        if (!networkRef.current || !members.length) return;

        const graphData = buildGraphData();
        const nodeDataset = new DataSet<Node>(graphData.nodes);
        const edgeDataset = new DataSet<Edge>(graphData.edges);

        setNodes(nodeDataset);
        setEdges(edgeDataset);

        const options: Options = {
            layout: {
                hierarchical: viewMode === 'hierarchical' ? {
                    enabled: true,
                    direction: 'UD',
                    sortMethod: 'directed',
                    nodeSpacing: 130,
                    levelSeparation: 180,
                    blockShifting: true,
                    edgeMinimization: true,
                    parentCentralization: true,
                    treeSpacing: 200
                } : {
                    enabled: false
                }
            },
            physics: viewMode === 'hierarchical' ? {
                enabled: false
            } : {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.3,
                    springLength: 250,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.5
                }
            },
            nodes: {
                borderWidth: 2,
                size: 40,
                color: {
                    border: '#718096',
                    background: '#ffffff',
                    highlight: {
                        border: '#0a72bc',
                        background: '#f3f3f3'
                    },
                    hover: {
                        border: '#444444',
                        background: '#f9f9f9'
                    }
                },
                font: {
                    color: '#000000',
                    background: 'rgb(255,255,255)',
                    size: 14,
                    face: 'Inter, system-ui, sans-serif'
                },
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.15)',
                    size: 8,
                    x: 0,
                    y: 2
                }
            },
            edges: {
                width: 1.5,
                selectionWidth:3,
                color: {
                    color: '#000000',
                    highlight: '#333333',
                    hover: '#555555'
                },
                smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical' },
                arrows: { to: true }
            },
            interaction: {
                hover: true,
                multiselect: false,
                navigationButtons: false,
                keyboard: true,
                tooltipDelay: 200,
                zoomView: true,
                dragView: true
            }
        };

        const net = new Network(networkRef.current, { nodes: nodeDataset, edges: edgeDataset }, options);
        setNetwork(net);

        // Sélection d'un membre
        net.on('selectNode', params => {
            const selId = params.nodes[0];
            setSelectedNode(selId);

            // Si on clique un nœud union, on ignore, sinon onSelectMember
            if (typeof selId === 'number' || !String(selId).startsWith('U')) {
                const member = members.find(m => Number(m.id) === Number(selId));
                if (member) onSelectMember(member);
            }
        });

        net.on('deselectNode', () => {
            setSelectedNode(null);
            setHighlightMode('none');
        });

        net.on('doubleClick', params => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                net.focus(nodeId, {
                    scale: 1.2,
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        });

        return () => {
            net.destroy();
        };
    }, [members, relations, onSelectMember, buildGraphData, viewMode]);

    // Gestion du mode plein écran
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            const element = networkRef.current?.parentElement as HTMLElement;
            if (element?.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.error('Erreur lors de la tentative de plein écran :', err);
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => {
                    console.error('Erreur lors de la sortie du plein écran :', err);
                });
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    // Gestionnaire d'événements de changement d'état plein écran
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Rendu de la minimap (à implémenter complètement)
    const renderMiniMap = () => {
        return (
            <div className="absolute bottom-4 right-4 w-40 h-40 border border-gray-200 bg-white shadow-md rounded-lg overflow-hidden z-10">
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={() => setShowMiniMap(false)}
                        className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-full">
            <div
                ref={networkRef}
                className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-inner"
            />

            {/* Contrôles interactifs */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-white px-4 py-3 rounded-full shadow-lg border border-gray-100"
                    >
                        <button
                            onClick={() => network?.fit({ animation: { duration: 1000, easingFunction: 'easeInOutQuad' } })}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Ajuster à l'écran"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                        </button>

                        <button
                            onClick={() => network?.zoomIn(0.2, { animation: true })}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Zoom avant"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </button>

                        <button
                            onClick={() => network?.zoomOut(0.2, { animation: true })}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Zoom arrière"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                            </svg>
                        </button>

                        <div className="w-px h-6 bg-gray-200 self-center"></div>

                        <button
                            onClick={() => setViewMode(viewMode === 'hierarchical' ? 'free' : 'hierarchical')}
                            className={`p-2 rounded-full transition-colors ${viewMode === 'hierarchical' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                            title={viewMode === 'hierarchical' ? 'Passer en vue libre' : 'Passer en vue hiérarchique'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={viewMode === 'hierarchical'
                                    ? "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                                    : "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"}
                                />
                            </svg>
                        </button>

                        {selectedNode && typeof selectedNode !== 'string' && !String(selectedNode).startsWith('U') && (
                            <>
                                <div className="w-px h-6 bg-gray-200 self-center"></div>

                                <button
                                    onClick={() => setHighlightMode(highlightMode === 'ancestors' ? 'none' : 'ancestors')}
                                    className={`p-2 rounded-full transition-colors ${highlightMode === 'ancestors' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                    title="Mettre en évidence les ancêtres"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setHighlightMode(highlightMode === 'descendants' ? 'none' : 'descendants')}
                                    className={`p-2 rounded-full transition-colors ${highlightMode === 'descendants' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
                                    title="Mettre en évidence les descendants"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div className="w-px h-6 bg-gray-200 self-center"></div>

                        {!showMiniMap && (
                            <button
                                onClick={() => setShowMiniMap(true)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                title="Afficher la minimap"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </button>
                        )}

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isFullscreen
                                    ? "M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                                    : "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                                } />
                            </svg>
                        </button>

                        <button
                            onClick={() => setShowControls(false)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Masquer les contrôles"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bouton pour montrer les contrôles quand ils sont cachés */}
            {!showControls && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setShowControls(true)}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-3 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50"
                    title="Afficher les contrôles"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </motion.button>
            )}

            {/* Mini carte si activée */}
            {showMiniMap && renderMiniMap()}
        </div>
    );
};

export default FamilyTree;