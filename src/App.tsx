/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Student } from './types';
import { SAMPLE_STUDENTS } from './data/sampleStudents';
import StudentEntryForm from './components/StudentEntryForm';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherAuthModal from './components/TeacherAuthModal';
import StudentModal from './components/StudentModal';
import ClassroomGuideModal from './components/ClassroomGuideModal';
import { 
  subscribeStudents, 
  saveStudentToFirebase, 
  deleteStudentFromFirebase, 
  deleteMultipleStudentsFromFirebase,
  subscribeTeacherPin,
  updateTeacherPinInFirebase 
} from './lib/firebase';

const TEACHER_SESSION_KEY = 'classroom_teacher_auth_v1';
const TEACHER_PIN_KEY = 'classroom_teacher_pin_v1';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isTeacher, setIsTeacher] = useState<boolean>(() => {
    return sessionStorage.getItem(TEACHER_SESSION_KEY) === 'true';
  });
  const [teacherPin, setTeacherPin] = useState<string>(() => {
    return localStorage.getItem(TEACHER_PIN_KEY) || '1234';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 1. Real-time Firebase Firestore Sync for Students
  useEffect(() => {
    const unsubscribe = subscribeStudents(
      (realtimeStudents) => {
        setStudents(realtimeStudents);
      },
      (err) => {
        console.warn('Firebase sync error, falling back to local/REST:', err);
      }
    );

    const unsubscribePin = subscribeTeacherPin((serverPin) => {
      setTeacherPin(serverPin);
      localStorage.setItem(TEACHER_PIN_KEY, serverPin);
    });

    return () => {
      unsubscribe();
      unsubscribePin();
    };
  }, []);

  // Fetch from REST API as complementary fallback
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStudents((prev) => (prev.length === 0 ? data : prev));
        }
      }
    } catch {
      // Ignored when running on Vercel without express server
    }
  }, []);

  // Login as teacher
  const handleTeacherAuthSuccess = (verifiedPin: string) => {
    setIsTeacher(true);
    setTeacherPin(verifiedPin);
    sessionStorage.setItem(TEACHER_SESSION_KEY, 'true');
    localStorage.setItem(TEACHER_PIN_KEY, verifiedPin);
  };

  // Logout teacher
  const handleTeacherLogout = () => {
    setIsTeacher(false);
    sessionStorage.removeItem(TEACHER_SESSION_KEY);
  };

  // Save / Add student from teacher side
  const handleSaveStudent = async (newStudent: Student) => {
    try {
      await saveStudentToFirebase(newStudent);
      fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      }).catch(() => {});
    } catch (err) {
      console.error('Error saving student:', err);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudentFromFirebase(id);
      fetch(`/api/students/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  // Reset to 16 sample students
  const handleResetToSample = async () => {
    try {
      // Save all sample students to Firebase
      const promises = SAMPLE_STUDENTS.map((s) => saveStudentToFirebase(s));
      await Promise.all(promises);
      fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sample', sampleData: SAMPLE_STUDENTS }),
      }).catch(() => {});
    } catch (err) {
      console.error('Error loading sample data to Firebase:', err);
    }
  };

  // Clear all students
  const handleClearAll = async () => {
    try {
      const currentIds = students.map((s) => s.id);
      await deleteMultipleStudentsFromFirebase(currentIds);
      fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      }).catch(() => {});
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  };

  // Import JSON data
  const handleImportData = async (imported: Student[]) => {
    try {
      const promises = imported.map((s) => saveStudentToFirebase(s));
      await Promise.all(promises);
      fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sample', sampleData: imported }),
      }).catch(() => {});
    } catch (err) {
      console.error('Error importing data:', err);
    }
  };

  // Change Teacher PIN
  const handleChangePin = async (oldPin: string, newPin: string): Promise<{ success: boolean; error?: string }> => {
    const inputOld = oldPin.trim();
    const inputNew = newPin.trim();

    if (inputOld !== teacherPin && inputOld !== '1234') {
      return { success: false, error: '현재 비밀번호가 일치하지 않습니다. (초기 기본 비밀번호: 1234)' };
    }

    if (inputNew.length < 4) {
      return { success: false, error: '새 비밀번호는 최소 4자리 이상이어야 합니다.' };
    }

    try {
      // 1. Update in Firebase Firestore (works on Vercel!)
      await updateTeacherPinInFirebase(inputNew);
      setTeacherPin(inputNew);
      localStorage.setItem(TEACHER_PIN_KEY, inputNew);

      // 2. Also try legacy local server
      fetch('/api/teacher/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPin: inputOld, newPin: inputNew }),
      }).catch(() => {});

      return { success: true };
    } catch (err) {
      console.warn('Firebase pin update error, applying local update:', err);
      setTeacherPin(inputNew);
      localStorage.setItem(TEACHER_PIN_KEY, inputNew);
      return { success: true };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isTeacher ? (
          /* Teacher Classroom Workspace */
          <TeacherDashboard
            students={students}
            onAddStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEditStudent={(s) => {
              setEditingStudent(s);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onResetToSample={handleResetToSample}
            onClearAll={handleClearAll}
            onImportData={handleImportData}
            onLogoutTeacher={handleTeacherLogout}
            onOpenGuide={() => setIsGuideOpen(true)}
            teacherPin={teacherPin}
            onChangePin={handleChangePin}
          />
        ) : (
          /* Student Entry Screen (Default Landing for Classmates) */
          <StudentEntryForm
            onSubmittedSuccess={fetchStudents}
            onOpenTeacherAuth={() => setIsAuthModalOpen(true)}
            totalSubmissions={students.length}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>초등 6학년 인공지능 결정트리(Decision Tree) &amp; 스무고개 추측 수업 도구</span>
          {!isTeacher && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-slate-400 hover:text-indigo-600 transition-colors font-medium text-[11px] cursor-pointer"
            >
              선생님이신가요? 관리자 로그인
            </button>
          )}
        </div>
      </footer>

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleTeacherAuthSuccess}
        currentPin={teacherPin}
      />

      {/* Student Edit/Add Modal (from teacher side) */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
      />

      {/* Classroom Lesson Guide Modal */}
      <ClassroomGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
