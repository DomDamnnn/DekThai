import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  School,
  GraduationCap,
  Zap,
  CheckCircle2,
  AlertCircle,
  Bell,
  Shield,
  LogOut,
  HelpCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Camera,
  Star,
  ClipboardCheck,
  Inbox,
  Users,
  Building2,
  Settings2,
  Languages,
  Sun,
  Moon,
  Plus,
  X,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/Cards';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/hooks/useAppSettings';
import { applyAppTheme } from '@/lib/appSettings';

const TH = {
  studentTitle:
    '\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c\u0e19\u0e31\u0e01\u0e40\u0e23\u0e35\u0e22\u0e19',
  studentSubtitle:
    '\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0020\u0e23\u0e39\u0e1b\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e15\u0e31\u0e27\u0020\u0e04\u0e27\u0e32\u0e21\u0e40\u0e1b\u0e47\u0e19\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0020\u0e41\u0e25\u0e30\u0e2a\u0e16\u0e34\u0e15\u0e34\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13',
  editProfile:
    '\u0e41\u0e01\u0e49\u0e44\u0e02\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c',
  settings: '\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32',
  viewProgress:
    '\u0e14\u0e39\u0e04\u0e27\u0e32\u0e21\u0e04\u0e37\u0e1a\u0e2b\u0e19\u0e49\u0e32',
  stackNow: '\u0053\u0074\u0061\u0063\u006b\u0020\u0e1b\u0e31\u0e08\u0e08\u0e38\u0e1a\u0e31\u0e19',
  onTime: '\u0e2a\u0e48\u0e07\u0e15\u0e23\u0e07\u0e40\u0e27\u0e25\u0e32',
  backlog: '\u0e07\u0e32\u0e19\u0e04\u0e49\u0e32\u0e07',
  bestStreak: '\u0e2a\u0e16\u0e34\u0e15\u0e34\u0e2a\u0e39\u0e07\u0e2a\u0e38\u0e14',
  day: '\u0e27\u0e31\u0e19',
  task: '\u0e07\u0e32\u0e19',
  anonymousMode:
    '\u0e42\u0e2b\u0e21\u0e14\u0e44\u0e21\u0e48\u0e40\u0e1b\u0e34\u0e14\u0e40\u0e1c\u0e22\u0e0a\u0e37\u0e48\u0e2d',
  anonymousDesc:
    '\u0e0b\u0e48\u0e2d\u0e19\u0e0a\u0e37\u0e48\u0e2d\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e1a\u0e19\u0e2b\u0e19\u0e49\u0e32\u0e08\u0e31\u0e14\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a',
  notifications:
    '\u0e01\u0e32\u0e23\u0e41\u0e08\u0e49\u0e07\u0e40\u0e15\u0e37\u0e2d\u0e19',
  privacy:
    '\u0e19\u0e42\u0e22\u0e1a\u0e32\u0e22\u0e04\u0e27\u0e32\u0e21\u0e40\u0e1b\u0e47\u0e19\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27',
  help: '\u0e28\u0e39\u0e19\u0e22\u0e4c\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e2b\u0e25\u0e37\u0e2d',
  logout: '\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a',
  editDialog:
    '\u0e41\u0e01\u0e49\u0e44\u0e02\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c',
  nameLabel:
    '\u0e0a\u0e37\u0e48\u0e2d\u0e17\u0e35\u0e48\u0e41\u0e2a\u0e14\u0e07',
  emailLabel: '\u0e2d\u0e35\u0e40\u0e21\u0e25',
  phoneLabel: '\u0e40\u0e1a\u0e2d\u0e23\u0e4c\u0e42\u0e17\u0e23',
  schoolLabel: '\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19',
  gradeLabel: '\u0e23\u0e30\u0e14\u0e31\u0e1a\u0e0a\u0e31\u0e49\u0e19',
  cancel: '\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01',
  save: '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01',
  avatarDialog:
    '\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e23\u0e39\u0e1b\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c',
  saveSuccess:
    '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08',
  saveSuccessDesc:
    '\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e16\u0e39\u0e01\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e41\u0e25\u0e49\u0e27',
  saveError:
    '\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c\u0e44\u0e14\u0e49',
  saveErrorDesc:
    '\u0e01\u0e23\u0e38\u0e13\u0e32\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07',
  avatarUpdated:
    '\u0e2d\u0e31\u0e1b\u0e40\u0e14\u0e15\u0e23\u0e39\u0e1b\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c\u0e41\u0e25\u0e49\u0e27',
  avatarError:
    '\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e2d\u0e31\u0e1b\u0e40\u0e14\u0e15\u0e23\u0e39\u0e1b\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c\u0e44\u0e14\u0e49',
};

