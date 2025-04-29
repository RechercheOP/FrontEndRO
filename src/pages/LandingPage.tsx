import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 overflow-hidden relative">
            {/* Formes décoratives */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-200 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute top-64 right-20 w-60 h-60 bg-gray-100 rounded-full opacity-20 blur-2xl"></div>

            <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl relative z-10">
                {/* Navigation */}
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <span className="ml-3 text-xl font-bold">ArborGen</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-black transition-colors">Fonctionnalités</a>
                        <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">Comment ça marche</a>
                        <a href="#about" className="text-gray-600 hover:text-black transition-colors">À propos</a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/app" className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                            Accéder à l'application
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center justify-between py-16">
                    <div className="md:w-1/2 mb-12 md:mb-0">
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            Explorez et visualisez votre histoire familiale
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-600 mb-8 max-w-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Créez, visualisez et partagez votre arbre généalogique avec une interface moderne et intuitive.
                        </motion.p>
                        <motion.div
                            className="flex space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Link to="/app" className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-transform hover:scale-105 transform">
                                Commencer maintenant
                            </Link>
                            <a href="#features" className="bg-white text-black px-6 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-transform hover:scale-105 transform">
                                En savoir plus
                            </a>
                        </motion.div>
                    </div>
                    <motion.div
                        className="md:w-1/2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-black/5 to-black/10 transform rotate-3"></div>
                            <img
                                src="/screen.png"
                                alt="Démonstration de l'arbre généalogique"
                                className="relative z-10 rounded-2xl shadow-2xl border border-gray-200"
                            />
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 text-sm text-black border border-white/20">
                                Interface intuitive
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Section */}
                <section id="features" className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Fonctionnalités clés</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Découvrez ce qui rend ArborGen unique et comment il peut vous aider à explorer votre histoire familiale.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Visualisation interactive</h3>
                            <p className="text-gray-600">
                                Explorez votre arbre généalogique avec une interface interactive permettant de zoomer, naviguer et réorganiser votre histoire familiale.
                            </p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Création intuitive</h3>
                            <p className="text-gray-600">
                                Ajoutez simplement des membres à votre arbre avec notre formulaire intuitif et établissez facilement des relations familiales complexes.
                            </p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Recherche avancée</h3>
                            <p className="text-gray-600">
                                Trouvez rapidement n'importe quel membre de votre famille grâce à notre moteur de recherche avancé avec filtres personnalisables.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section id="how-it-works" className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            ArborGen rend la création et l'exploration d'arbres généalogiques simple grâce à une approche en trois étapes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Créez une famille</h3>
                            <p className="text-gray-600">
                                Commencez par créer votre première famille et ajoutez quelques détails de base à son sujet.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Ajoutez des membres</h3>
                            <p className="text-gray-600">
                                Ajoutez des membres à votre famille en spécifiant leurs informations et leurs relations avec d'autres membres.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Explorez votre arbre</h3>
                            <p className="text-gray-600">
                                Visualisez votre arbre généalogique, explorez les relations et découvrez votre histoire familiale.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="bg-black text-white rounded-3xl p-12 text-center">
                        <h2 className="text-3xl font-bold mb-6">Prêt à explorer votre histoire familiale ?</h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Commencez dès maintenant à créer et à visualiser votre arbre généalogique.
                        </p>
                        <Link
                            to="/app"
                            className="bg-white text-black px-8 py-4 rounded-xl font-medium inline-block hover:bg-gray-100 transition-transform hover:scale-105 transform"
                        >
                            Commencer gratuitement
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer id="about" className="py-12 border-t border-gray-200 mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-lg font-bold">ArborGen</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Une application moderne pour créer, visualiser et explorer des arbres généalogiques de manière interactive.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Produit</h3>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-gray-600 hover:text-black text-sm">Fonctionnalités</a></li>
                                <li><a href="#how-it-works" className="text-gray-600 hover:text-black text-sm">Comment ça marche</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">Tarification</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Ressources</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">Guides</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">Documentation</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">Support</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Entreprise</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">À propos</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">Blog</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">Carrières</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-black text-sm">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 text-sm mb-4 md:mb-0">
                            © {new Date().getFullYear()} ArborGen. Tous droits réservés.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-black">Confidentialité</a>
                            <a href="#" className="text-gray-600 hover:text-black">Conditions</a>
                            <a href="#" className="text-gray-600 hover:text-black">Cookies</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;