import React, { useState } from 'react';
import FormPage from './pages/FormPage';
import HistoryPage from './pages/HistoryPage';
import PatientDetailPage from './pages/PatientDetailPage';
import { HandWaveIcon, HistoryIcon, UserPlusIcon } from './components/IconComponents';

type PageView = {
    page: 'form' | 'history' | 'patientDetail';
    patientId?: string;
};

const App: React.FC = () => {
    const [view, setView] = useState<PageView>({ page: 'history' });

    const navigateTo = (page: PageView['page'], patientId?: string) => {
        setView({ page, patientId });
         window.scrollTo(0, 0);
    };

    const NavLink: React.FC<{ targetPage: PageView['page']; children: React.ReactNode; icon: React.ReactNode }> = ({ targetPage, children, icon }) => (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                navigateTo(targetPage);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view.page === targetPage
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
        >
            {icon}
            {children}
        </a>
    );
    
    const renderContent = () => {
        switch (view.page) {
            case 'history':
                return <HistoryPage onSelectPatient={(patientId) => navigateTo('patientDetail', patientId)} />;
            case 'patientDetail':
                return <PatientDetailPage patientId={view.patientId!} onBack={() => navigateTo('history')} />;
            case 'form':
            default:
                return <FormPage onFormSubmit={() => navigateTo('history')} />;
        }
    };

    return (
        <div className="min-h-screen">
            <header className="bg-white/80 backdrop-blur-lg shadow-md sticky top-0 z-40 border-b border-slate-200/80">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3 text-2xl font-bold">
                            <HandWaveIcon />
                             <span className="bg-gradient-to-r from-blue-600 to-teal-500 text-transparent bg-clip-text">
                                Ficha de Muñeca
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <NavLink targetPage="form" icon={<UserPlusIcon />} >Nueva Ficha</NavLink>
                            <NavLink targetPage="history" icon={<HistoryIcon />}>Historial</NavLink>
                        </div>
                    </div>
                </nav>
            </header>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
