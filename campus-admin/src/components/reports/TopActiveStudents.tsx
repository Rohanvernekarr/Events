'use client';

import { StudentStats } from '@/types';

interface TopActiveStudentsProps {
  data: StudentStats[];
}

export default function TopActiveStudents({ data }: TopActiveStudentsProps) {
  const medals = ['🥇', '🥈', '🥉'];
  const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50'];
  const borderColors = ['border-yellow-200', 'border-gray-200', 'border-orange-200'];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p>No student data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.slice(0, 3).map((student, index) => (
        <div 
          key={student.id}
          className={`p-4 rounded-lg border-2 ${bgColors[index]} ${borderColors[index]}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{medals[index]}</div>
              <div>
                <h4 className="font-medium text-gray-900">{student.name}</h4>
                <p className="text-sm text-gray-600">{student.college}</p>
                <p className="text-xs text-gray-500">{student.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {student.totalAttendance}
              </div>
              <div className="text-sm text-gray-500">events attended</div>
              <div className="text-xs text-green-600">
                {student.attendanceRate}% rate
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Attendance Progress</span>
              <span>{student.totalAttendance}/{student.totalRegistrations}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${student.attendanceRate}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>No top students data available</p>
          <p className="text-sm">Students will appear here once they start attending events</p>
        </div>
      )}
    </div>
  );
}
