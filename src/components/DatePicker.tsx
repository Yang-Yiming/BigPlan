import { useState } from 'react';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(date);
  };

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
    setShowCalendar(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevDay}
        className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 transition-colors"
        aria-label="Previous day"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="relative">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg border border-gray-300 transition-colors min-w-[200px] text-left"
        >
          {formatDate(selectedDate)}
        </button>

        {showCalendar && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-300 p-4 z-10">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                onDateChange(e.target.value);
                setShowCalendar(false);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleToday}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              >
                今天
              </button>
              <button
                onClick={() => setShowCalendar(false)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleNextDay}
        className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 transition-colors"
        aria-label="Next day"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <button
        onClick={handleToday}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        今天
      </button>
    </div>
  );
}
