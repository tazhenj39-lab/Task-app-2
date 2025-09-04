import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskTag } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon, PencilIcon, CheckIcon, StarIcon } from './IconComponents';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
  monthlyGoals: Record<string, string>;
  onSetGoal: (yearMonth: string, text: string) => void;
  stampedDates: Set<string>;
}

const MonthlyGoal: React.FC<{
  currentMonth: Date;
  goal: string;
  onSetGoal: (yearMonth: string, text: string) => void;
}> = ({ currentMonth, goal, onSetGoal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(goal);

  useEffect(() => {
    setInputValue(goal);
    setIsEditing(false);
  }, [goal, currentMonth]);
  
  const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  const handleSave = () => {
    onSetGoal(yearMonth, inputValue);
    setIsEditing(false);
  };

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-800">今月自分がなりたい姿</h4>
        </div>
        {isEditing ? (
          <button onClick={handleSave} className="p-1.5 text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-colors">
             <CheckIcon className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="mt-2">
        {isEditing ? (
           <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full text-sm px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-gray-400"
            placeholder="目標を設定しましょう"
            autoFocus
          />
        ) : (
          <p className="text-sm text-gray-600 pl-1 min-h-[26px]">
            {goal || <span className="text-gray-500 italic">目標を設定しましょう</span>}
          </p>
        )}
      </div>
    </div>
  );
};


const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, tasks, monthlyGoals, onSetGoal, stampedDates }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const date = task.dueDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const renderCalendarDays = () => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    // Previous month's padding days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`pad-start-${i}`} className="p-1"></div>);
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dayDateStr = toYYYYMMDD(dayDate);
      const isSelected = toYYYYMMDD(selectedDate) === dayDateStr;
      const isToday = toYYYYMMDD(new Date()) === dayDateStr;
      const tasksForDay = tasksByDate[dayDateStr] || [];
      const isStamped = stampedDates.has(dayDateStr);
      
      const tagColors: Record<TaskTag, string> = {
        work: 'bg-blue-500',
        private: 'bg-green-500',
        study: 'bg-purple-500',
        other: 'bg-gray-500',
      };

      const dayClasses = `
        relative flex flex-col items-center justify-center h-12 w-12 rounded-full cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-blue-600 text-white' : ''}
        ${!isSelected && isToday ? 'bg-blue-100 text-blue-700 font-bold' : ''}
        ${!isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
      `;
      
      days.push(
        <div key={dayDateStr} className="p-1 flex items-center justify-center" onClick={() => onDateChange(dayDate)}>
          <div className={dayClasses}>
            {isStamped && (
              <StarIcon className="absolute top-0 right-0 h-4 w-4 text-yellow-400 transform translate-x-1/4 -translate-y-1/4" />
            )}
            <span className="text-sm">{i}</span>
            {tasksForDay.length > 0 && !isSelected && (
              <div className="absolute bottom-1.5 flex space-x-1">
                {[...new Set(tasksForDay.map(t => t.tag))]
                  .slice(0, 3)
                  .map(tag => <div key={tag} className={`h-1.5 w-1.5 rounded-full ${tagColors[tag]}`}></div>)
                }
              </div>
            )}
          </div>
        </div>
      );
    }

    // Next month's padding days
    const totalCells = firstDayOfMonth + daysInMonth;
    const remainingCells = (7 - totalCells % 7) % 7;
    for (let i = 0; i < remainingCells; i++) {
        days.push(<div key={`pad-end-${i}`} className="p-1"></div>);
    }

    return days;
  };

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
       <MonthlyGoal 
        currentMonth={currentMonth}
        goal={monthlyGoals[yearMonth] || ''}
        onSetGoal={onSetGoal}
      />
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="前の月">
          <ChevronLeftIcon className="w-6 h-6 text-gray-500" />
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {year}年 {month + 1}月
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="次の月">
          <ChevronRightIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
        {weekdays.map((day, index) => <div key={day} className={`font-semibold ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}`}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;
