import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_STUDENTS } from './src/data/sampleStudents';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory + file persistence for student submissions and teacher PIN
const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let teacherPin = '1234';
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    if (config.teacherPin) {
      teacherPin = config.teacherPin;
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ teacherPin }, null, 2));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

interface StudentRecord {
  id: string;
  name: string;
  nickname: string;
  gender: string;
  glasses: string;
  clothingColor: string;
  mbtiStyle: string;
  socksColor: string;
  interest: string;
  subject: string;
  avatarBg?: string;
  note?: string;
  submittedAt: string;
}

let students: StudentRecord[] = [];

if (fs.existsSync(STUDENTS_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(STUDENTS_FILE, 'utf-8'));
    if (Array.isArray(loaded) && loaded.length > 0) {
      students = loaded.map((s) => {
        // If it's one of the default sample students (s1~s16), synchronize name and nickname
        const sampleMatch = SAMPLE_STUDENTS.find((sample) => sample.id === s.id);
        if (sampleMatch && (s.nickname.includes(s.name) || !s.name || s.nickname === s.name)) {
          return {
            ...s,
            name: sampleMatch.name,
            nickname: sampleMatch.nickname,
          };
        }
        return {
          ...s,
          name: s.name || s.nickname || '이름 없음',
          nickname: s.nickname || s.name || '별명 없음',
        };
      });
      saveStudents();
    } else {
      students = (SAMPLE_STUDENTS as unknown as StudentRecord[]);
      saveStudents();
    }
  } catch (err) {
    console.error('Error reading students file:', err);
    students = (SAMPLE_STUDENTS as unknown as StudentRecord[]);
    saveStudents();
  }
} else {
  students = (SAMPLE_STUDENTS as unknown as StudentRecord[]);
  saveStudents();
}

function saveStudents() {
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));
  } catch (err) {
    console.error('Error saving students:', err);
  }
}

// ==================== API ROUTES ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 1. Get all students
app.get('/api/students', (req, res) => {
  res.json(students);
});

// 2. Submit or update student info
app.post('/api/students', (req, res) => {
  const {
    id,
    name,
    nickname,
    gender,
    glasses,
    clothingColor,
    mbtiStyle,
    socksColor,
    interest,
    subject,
    note,
    avatarBg,
  } = req.body;

  const validName = (name && typeof name === 'string' && name.trim()) || (nickname && typeof nickname === 'string' && nickname.trim());
  const validNickname = (nickname && typeof nickname === 'string' && nickname.trim()) || validName;

  if (!validName || !validNickname) {
    return res.status(400).json({ error: '이름과 닉네임을 모두 입력해 주세요.' });
  }

  // Check if updating an existing student
  if (id && typeof id === 'string') {
    const existingIndex = students.findIndex((s) => s.id === id);
    if (existingIndex !== -1) {
      const updated: StudentRecord = {
        ...students[existingIndex],
        name: validName,
        nickname: validNickname,
        gender: gender || students[existingIndex].gender,
        glasses: glasses || students[existingIndex].glasses,
        clothingColor: clothingColor || students[existingIndex].clothingColor,
        mbtiStyle: mbtiStyle || students[existingIndex].mbtiStyle,
        socksColor: socksColor || students[existingIndex].socksColor,
        interest: interest || students[existingIndex].interest,
        subject: subject || students[existingIndex].subject,
        note: note !== undefined ? String(note).trim() : students[existingIndex].note,
        avatarBg: avatarBg || students[existingIndex].avatarBg,
      };
      students[existingIndex] = updated;
      saveStudents();
      return res.json(updated);
    }
  }

  const newStudent: StudentRecord = {
    id: id || `student-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: validName,
    nickname: validNickname,
    gender: gender || '남학생',
    glasses: glasses || '안경 안 씀',
    clothingColor: clothingColor || '무채색(검정·흰·회색)',
    mbtiStyle: mbtiStyle || 'E (활발·사교적)',
    socksColor: socksColor || '흰색',
    interest: interest || '게임·e스포츠',
    subject: subject || '수학·과학',
    note: note ? String(note).trim() : undefined,
    avatarBg: avatarBg || 'bg-indigo-100 text-indigo-700 border-indigo-300',
    submittedAt: new Date().toISOString(),
  };

  students.unshift(newStudent);
  saveStudents();

  res.status(201).json(newStudent);
});

// 3. Delete student (Teacher operation)
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  students = students.filter((s) => s.id !== id);
  saveStudents();
  res.json({ success: true, count: students.length });
});

// 4. Batch update / reset (Teacher operation)
app.post('/api/students/bulk', (req, res) => {
  const { action, sampleData } = req.body;
  if (action === 'clear') {
    students = [];
    saveStudents();
    return res.json({ success: true, students: [] });
  } else if (action === 'sample' && Array.isArray(sampleData)) {
    students = sampleData;
    saveStudents();
    return res.json({ success: true, students });
  }

  res.status(400).json({ error: '잘못된 작업 요청입니다.' });
});

// 5. Verify teacher PIN
app.post('/api/teacher/verify', (req, res) => {
  const { pin } = req.body;
  const inputPin = typeof pin === 'string' ? pin.trim() : String(pin || '').trim();
  if (inputPin === teacherPin) {
    res.json({ success: true, pin: teacherPin });
  } else {
    res.status(401).json({ success: false, error: '비밀번호가 올바르지 않습니다.' });
  }
});

// 6. Change teacher PIN
app.post('/api/teacher/change-pin', (req, res) => {
  const { oldPin, newPin } = req.body;
  const inputOldPin = typeof oldPin === 'string' ? oldPin.trim() : String(oldPin || '').trim();
  const inputNewPin = typeof newPin === 'string' ? newPin.trim() : String(newPin || '').trim();

  if (inputOldPin !== teacherPin) {
    return res.status(401).json({ 
      success: false, 
      error: '현재 비밀번호가 일치하지 않습니다. (초기 기본 비밀번호: 1234)' 
    });
  }
  if (!inputNewPin || inputNewPin.length < 4) {
    return res.status(400).json({ 
      success: false, 
      error: '새 비밀번호는 최소 4자리 이상이어야 합니다.' 
    });
  }

  teacherPin = inputNewPin;
  saveConfig();
  res.json({ success: true });
});

// ==================== VITE MIDDLEWARE SETUP ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
