import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header />
            <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/4">
                    <Sidebar />
                </div>
                <div className="lg:w-3/4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;