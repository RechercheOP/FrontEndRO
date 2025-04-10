/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Scanne le fichier HTML racine
    "./src/**/*.{js,ts,jsx,tsx}", // Scanne TOUS les fichiers JS/TS/JSX/TSX dans le dossier src et ses sous-dossiers
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