const EN_STUDENT = {
  studentTitle: 'Student Profile',
  studentSubtitle: 'Manage your account, avatar, privacy, and progress overview.',
  editProfile: 'Edit Profile',
  settings: 'Settings',
  viewProgress: 'Progress Overview',
  stackNow: 'Current Stack',
  onTime: 'On-time Rate',
  backlog: 'Backlog',
  bestStreak: 'Best Streak',
  day: 'days',
  task: 'tasks',
  anonymousMode: 'Anonymous Mode',
  anonymousDesc: 'Hide your name from public classroom ranking.',
  notifications: 'Notifications',
  privacy: 'Privacy Policy',
  help: 'Help Center',
  logout: 'Logout',
  editDialog: 'Edit Student Profile',
  nameLabel: 'Display Name',
  emailLabel: 'Email',
  phoneLabel: 'Phone',
  schoolLabel: 'School',
  gradeLabel: 'Grade',
  cancel: 'Cancel',
  save: 'Save',
  avatarDialog: 'Choose Profile Picture',
  saveSuccess: 'Profile saved',
  saveSuccessDesc: 'Your latest profile details have been saved.',
  saveError: 'Unable to save profile',
  saveErrorDesc: 'Please check your details and try again.',
  avatarUpdated: 'Profile picture updated',
  avatarError: 'Unable to update profile picture',
};

const avatarSeeds = [
  'lotus',
  'river',
  'mountain',
  'sunrise',
  'ink',
  'robot',
  'mentor',
  'classroom',
  'focus',
  'sage',
  'phoenix',
  'ocean',
];

