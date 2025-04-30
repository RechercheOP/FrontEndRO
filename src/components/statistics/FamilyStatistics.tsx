import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useFamily } from '../../contexts/FamilyContext';
import Chart from 'chart.js/auto';

const FamilyStatistics: React.FC = () => {
    const { members, relations } = useFamily();
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    // Calcul des statistiques
    const stats = {
        totalMembers: members.length,
        maleCount: members.filter(m => m.gender === 'male').length,
        femaleCount: members.filter(m => m.gender === 'female').length,
        otherCount: members.filter(m => m.gender === 'other').length,
        living: members.filter(m => !m.death_date).length,
        deceased: members.filter(m => m.death_date).length,
        averageAge: calculateAverageAge(),
        oldestMember: findOldestMember(),
        youngestMember: findYoungestMember(),
        generationsCount: calculateGenerations(),
    };

    // Fonction pour calculer l'âge moyen
    function calculateAverageAge() {
        if (members.length === 0) return 0;

        const currentYear = new Date().getFullYear();
        const totalAge = members.reduce((sum, member) => {
            if (!member.birth_date) return sum;

            const birthYear = new Date(member.birth_date).getFullYear();
            const deathYear = member.death_date ? new Date(member.death_date).getFullYear() : currentYear;
            return sum + (deathYear - birthYear);
        }, 0);

        return Math.round(totalAge / members.length);
    }

    // Fonction pour trouver le membre le plus âgé
    function findOldestMember() {
        if (members.length === 0) return null;

        return members.reduce((oldest, current) => {
            if (!current.birth_date) return oldest;
            if (!oldest || new Date(current.birth_date) < new Date(oldest.birth_date)) {
                return current;
            }
            return oldest;
        }, null as any);
    }

    // Fonction pour trouver le membre le plus jeune
    function findYoungestMember() {
        if (members.length === 0) return null;

        return members.reduce((youngest, current) => {
            if (!current.birth_date) return youngest;
            if (!youngest || new Date(current.birth_date) > new Date(youngest.birth_date)) {
                return current;
            }
            return youngest;
        }, null as any);
    }

    // Fonction pour calculer le nombre de générations
    function calculateGenerations() {
        // Cette fonction est simplifiée et devrait être améliorée avec un algorithme plus sophistiqué
        // qui parcourt les relations parent-enfant
        return 4; // Valeur de démonstration
    }

    // Préparation des données pour le graphique par décennie de naissance
    const prepareChartData = () => {
        // Regrouper les membres par décennie de naissance
        const decades: {[key: string]: number} = {};

        members.forEach(member => {
            if (!member.birth_date) return;

            const year = new Date(member.birth_date).getFullYear();
            const decade = Math.floor(year / 10) * 10;
            const decadeLabel = `${decade}-${decade + 9}`;

            if (decades[decadeLabel]) {
                decades[decadeLabel]++;
            } else {
                decades[decadeLabel] = 1;
            }
        });

        // Trier les décennies chronologiquement
        const sortedDecades = Object.keys(decades).sort();

        return {
            labels: sortedDecades,
            datasets: [{
                label: 'Membres par décennie de naissance',
                data: sortedDecades.map(decade => decades[decade]),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
    };

    // Initialisation et mise à jour du graphique
    useEffect(() => {
        // Nettoyer le graphique précédent à chaque render
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, []);

    // Mise à jour du graphique quand les données changent
    useEffect(() => {
        if (!chartRef.current || members.length === 0) return;

        // Détruire le graphique existant s'il y en a un
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        // Créer un nouveau graphique
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
            chartInstanceRef.current = new Chart(ctx, {
                type: 'bar',
                data: prepareChartData(),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 10,
                            cornerRadius: 6,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            },
                            grid: {
                                display: true,
                                color: 'rgba(200, 200, 200, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }, [members]);

    if (members.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-medium text-gray-800">Aucune donnée statistique disponible</h2>
                <p className="text-gray-500 mt-2">Ajoutez des membres à cette famille pour visualiser les statistiques.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Statistiques familiales</h2>
                <p className="text-gray-600 text-sm">Vue d'ensemble de votre arbre généalogique</p>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Carte 1: Distribution par genre */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-600 mb-4">Distribution par genre</h3>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">Hommes</span>
                                    <span className="text-sm font-medium">{stats.maleCount}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${(stats.maleCount / stats.totalMembers) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">Femmes</span>
                                    <span className="text-sm font-medium">{stats.femaleCount}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-pink-500 h-2 rounded-full"
                                        style={{ width: `${(stats.femaleCount / stats.totalMembers) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Carte 2: Âge moyen */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Âge moyen</h3>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-800">{stats.averageAge}</span>
                            <span className="ml-1 text-gray-500 text-sm">ans</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 flex justify-between">
                            <span>{stats.living} membres vivants</span>
                            <span>{stats.deceased} décédés</span>
                        </div>
                    </div>

                    {/* Carte 3: Générations */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Générations</h3>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-800">{stats.generationsCount}</span>
                            <span className="ml-2 text-gray-500 text-sm">générations</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            {stats.totalMembers} membres au total
                        </div>
                    </div>
                </div>

                {/* Graphique des membres par décennie */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">Membres par décennie de naissance</h3>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 h-64">
                        <canvas ref={chartRef} id={`canvasStats-${members.length}`}></canvas>
                    </div>
                </div>

                {/* Section des records */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Membre le plus âgé */}
                    {stats.oldestMember && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                                {stats.oldestMember.photo ? (
                                    <img
                                        src={stats.oldestMember.photo}
                                        alt={stats.oldestMember.first_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        {stats.oldestMember.first_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">Membre le plus âgé</div>
                                <div className="font-medium text-gray-800">
                                    {stats.oldestMember.first_name} {stats.oldestMember.last_name}
                                </div>
                                {stats.oldestMember.birth_date && (
                                    <div className="text-sm text-gray-600">
                                        {new Date(stats.oldestMember.birth_date).toLocaleDateString()}
                                        {stats.oldestMember.death_date ? ` - ${new Date(stats.oldestMember.death_date).toLocaleDateString()}` : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Membre le plus jeune */}
                    {stats.youngestMember && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                                {stats.youngestMember.photo ? (
                                    <img
                                        src={stats.youngestMember.photo}
                                        alt={stats.youngestMember.first_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        {stats.youngestMember.first_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">Membre le plus jeune</div>
                                <div className="font-medium text-gray-800">
                                    {stats.youngestMember.first_name} {stats.youngestMember.last_name}
                                </div>
                                {stats.youngestMember.birth_date && (
                                    <div className="text-sm text-gray-600">
                                        Né le {new Date(stats.youngestMember.birth_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default FamilyStatistics;