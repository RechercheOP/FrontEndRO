import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainLayout from './components/layout/MainLayout';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            </Routes>
        </Router>
    );
}

export default App;