import React from 'react';
import { View } from '../App';
import { CalendarIcon, ListBulletIcon, ChartBarIcon, TennisRacketIcon } from './IconComponents';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}> = ({ isActive, onClick, ariaLabel, children }) => {
  const baseClasses = "p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500";
  const activeClasses = "bg-blue-100 text-blue-600";
  const inactiveClasses = "text-gray-500 hover:bg-gray-200 hover:text-gray-800";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  return (
    <header className="bg-gray-50/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200/70">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              タスク管理アプリ

            </h1>
          </div>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <NavButton 
              isActive={view === 'main'}
              onClick={() => setView('main')}
              ariaLabel="カレンダーとタスク入力画面"
            >
              <CalendarIcon className="w-6 h-6"/>
            </NavButton>
            <NavButton 
              isActive={view === 'today'}
              onClick={() => setView('today')}
              ariaLabel="スケジュール画面"
            >
              <ListBulletIcon className="w-6 h-6"/>
            </NavButton>
             <NavButton 
              isActive={view === 'report'}
              onClick={() => setView('report')}
              ariaLabel="経済レポート画面"
            >
              <ChartBarIcon className="w-6 h-6"/>
            </NavButton>
            <NavButton 
              isActive={view === 'tennis'}
              onClick={() => setView('tennis')}
              ariaLabel="テニスの試合結果画面"
            >
              <TennisRacketIcon className="w-6 h-6"/>
            </NavButton>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
