import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FamilyProvider } from './contexts/FamilyContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import FamilySelectionPage from './pages/FamilySelectionPage';
import StatisticsPage from './pages/StatisticsPage';
import MainLayout from './components/layout/MainLayout';

function App() {
    return (
        <FamilyProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/families" element={<FamilySelectionPage />} />
                    <Route
                        path="/app"
                        element={
                            <MainLayout>
                                <HomePage />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/statistics"
                        element={
                            <MainLayout>
                                <StatisticsPage />
                            </MainLayout>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </FamilyProvider>
    );
}

export default App;