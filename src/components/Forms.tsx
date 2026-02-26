import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Mail, 
  Lock, 
  User, 
  School, 
  GraduationCap, 
  Hash, 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Send,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Task,
  TaskType,
  TaskChannel,
  TaskStatus
} from '@/lib/index';

// --- Login Form ---
const loginSchema = z.object({
  identifier: z.string().min(1, 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">อีเมล หรือ เบอร์โทรศัพท์</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="identifier" 
            placeholder="example@email.com" 
            className="pl-10 rounded-xl" 
            {...register('identifier')} 
          />
        </div>
        {errors.identifier && <p className="text-xs text-destructive">{errors.identifier.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="pl-10 rounded-xl" 
            {...register('password')} 
          />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity"
      >
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}

// --- Register Form ---
const registerSchema = z.object({
  nickname: z.string().min(1, 'กรุณากรอกชื่อเล่น'),
  school: z.string().min(1, 'กรุณากรอกชื่อโรงเรียน'),
  grade: z.string().min(1, 'กรุณาเลือกระดับชั้น'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({ onSubmit }: { onSubmit: (data: RegisterValues) => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">ชื่อเล่น</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="nickname" placeholder="กอไก่" className="pl-10 rounded-xl" {...register('nickname')} />
          </div>
          {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">ระดับชั้น</Label>
          <Select onValueChange={(val) => setValue('grade', val)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="เลือกชั้น" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ม.1">ม.1</SelectItem>
              <SelectItem value="ม.2">ม.2</SelectItem>
              <SelectItem value="ม.3">ม.3</SelectItem>
              <SelectItem value="ม.4">ม.4</SelectItem>
              <SelectItem value="ม.5">ม.5</SelectItem>
              <SelectItem value="ม.6">ม.6</SelectItem>
            </SelectContent>
          </Select>
          {errors.grade && <p className="text-xs text-destructive">{errors.grade.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">โรงเรียน</Label>
        <div className="relative">
          <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="school" placeholder="ระบุชื่อโรงเรียน" className="pl-10 rounded-xl" {...register('school')} />
        </div>
        {errors.school && <p className="text-xs text-destructive">{errors.school.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">อีเมล</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" placeholder="example@email.com" className="pl-10 rounded-xl" {...register('email')} />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="password" type="password" placeholder="••••••••" className="pl-10 rounded-xl" {...register('password')} />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold"
      >
        สมัครสมาชิก
      </Button>
    </form>
  );
}

// --- Class Code Form ---
export function ClassCodeForm({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = React.useState('');

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg">เข้าร่วมห้องเรียน</CardTitle>
        <CardDescription>กรอก Class Code ที่ได้รับจากคุณครูเพื่อเข้าถึงงาน</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <div className="relative">
          <Hash className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="ตัวอย่าง: ABC-123"
            className="pl-10 h-12 rounded-2xl text-lg font-mono tracking-widest uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <Button 
          className="w-full h-12 rounded-2xl bg-primary text-white font-semibold"
          onClick={() => code && onSubmit(code)}
          disabled={!code}
        >
          ส่งคำขอเข้าร่วม
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Task Form ---
const taskSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกหัวข้องาน'),
  subject: z.string().min(1, 'กรุณากรอกวิชา'),
  deadline: z.string().min(1, 'กรุณาเลือกเดดไลน์'),
  type: z.enum(['ไฟล์', 'รูปถ่าย', 'กระดาษ', 'ลิงก์']),
  channel: z.enum(['ในแอพ', 'Google Classroom', 'ส่งครูหน้าห้อง']),
  estimatedMinutes: z.number().min(5, 'อย่างน้อย 5 นาที'),
  description: z.string().optional(),
});

type TaskValues = z.infer<typeof taskSchema>;

export function TaskForm({ task, onSubmit }: { task?: Task, onSubmit: (data: any) => void }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      subject: task.subject,
      deadline: task.deadline.split('T')[0],
      type: task.type,
      channel: task.channel,
      estimatedMinutes: task.estimatedMinutes,
      description: task.description || '',
    } : {
      type: 'ไฟล์',
      channel: 'ในแอพ',
      estimatedMinutes: 30,
    },
  });

  const selectedType = watch('type');
  const selectedChannel = watch('channel');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-20">
      <div className="space-y-2">
        <Label htmlFor="title">ชื่องาน</Label>
        <Input id="title" placeholder="เช่น รายงานประวัติศาสตร์สมัยอยุธยา" className="rounded-xl" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">วิชา</Label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="subject" placeholder="วิชา..." className="pl-10 rounded-xl" {...register('subject')} />
          </div>
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">เดดไลน์</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="deadline" type="date" className="pl-10 rounded-xl" {...register('deadline')} />
          </div>
          {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>รูปแบบการส่ง</Label>
          <Select 
            defaultValue={selectedType} 
            onValueChange={(val: TaskType) => setValue('type', val)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ไฟล์">ไฟล์ (PDF/Doc)</SelectItem>
              <SelectItem value="รูปถ่าย">รูปถ่าย/สแกน</SelectItem>
              <SelectItem value="กระดาษ">ส่งเป็นกระดาษ</SelectItem>
              <SelectItem value="ลิงก์">ลิงก์ (URL)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>ช่องทางส่ง</Label>
          <Select 
            defaultValue={selectedChannel} 
            onValueChange={(val: TaskChannel) => setValue('channel', val)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ในแอพ">ส่งใน DekThai</SelectItem>
              <SelectItem value="Google Classroom">Google Classroom</SelectItem>
              <SelectItem value="ส่งครูหน้าห้อง">หน้าห้อง/โต๊ะครู</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimatedMinutes">เวลาที่คาดว่าต้องใช้ (นาที)</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="estimatedMinutes" 
            type="number" 
            className="pl-10 rounded-xl" 
            {...register('estimatedMinutes', { valueAsNumber: true })} 
          />
        </div>
        {errors.estimatedMinutes && <p className="text-xs text-destructive">{errors.estimatedMinutes.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">รายละเอียดเพิ่มเติม / โจทย์</Label>
        <Textarea 
          id="description" 
          placeholder="ระบุรายละเอียดงานหรือลิงก์โจทย์..." 
          className="rounded-xl min-h-[100px]" 
          {...register('description')} 
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50">
        <Button 
          type="submit" 
          className="w-full max-w-md mx-auto flex h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg"
        >
          <Send className="w-4 h-4 mr-2" />
          {task ? 'บันทึกการแก้ไข' : 'สร้างงานใหม่'}
        </Button>
      </div>
    </form>
  );
}