const avatarOptions = avatarSeeds.map(
  (seed) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`
);

type TeacherLanguage = 'th' | 'en';
type TeacherTheme = 'light' | 'dark';

type TeacherSettings = { language: TeacherLanguage; theme: TeacherTheme };

const teacherTexts: Record<TeacherLanguage, Record<string, string>> = {
  th: {
    title: 'โปรไฟล์ครู',
    subtitle: 'จัดการข้อมูลบัญชีและเข้าถึงเครื่องมือครูได้อย่างรวดเร็ว',
    role: 'ครู',
    classes: 'ห้องเรียน',
    students: 'นักเรียน',
    assignments: 'งานที่มอบหมาย',
    classroomsDesc: 'สร้างรหัสห้องและจัดการครูร่วมสอน',
    inboxDesc: 'ประกาศข่าวสารให้แต่ละห้องเรียน',
    studentsDesc: 'ดูรายชื่อนักเรียนแยกตามห้องเรียน',
    assignmentsDesc: 'สร้างและจัดการงานที่มอบหมาย',
    editProfile: 'แก้ไขโปรไฟล์',
    settings: 'ตั้งค่า',
    editDialog: 'แก้ไขโปรไฟล์ครู',
    displayName: 'ชื่อที่แสดง',
    email: 'อีเมล',
    phone: 'เบอร์โทร',
    school: 'โรงเรียน',
    subject: 'รายวิชา',
    addSubject: 'เพิ่มวิชา',
    uploadPhoto: 'เลือกรูปจากเครื่อง',
    chooseAvatar: 'เลือกรูป Avatar',
    language: 'ภาษา',
    languageTh: 'ไทย',
    languageEn: 'English',
    theme: 'ธีม',
    themeLight: 'ขาว',
    themeDark: 'ดำ',
    cancel: 'ยกเลิก',
    save: 'บันทึกโปรไฟล์',
    saveSettings: 'บันทึกการตั้งค่า',
    logout: 'ออกจากระบบ',
    avatarLabel: 'รูปโปรไฟล์',
    subjectHint: 'พิมพ์ชื่อวิชาแล้วกดเพิ่ม เช่น คณิต, ฟิสิกส์',
    settingSaved: 'บันทึกการตั้งค่าแล้ว',
  },
  en: {
    title: 'Teacher Profile',
    subtitle: 'Manage account and access all teacher tools quickly.',
    role: 'Teacher',
    classes: 'Classes',
    students: 'Students',
    assignments: 'Assignments',
    classroomsDesc: 'Create room codes and manage co-teachers',
    inboxDesc: 'Post announcements to each classroom',
    studentsDesc: 'View students grouped by classroom',
    assignmentsDesc: 'Create and manage assigned work',
    editProfile: 'Edit Profile',
    settings: 'Settings',
    editDialog: 'Edit Teacher Profile',
    displayName: 'Display Name',
    email: 'Email',
    phone: 'Phone',
    school: 'School',
    subject: 'Subject',
    addSubject: 'Add Subject',
    uploadPhoto: 'Upload Photo',
    chooseAvatar: 'Choose Avatar',
    language: 'Language',
    languageTh: 'Thai',
    languageEn: 'English',
    theme: 'Theme',
    themeLight: 'White',
    themeDark: 'Black',
    cancel: 'Cancel',
    save: 'Save Profile',
    saveSettings: 'Save Settings',
    logout: 'Logout',
    avatarLabel: 'Profile Picture',
    subjectHint: 'Type a subject and press add. e.g. Math, Physics',
    settingSaved: 'Settings saved',
  },
};

const parseSubjectList = (value: string) =>
  value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const buildSubjectText = (subjects: string[]) => {
  const list = Array.from(new Set(subjects.map((item) => item.trim()).filter(Boolean)));
  return list.length > 0 ? list.join(', ') : 'General';
};

const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const compressAvatar = (dataUrl: string, maxEdge = 360) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(maxEdge / image.width, maxEdge / image.height, 1);
      const width = Math.max(1, Math.round(image.width * ratio));
      const height = Math.max(1, Math.round(image.height * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to process image'));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = dataUrl;
  });

const Profile: React.FC = () => {
  const {
    student,
    logout,
    updateStudent,
    ROUTE_PATHS,
    isTeacher,
    teacherClassrooms,
    getClassroomMembers,
  } = useAuth();
  const { assignments: visibleAssignments } = useTasks();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings: appSettings, commitSettings } = useAppSettings();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isTeacherAvatarPickerOpen, setIsTeacherAvatarPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [teacherLanguage, setTeacherLanguage] = useState<TeacherLanguage>(appSettings.language);
  const [teacherTheme, setTeacherTheme] = useState<TeacherTheme>(appSettings.theme);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const studentSettingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!student) return;
    setNickname(student.nickname || '');
    setEmail(student.email || '');
    setPhone(student.phone || '');
    setSchool(student.school || '');
    setGrade(student.grade || '');
    setSubject(student.subject || '');
    setSubjects(parseSubjectList(student.subject || ''));
    setSubjectInput('');
    setAvatar(student.avatar || avatarOptions[0]);
  }, [student]);

  useEffect(() => {
    setTeacherLanguage(appSettings.language);
    setTeacherTheme(appSettings.theme);
    applyAppTheme(appSettings.theme);
  }, [appSettings.language, appSettings.theme]);

  useEffect(() => {
    applyAppTheme(teacherTheme);
  }, [teacherTheme]);

  const teacherStats = useMemo(() => {
    if (!isTeacher) {
      return { classrooms: 0, students: 0, assignments: 0 };
    }

    const totalStudents = teacherClassrooms.reduce((sum, room) => {
      const members = getClassroomMembers(room.code);
      return sum + members.students.length;
    }, 0);

    return {
      classrooms: teacherClassrooms.length,
      students: totalStudents,
      assignments: visibleAssignments.length,
    };
  }, [getClassroomMembers, isTeacher, teacherClassrooms, visibleAssignments.length]);

  if (!student) return null;
  const teacherCopy = teacherTexts[teacherLanguage];
  const studentCopy = teacherLanguage === 'en' ? EN_STUDENT : TH;
  const teacherSubjects =
    subjects.length > 0 ? subjects : parseSubjectList(subject || student.subject || '');

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.WELCOME);
  };

  const handleSaveProfile = () => {
    try {
      const finalSubjects =
        subjectInput.trim().length > 0 ? [...subjects, subjectInput.trim()] : subjects;
      const normalizedSubjects = Array.from(
        new Set(finalSubjects.map((item) => item.trim()).filter(Boolean))
      );
      const nextSubjectText = buildSubjectText(normalizedSubjects);

      if (isTeacher) {
        setSubjects(normalizedSubjects);
        setSubjectInput('');
        setSubject(nextSubjectText);
      }

      updateStudent({
        nickname: nickname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        school: school.trim(),
        grade: isTeacher ? 'Teacher' : grade.trim(),
        subject: isTeacher ? nextSubjectText : undefined,
        avatar,
      });
      toast({
        title: studentCopy.saveSuccess,
        description: studentCopy.saveSuccessDesc,
      });
    } catch (error: any) {
      toast({
        title: studentCopy.saveError,
        description: error?.message || studentCopy.saveErrorDesc,
        variant: 'destructive',
      });
    }
  };

  const handleAddSubject = () => {
    const next = subjectInput.trim();
    if (!next) return;
    const updated = Array.from(new Set([...subjects, next]));
    setSubjects(updated);
    setSubject(buildSubjectText(updated));
    setSubjectInput('');
  };

  const handleRemoveSubject = (index: number) => {
    const updated = subjects.filter((_, itemIndex) => itemIndex !== index);
    setSubjects(updated);
    setSubject(buildSubjectText(updated));
  };

  const handleSelectAvatar = (option: string) => {
    setAvatar(option);
    try {
      updateStudent({ avatar: option });
      toast({ title: studentCopy.avatarUpdated });
    } catch {
      toast({
        title: studentCopy.avatarError,
        variant: 'destructive',
      });
    }
    setIsAvatarPickerOpen(false);
  };

  const handleTeacherSelectAvatar = (option: string) => {
    setAvatar(option);
    setIsTeacherAvatarPickerOpen(false);
  };

  const handleTeacherAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rawDataUrl = await readFileAsDataURL(file);
      const optimizedAvatar = await compressAvatar(rawDataUrl);
      setAvatar(optimizedAvatar);
    } catch {
      toast({
        title: studentCopy.avatarError,
        variant: 'destructive',
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveSettings = () => {
    const nextSettings: TeacherSettings = {
      language: teacherLanguage,
      theme: teacherTheme,
    };
    commitSettings(nextSettings);
    applyAppTheme(nextSettings.theme);
    toast({ title: teacherCopy.settingSaved });
    setIsSettingsOpen(false);
  };

  const resetSettingsDraft = () => {
    setTeacherLanguage(appSettings.language);
    setTeacherTheme(appSettings.theme);
    applyAppTheme(appSettings.theme);
  };

  const openSettings = () => {
    resetSettingsDraft();
    setIsSettingsOpen(true);
  };

  const handleSettingsOpenChange = (open: boolean) => {
    if (!open) {
      resetSettingsDraft();
    }
    setIsSettingsOpen(open);
  };

  const openTeacherEditor = () => {
    setNickname(student.nickname || '');
    setEmail(student.email || '');
    setPhone(student.phone || '');
    setSchool(student.school || '');
    setSubject(student.subject || '');
    setSubjects(parseSubjectList(student.subject || ''));
    setSubjectInput('');
    setAvatar(student.avatar || avatarOptions[0]);
    setIsEditingTeacher(true);
  };

  const renderStudentProfile = () => (
    <div className="max-w-md mx-auto pb-24">
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">{studentCopy.studentTitle}</h1>
        <p className="text-muted-foreground">{studentCopy.studentSubtitle}</p>
      </header>

      <section className="px-4 mb-8">
        <Card className="overflow-hidden border-none shadow-xl bg-card">
          <div className="h-28 bg-gradient-to-r from-primary to-secondary relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
          </div>
          <CardContent className="relative pt-14 pb-6 text-center">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <button type="button" className="relative" onClick={() => setIsAvatarPickerOpen(true)}>
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                  <AvatarImage src={avatar || student.avatar} alt={nickname || student.nickname} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-bold">
                    {(nickname || student.nickname || 'ST').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -right-1 -bottom-1 p-1.5 rounded-full bg-primary text-white border-2 border-background">
                  <Camera size={14} />
                </span>
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {nickname || student.nickname}
              </h2>
              <p className="text-sm text-muted-foreground">{email || student.email}</p>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge className="flex items-center gap-1 py-1 px-3 bg-secondary text-secondary-foreground border-none">
                <School size={12} />
                {school || student.school}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                <GraduationCap size={12} />
                {grade || student.grade}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full rounded-xl h-11"
                onClick={() => setIsEditingStudent(true)}
              >
                <Camera size={16} className="mr-2" />
                {studentCopy.editProfile}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl h-11"
                onClick={openSettings}
              >
                <Settings2 size={16} className="mr-2" />
                {studentCopy.settings}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title={studentCopy.stackNow}
            value={`${student.stackCount} ${studentCopy.day}`}
            icon={<Zap className="text-orange-500 fill-orange-500" size={20} />}
          />
          <StatsCard
            title={studentCopy.onTime}
            value={`${student.onTimeRate}%`}
            icon={<CheckCircle2 className="text-secondary" size={20} />}
          />
          <StatsCard
            title={studentCopy.backlog}
            value={`${student.backlogCount} ${studentCopy.task}`}
            icon={<AlertCircle className="text-destructive" size={20} />}
          />
          <StatsCard
            title={studentCopy.bestStreak}
            value={`${student.maxStack} ${studentCopy.day}`}
            icon={<Star className="text-yellow-500" size={20} />}
          />
        </div>
      </section>

      <section ref={studentSettingsRef} className="px-4 space-y-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {student.isAnonymous ? <EyeOff size={18} /> : <Eye size={18} />}
              <div>
                <p className="font-medium">{studentCopy.anonymousMode}</p>
                <p className="text-xs text-muted-foreground">{studentCopy.anonymousDesc}</p>
              </div>
            </div>
            <Switch
              checked={student.isAnonymous}
              onCheckedChange={(checked) => updateStudent({ isAnonymous: checked })}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm divide-y">
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            onClick={() => navigate(ROUTE_PATHS.NOTIFICATIONS)}
          >
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span className="font-medium">{studentCopy.notifications}</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            onClick={() => navigate(ROUTE_PATHS.PDPA)}
          >
            <div className="flex items-center gap-3">
              <Shield size={18} />
              <span className="font-medium">{studentCopy.privacy}</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={18} />
              <span className="font-medium">{studentCopy.help}</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-between p-4 hover:bg-destructive/5 transition-colors"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-destructive" />
              <span className="font-medium text-destructive">{studentCopy.logout}</span>
            </div>
          </button>
        </Card>
      </section>

      <Dialog open={isEditingStudent} onOpenChange={setIsEditingStudent}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{studentCopy.editDialog}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{studentCopy.nameLabel}</Label>
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{studentCopy.emailLabel}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{studentCopy.phoneLabel}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{studentCopy.schoolLabel}</Label>
              <Input value={school} onChange={(e) => setSchool(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{studentCopy.gradeLabel}</Label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditingStudent(false)}>
                {studentCopy.cancel}
              </Button>
              <Button
                onClick={() => {
                  handleSaveProfile();
                  setIsEditingStudent(false);
                }}
              >
                {studentCopy.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAvatarPickerOpen} onOpenChange={setIsAvatarPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{studentCopy.avatarDialog}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3">
            {avatarOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectAvatar(option)}
                className={`rounded-lg p-1 border ${avatar === option ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                <Avatar className="w-full h-auto aspect-square">
                  <AvatarImage src={option} alt="avatar-option" />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderTeacherProfile = () => (
    <div className="max-w-md mx-auto pb-24">
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">{teacherCopy.title}</h1>
        <p className="text-muted-foreground">{teacherCopy.subtitle}</p>
      </header>

      <section className="px-4 mb-6">
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="relative pt-0 pb-5">
            <div className="flex items-end justify-between -mt-10">
              <Avatar className="w-20 h-20 border-4 border-background shadow-sm">
                <AvatarImage src={avatar || student.avatar} alt={nickname || student.nickname} />
                <AvatarFallback>{(nickname || student.nickname || 'TC').slice(0, 2)}</AvatarFallback>
              </Avatar>
              <Badge className="bg-secondary text-secondary-foreground">{teacherCopy.role}</Badge>
            </div>
            <div className="mt-3">
              <p className="text-xl font-bold">{nickname || student.nickname}</p>
              <p className="text-sm text-muted-foreground">{email || student.email}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <School size={12} />
                {school || student.school}
              </Badge>
              {teacherSubjects.length > 0 &&
                teacherSubjects.map((item) => (
                  <Badge key={item} variant="outline" className="flex items-center gap-1">
                    <GraduationCap size={12} />
                    {item}
                  </Badge>
                ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border p-2 text-center">
                <p className="text-xs text-muted-foreground">{teacherCopy.classes}</p>
                <p className="text-lg font-bold">{teacherStats.classrooms}</p>
              </div>
              <div className="rounded-xl border border-border p-2 text-center">
                <p className="text-xs text-muted-foreground">{teacherCopy.students}</p>
                <p className="text-lg font-bold">{teacherStats.students}</p>
              </div>
              <div className="rounded-xl border border-border p-2 text-center">
                <p className="text-xs text-muted-foreground">{teacherCopy.assignments}</p>
                <p className="text-lg font-bold">{teacherStats.assignments}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10" onClick={openTeacherEditor}>
                <Camera size={16} className="mr-2" />
                {teacherCopy.editProfile}
              </Button>
              <Button variant="outline" className="h-10" onClick={openSettings}>
                <Settings2 size={16} className="mr-2" />
                {teacherCopy.settings}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 mb-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 space-y-2">
            <button
              type="button"
              className="w-full rounded-xl border border-border p-3 text-left hover:bg-accent/40 transition-colors"
              onClick={() => navigate(ROUTE_PATHS.TEACHER_CLASSROOMS)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{teacherCopy.classes}</p>
                  <p className="text-xs text-muted-foreground">{teacherCopy.classroomsDesc}</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-border p-3 text-left hover:bg-accent/40 transition-colors"
              onClick={() => navigate(ROUTE_PATHS.TEACHER_INBOX)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Inbox size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{teacherLanguage === 'th' ? 'กล่องข้อความ' : 'Inbox'}</p>
                  <p className="text-xs text-muted-foreground">{teacherCopy.inboxDesc}</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-border p-3 text-left hover:bg-accent/40 transition-colors"
              onClick={() => navigate(ROUTE_PATHS.TEACHER_STUDENTS)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{teacherCopy.students}</p>
                  <p className="text-xs text-muted-foreground">{teacherCopy.studentsDesc}</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-border p-3 text-left hover:bg-accent/40 transition-colors"
              onClick={() => navigate(ROUTE_PATHS.TEACHER_ASSIGNMENTS)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardCheck size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{teacherCopy.assignments}</p>
                  <p className="text-xs text-muted-foreground">{teacherCopy.assignmentsDesc}</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 mb-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 hover:bg-destructive/5 transition-colors"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-destructive" />
                <span className="font-medium text-destructive">{teacherCopy.logout}</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  return (
    <Layout>
      {isTeacher ? renderTeacherProfile() : renderStudentProfile()}

      {isTeacher && (
        <>
          <Dialog open={isEditingTeacher} onOpenChange={setIsEditingTeacher}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{teacherCopy.editDialog}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{teacherCopy.avatarLabel}</Label>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16 border border-border">
                      <AvatarImage src={avatar || student.avatar} alt={nickname || student.nickname} />
                      <AvatarFallback>{(nickname || student.nickname || 'TC').slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        className="justify-start"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={16} className="mr-2" />
                        {teacherCopy.uploadPhoto}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="justify-start"
                        onClick={() => setIsTeacherAvatarPickerOpen(true)}
                      >
                        {teacherCopy.chooseAvatar}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleTeacherAvatarUpload}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{teacherCopy.displayName}</Label>
                  <Input value={nickname} onChange={(event) => setNickname(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{teacherCopy.email}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{teacherCopy.phone}</Label>
                  <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{teacherCopy.school}</Label>
                  <Input value={school} onChange={(event) => setSchool(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{teacherCopy.subject}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={subjectInput}
                      placeholder={teacherCopy.subjectHint}
                      onChange={(event) => setSubjectInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleAddSubject();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSubject}>
                      <Plus size={16} className="mr-1" />
                      {teacherCopy.addSubject}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((item, index) => (
                      <Badge key={`${item}-${index}`} variant="secondary" className="gap-1 py-1">
                        {item}
                        <button
                          type="button"
                          className="rounded-full hover:bg-foreground/10 p-0.5"
                          onClick={() => handleRemoveSubject(index)}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                    {subjects.length === 0 && (
                      <p className="text-xs text-muted-foreground">{teacherCopy.subjectHint}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditingTeacher(false)}>
                    {teacherCopy.cancel}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      handleSaveProfile();
                      setIsEditingTeacher(false);
                    }}
                  >
                    {teacherCopy.save}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isTeacherAvatarPickerOpen} onOpenChange={setIsTeacherAvatarPickerOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{teacherCopy.chooseAvatar}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-4 gap-3">
                {avatarOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleTeacherSelectAvatar(option)}
                    className={`rounded-lg p-1 border ${avatar === option ? 'border-primary bg-primary/10' : 'border-border'}`}
                  >
                    <Avatar className="w-full h-auto aspect-square">
                      <AvatarImage src={option} alt="teacher-avatar-option" />
                      <AvatarFallback>AV</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Dialog open={isSettingsOpen} onOpenChange={handleSettingsOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{teacherCopy.settings}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Languages size={16} />
                {teacherCopy.language}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={teacherLanguage === 'th' ? 'default' : 'outline'}
                  onClick={() => setTeacherLanguage('th')}
                >
                  {teacherCopy.languageTh}
                </Button>
                <Button
                  type="button"
                  variant={teacherLanguage === 'en' ? 'default' : 'outline'}
                  onClick={() => setTeacherLanguage('en')}
                >
                  {teacherCopy.languageEn}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Settings2 size={16} />
                {teacherCopy.theme}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={teacherTheme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTeacherTheme('light')}
                >
                  <Sun size={16} className="mr-2" />
                  {teacherCopy.themeLight}
                </Button>
                <Button
                  type="button"
                  variant={teacherTheme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTeacherTheme('dark')}
                >
                  <Moon size={16} className="mr-2" />
                  {teacherCopy.themeDark}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => handleSettingsOpenChange(false)}>
                {teacherCopy.cancel}
              </Button>
              <Button type="button" onClick={handleSaveSettings}>
                {teacherCopy.saveSettings}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
