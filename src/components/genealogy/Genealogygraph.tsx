import { useEffect, useRef, useState, useCallback } from 'react';
import { Network, DataSet, Node, Edge, Options } from 'vis-network/standalone';
import { motion, AnimatePresence } from 'framer-motion';

// Types pour l'arbre généalogique
interface FamilyMember {
    id: number;
    name: string;
    birthDate: string;
    birthPlace: string;
    deathDate: string;
    occupation: string;
    bio: string;
    photoUrl: string;
    relations?: Array<{type: string, name: string}>;
}

interface Relation {
    from: number;
    to: number;
    type: 'conjoint' | 'parent' | 'enfant' | 'frère/sœur';
}

interface FamilyTreeProps {
    members: FamilyMember[];
    relations: Relation[];
    onSelectMember: (member: FamilyMember) => void;
}

const FamilyTree = ({ members, relations, onSelectMember }: FamilyTreeProps) => {
    const networkRef = useRef<HTMLDivElement>(null);
    const [network, setNetwork] = useState<Network | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(true);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'free'>('hierarchical');
    const [highlightMode, setHighlightMode] = useState<'none' | 'ancestors' | 'descendants'>('none');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const [nodes, setNodes] = useState<DataSet<Node> | null>(null);
    const [edges, setEdges] = useState<DataSet<Edge> | null>(null);
    const [showControls, setShowControls] = useState(true);

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

    // Fonction pour calculer les niveaux hiérarchiques
    const calculateNodeLevels = useCallback(() => {
        const nodeLevels = new Map<number, number>();
        const memberIds = new Set(members.map(m => m.id));
        const childrenMap = new Map<number, number[]>();
        const parentsMap = new Map<number, number[]>();
        const conjugalPairs = new Map<string, number[]>();

        // Identifier les relations de type conjoint
        relations.forEach(rel => {
            if (rel.type === 'conjoint') {
                const pair = [rel.from, rel.to].sort((a, b) => a - b);
                const pairKey = `${pair[0]}-${pair[1]}`;
                conjugalPairs.set(pairKey, pair);
            }
        });

        // Construire les maps de relations parentales
        relations.forEach(rel => {
            if (rel.type === 'parent') {
                if (memberIds.has(rel.from) && memberIds.has(rel.to)) {
                    if (!childrenMap.has(rel.from)) childrenMap.set(rel.from, []);
                    childrenMap.get(rel.from)!.push(rel.to);

                    if (!parentsMap.has(rel.to)) parentsMap.set(rel.to, []);
                    parentsMap.get(rel.to)!.push(rel.from);
                }
            }
        });

        // Trouver les racines (nœuds sans parents)
        const roots: number[] = [];
        members.forEach(member => {
            if (!parentsMap.has(member.id) || parentsMap.get(member.id)!.length === 0) {
                roots.push(member.id);
            }
        });

        // Calculer les niveaux par BFS depuis les racines
        const queue: { id: number; level: number }[] = roots.map(id => ({ id, level: 0 }));
        const visited = new Set<number>();

        roots.forEach(rootId => {
            nodeLevels.set(rootId, 0);
            visited.add(rootId);
        });

        let head = 0;
        while (head < queue.length) {
            const { id: parentId, level: currentLevel } = queue[head++];

            const children = childrenMap.get(parentId) || [];
            children.forEach(childId => {
                const existingLevel = nodeLevels.get(childId);
                const newLevel = currentLevel + 1;

                if (existingLevel === undefined || newLevel > existingLevel) {
                    nodeLevels.set(childId, newLevel);
                    if (!visited.has(childId)) {
                        visited.add(childId);
                    }
                    queue.push({ id: childId, level: newLevel });
                } else if (!visited.has(childId)) {
                    visited.add(childId);
                    queue.push({ id: childId, level: existingLevel });
                }
            });
        }

        // Assigner un niveau 0 par défaut aux nœuds non atteints
        members.forEach(member => {
            if (!nodeLevels.has(member.id)) {
                nodeLevels.set(member.id, 0);
            }
        });

        // Ajuster les niveaux pour les conjoints
        conjugalPairs.forEach(pair => {
            const [id1, id2] = pair;
            const level1 = nodeLevels.get(id1) || 0;
            const level2 = nodeLevels.get(id2) || 0;

            // Prendre le niveau le plus élevé des deux
            const maxLevel = Math.max(level1, level2);
            nodeLevels.set(id1, maxLevel);
            nodeLevels.set(id2, maxLevel);
        });

        return nodeLevels;
    }, [members, relations]);

    // Fonction pour créer les nœuds et les arêtes
    const createNetworkData = useCallback(() => {
        const nodeLevels = calculateNodeLevels();

        // Convertir les membres en nœuds vis.js
        const nodeDataset = new DataSet<Node>(
            members.map(member => ({
                id: member.id,
                label: member.name + (member.deathDate ? `\n(${member.birthDate.substring(0, 4)}-${member.deathDate.substring(0, 4)})` : `\n(${member.birthDate.substring(0, 4)}-)`),
                shape: 'circularImage',
                image: member.photoUrl,
                borderWidth: 2,
                size: 45,
                title: `${member.name}\n${member.occupation}`,
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
                level: nodeLevels.get(member.id) // Utiliser le niveau calculé
            }))
        );

        // Convertir les relations en arêtes vis.js
        const edgeDataset = new DataSet<Edge>(
            relations.map((relation, index) => {
                let color, label, dashes, width, smooth;

                switch (relation.type) {
                    case 'conjoint':
                        color = { color: '#ff0000', hover: '#ff0000', highlight: '#ff0000' };
                        label = 'marié';
                        dashes = false;
                        width = 2;
                        smooth = {
                            enabled: true,
                            type: 'curvedCW',
                            roundness: 0.2,
                            forceDirection: 'horizontal'
                        };
                        break;
                    case 'parent':
                        color = { color: '#faf03c', hover: '#e7a30f', highlight: '#ff6c24' };
                        label = 'parent';
                        dashes = false;
                        width = 1.5;
                        smooth = { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.5 };
                        break;
                    case 'enfant':
                        color = { color: '#faf03c', hover: '#e7a30f', highlight: '#000000' };
                        label = 'enfant';
                        dashes = false;
                        width = 1.5;
                        smooth = { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.5 };
                        break;
                    case 'frère/sœur':
                        color = { color: '#777777', hover: '#999999', highlight: '#000000' };
                        label = 'frère/sœur';
                        dashes = [5, 5];
                        width = 1;
                        smooth = { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.5 };
                        break;
                    default:
                        color = { color: '#faf03c', hover: '#e7a30f', highlight: '#000000' };
                        label = relation.type;
                        dashes = false;
                        width = 1;
                        smooth = { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.5 };
                }

                return {
                    id: index,
                    from: relation.from,
                    to: relation.to,
                    label,
                    dashes,
                    color,
                    width,
                    smooth,
                    font: {
                        color: '#000000',
                        size: 10,
                        background: 'rgba(255, 255, 255, 0.8)',
                        strokeWidth: 0
                    }
                };
            })
        );

        setNodes(nodeDataset);
        setEdges(edgeDataset);
        return { nodes: nodeDataset, edges: edgeDataset };
    }, [members, relations, calculateNodeLevels]);

    // Fonction pour obtenir les options du réseau
    const getNetworkOptions = useCallback(() => {
        const baseOptions: Options = {
            nodes: {
                borderWidth: 2,
                size: 45,
                color: {
                    border: '#fa0202',
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
                    face: 'Inter, system-ui, sans-serif',
                    strokeWidth: 0,
                    align: 'center'
                },
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.2)',
                    size: 10,
                    x: 0,
                    y: 2
                }
            },
            edges: {
                width: 1.5,
                color: {
                    color: '#000000',
                    highlight: '#333333',
                    hover: '#555555'
                },
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'vertical'
                },
                font: {
                    color: '#000000',
                    size: 11,
                    strokeWidth: 0,
                    align: 'middle',
                    background: 'rgb(255,255,255)'
                },
                arrows: {
                    to: true,
                    from: false
                },
                selectionWidth: 3
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

        // Options spécifiques au mode hiérarchique
        if (viewMode === 'hierarchical') {
            return {
                ...baseOptions,
                layout: {
                    hierarchical: {
                        direction: 'UD',
                        sortMethod: 'directed',
                        nodeSpacing: 180,
                        levelSeparation: 180,
                        blockShifting: true,
                        edgeMinimization: true,
                        parentCentralization: true,
                        treeSpacing: 200
                    }
                },
                physics: {
                    hierarchicalRepulsion: {
                        nodeDistance: 220,
                        springLength: 200,
                        springConstant: 0.01,
                        damping: 0.09
                    },
                    solver: 'hierarchicalRepulsion'
                }
            };
        } else {
            // Options pour le mode libre
            return {
                ...baseOptions,
                layout: {
                    randomSeed: 2,
                    improvedLayout: true
                },
                physics: {
                    barnesHut: {
                        gravitationalConstant: -2000,
                        centralGravity: 0.3,
                        springLength: 250,
                        springConstant: 0.04,
                        damping: 0.09
                    },
                    solver: 'barnesHut'
                }
            };
        }
    }, [viewMode]);

    // Fonction pour mettre en évidence les ancêtres
    const highlightAncestors = useCallback((nodeId: number) => {
        if (!nodes || !edges) return;

        // Clone des nœuds et arêtes
        const allNodes = nodes.get();
        const allEdges = edges.get();

        // Ensemble pour suivre les ancêtres trouvés
        const ancestorIds = new Set<number>();

        // Fonction récursive pour trouver les ancêtres
        const findAncestors = (id: number) => {
            // Trouver les arêtes où ce nœud est l'enfant
            const parentEdges = allEdges.filter(edge =>
                edge.to === id && (edge.label === 'parent' || edge.label === 'père' || edge.label === 'mère')
            );

            // Pour chaque arête trouvée, ajouter le parent aux ancêtres
            parentEdges.forEach(edge => {
                const parentId = edge.from as number;
                if (!ancestorIds.has(parentId)) {
                    ancestorIds.add(parentId);
                    findAncestors(parentId);
                }
            });
        };

        // Commencer la recherche
        findAncestors(nodeId);

        // Mettre à jour l'apparence des nœuds
        allNodes.forEach(node => {
            if (node.id === nodeId) {
                nodes.update({
                    id: node.id,
                    borderWidth: 3,
                    color: { background: '#ffffff', border: '#d6b900' }
                });
            } else if (ancestorIds.has(node.id as number)) {
                nodes.update({
                    id: node.id,
                    borderWidth: 2,
                    color: { background: '#f0f9ff', border: '#3b82f6' }
                });
            } else {
                nodes.update({
                    id: node.id,
                    borderWidth: 1,
                    color: { background: '#f8f8f8', border: '#d1d5db' }
                });
            }
        });

        // Mettre à jour l'apparence des arêtes
        allEdges.forEach(edge => {
            const isAncestorEdge =
                (ancestorIds.has(edge.from as number) && edge.to === nodeId) ||
                (ancestorIds.has(edge.from as number) && ancestorIds.has(edge.to as number));

            edges.update({
                id: edge.id,
                width: isAncestorEdge ? 2 : 1,
                color: isAncestorEdge ? { color: '#3b82f6' } : { color: '#d1d5db' }
            });
        });
    }, [nodes, edges]);

    // Fonction pour mettre en évidence les descendants
    const highlightDescendants = useCallback((nodeId: number) => {
        if (!nodes || !edges) return;

        // Clone des nœuds et arêtes
        const allNodes = nodes.get();
        const allEdges = edges.get();

        // Ensemble pour suivre les descendants trouvés
        const descendantIds = new Set<number>();

        // Fonction récursive pour trouver les descendants
        const findDescendants = (id: number) => {
            // Trouver les arêtes où ce nœud est le parent
            const childEdges = allEdges.filter(edge =>
                edge.from === id && (edge.label === 'parent' || edge.label === 'père' || edge.label === 'mère')
            );

            // Pour chaque arête trouvée, ajouter l'enfant aux descendants
            childEdges.forEach(edge => {
                const childId = edge.to as number;
                if (!descendantIds.has(childId)) {
                    descendantIds.add(childId);
                    findDescendants(childId);
                }
            });
        };

        // Commencer la recherche
        findDescendants(nodeId);

        // Mettre à jour l'apparence des nœuds
        allNodes.forEach(node => {
            if (node.id === nodeId) {
                nodes.update({
                    id: node.id,
                    borderWidth: 3,
                    color: { background: '#ffffff', border: '#000000' }
                });
            } else if (descendantIds.has(node.id as number)) {
                nodes.update({
                    id: node.id,
                    borderWidth: 2,
                    color: { background: '#f0fdf4', border: '#22c55e' }
                });
            } else {
                nodes.update({
                    id: node.id,
                    borderWidth: 1,
                    color: { background: '#f8f8f8', border: '#d1d5db' }
                });
            }
        });

        // Mettre à jour l'apparence des arêtes
        allEdges.forEach(edge => {
            const isDescendantEdge =
                (edge.from === nodeId && descendantIds.has(edge.to as number)) ||
                (descendantIds.has(edge.from as number) && descendantIds.has(edge.to as number));

            edges.update({
                id: edge.id,
                width: isDescendantEdge ? 2 : 1,
                color: isDescendantEdge ? { color: '#22c55e' } : { color: '#d1d5db' }
            });
        });
    }, [nodes, edges]);

    // Fonction pour réinitialiser la mise en évidence
    const resetHighlighting = useCallback(() => {
        if (!nodes || !edges) return;

        // Réinitialiser tous les nœuds
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            nodes.update({
                id: node.id,
                borderWidth: 3,
                color: {
                    background: 'rgba(0,0,0,0.38)',
                    border: '#000000',
                    highlight: {
                        border: '#4e9bf1',
                        background: '#f3f3f3'
                    },
                    hover: {
                        border: '#0073f4',
                        background: '#f9f9f9'
                    }
                }
            });
        });

        // Réinitialiser toutes les arêtes
        const allEdges = edges.get();
        allEdges.forEach(edge => {
            let color, width;
            const edgeLabel = edge.label;

            switch (edgeLabel) {
                case 'marié':
                    color = { color: '#0066ff', hover: '#ff0044', highlight: '#ff0000' };
                    width = 2;
                    break;
                case 'parent':
                case 'père':
                case 'mère':
                    color = { color: '#59ba00', hover: '#489701', highlight: '#01a34a' };
                    width = 1.5;
                    break;
                case 'enfant':
                    color = { color: '#59ba00', hover: '#489701', highlight: '#01a34a' };
                    width = 1.5;
                    break;
                case 'frère/sœur':
                    color = { color: '#777777', hover: '#999999', highlight: '#000000' };
                    width = 1;
                    break;
                default:
                    color = { color: '#aaaaaa', hover: '#cccccc', highlight: '#000000' };
                    width = 1;
            }

            edges.update({
                id: edge.id,
                width,
                color
            });
        });
    }, [nodes, edges]);

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

    // Initialiser le réseau
    useEffect(() => {
        if (!networkRef.current) return;

        const { nodes: nodeDataset, edges: edgeDataset } = createNetworkData();
        const options = getNetworkOptions();

        // Créer le réseau
        const newNetwork = new Network(networkRef.current, { nodes: nodeDataset, edges: edgeDataset }, options);
        setNetwork(newNetwork);

        // Gestion des événements
        newNetwork.on("selectNode", function(params) {
            const selectedNodeId = params.nodes[0];
            setSelectedNode(selectedNodeId);

            const selectedMember = members.find(m => m.id === selectedNodeId);
            if (selectedMember) {
                onSelectMember(selectedMember);
            }
        });

        newNetwork.on("deselectNode", function() {
            setSelectedNode(null);
            setHighlightMode('none');
        });

        newNetwork.on("doubleClick", function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                newNetwork.focus(nodeId, {
                    scale: 1.2,
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        });

        // Nettoyage
        return () => {
            newNetwork.destroy();
        };
    }, [members, relations, onSelectMember, createNetworkData, getNetworkOptions]);

    // Reconfigurer le réseau quand le mode de vue change
    useEffect(() => {
        if (network) {
            const options = getNetworkOptions();
            network.setOptions(options);
        }
    }, [network, viewMode, getNetworkOptions]);

    // Gestion du mode plein écran
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            const element = networkRef.current?.parentElement as HTMLElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
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

    // Rendu de la minimap
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

                        {selectedNode && (
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
                                    : "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
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