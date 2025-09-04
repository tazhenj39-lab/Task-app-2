import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface ScheduleViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ScheduleView: React.FC<ScheduleViewProps> = ({ tasks, onToggle, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const currentDateStr = toYYYYMMDD(currentDate);

  const tasksForDay = useMemo(() => {
    return tasks
      .filter(task => task.dueDate === currentDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks, currentDateStr]);

  const upcomingTasks = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowStr = toYYYYMMDD(tomorrow);

    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    const oneWeekLaterStr = toYYYYMMDD(oneWeekLater);

    return tasks
      .filter(task => {
        return task.dueDate >= tomorrowStr && task.dueDate <= oneWeekLaterStr;
      })
      .sort((a, b) => {
        const aDateTime = `${a.dueDate}T${a.time}`;
        const bDateTime = `${b.dueDate}T${b.time}`;
        return aDateTime.localeCompare(bDateTime);
      });
  }, [tasks]);

  const groupedUpcomingTasks = useMemo(() => {
    return upcomingTasks.reduce((acc, task) => {
      const date = task.dueDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [upcomingTasks]);


  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="前の日">
          <ChevronLeftIcon className="w-6 h-6 text-slate-500" />
        </button>
        <h3 className="text-lg font-bold text-slate-800 text-center">
          {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </h3>
        <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="次の日">
          <ChevronRightIcon className="w-6 h-6 text-slate-500" />
        </button>
      </div>
      
      <div className="mt-4">
        <h4 className="text-lg font-bold text-slate-800 mb-4">今日のタスク</h4>
        {tasksForDay.length > 0 ? (
          <ul className="space-y-3">
            {tasksForDay.map(task => (
              <TaskItem key={task.id} task={task} onDelete={onDelete} onToggle={onToggle} />
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-center py-4">今日のタスクはありません。</p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h4 className="text-lg font-bold text-slate-800 mb-4">今後の予定 (一週間)</h4>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedUpcomingTasks).map(([date, tasksForDate]) => {
              // Create date object in UTC to avoid timezone issues with formatting
              const [year, month, day] = date.split('-').map(Number);
              const d = new Date(Date.UTC(year, month - 1, day));
              const dateLabel = d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'UTC' });
              return (
                <div key={date}>
                  <p className="font-semibold text-indigo-600 mb-2">{dateLabel}</p>
                  <ul className="space-y-3">
                    {tasksForDate.map(task => (
                      <TaskItem key={task.id} task={task} onDelete={onDelete} onToggle={onToggle} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">今後一週間のタスクはありません。</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;