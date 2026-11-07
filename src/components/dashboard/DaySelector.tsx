'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface DaySelectorProps {
  currentDate: string;
}

export function DaySelector({ currentDate }: DaySelectorProps) {
  const router = useRouter();

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const formatDate = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Use useMemo to ensure consistent rendering
  const weekData = useMemo(() => {
    const today = parseDate(currentDate);
    const currentDay = today.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);
    monday.setUTCDate(today.getUTCDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const weekDays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

    return weekDays.map((day, index) => {
      const date = new Date(monday);
      date.setUTCDate(monday.getUTCDate() + index);
      const dateString = formatDate(date);
      const isSelected = dateString === currentDate;

      return {
        label: day,
        date: dateString,
        isSelected,
      };
    });
  }, [currentDate]);

  const handleDayClick = (date: string) => {
    router.push(`/dashboard?date=${date}`);
  };

  return (
    <div className="flex gap-2 justify-center">
      {weekData.map((day) => (
        <button
          key={day.date}
          onClick={() => handleDayClick(day.date)}
          className={`
            relative flex items-center justify-center
            w-12 h-12 rounded-full
            text-sm font-medium
            transition-all duration-200
            ${
              day.isSelected
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
            }
          `}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
