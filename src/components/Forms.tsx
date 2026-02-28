import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Briefcase,
  KeyRound,
  RefreshCcw,
  School,
  Hash,
  BookOpen,
  Calendar,
  Clock,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Task } from '@/lib/index';
import { useLocale } from '@/hooks/useLocale';

const isTestOtpEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_TEST_OTP === 'true';

const buildLoginSchema = (th: boolean) =>
  z.object({
    identifier: z.string().email(th ? 'กรุณากรอกอีเมลให้ถูกต้อง' : 'Please enter a valid email'),
    password: z
      .string()
      .min(6, th ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must contain at least 6 characters'),
  });

export type LoginValues = {
  identifier: string;
  password: string;
};

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginValues) => void }) {
  const { th, tx } = useLocale();
  const loginSchema = React.useMemo(() => buildLoginSchema(th), [th]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">{tx('อีเมล', 'Email')}</Label>
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
        <Label htmlFor="password">{tx('รหัสผ่าน', 'Password')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder={tx('กรอกรหัสผ่าน', 'Enter password')}
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
        {tx('เข้าสู่ระบบ', 'Login')}
      </Button>
    </form>
  );
}

export type RegisterValues = {
  role: 'teacher' | 'student';
  nickname: string;
  school: string;
  grade?: string;
  subject?: string;
  email: string;
  password: string;
};

const buildRegisterSchema = (th: boolean) =>
  z
    .object({
      role: z.enum(['teacher', 'student']),
      nickname: z.string().min(1, th ? 'กรุณากรอกชื่อที่แสดง' : 'Please enter display name'),
      school: z.string().min(1, th ? 'กรุณากรอกชื่อโรงเรียน' : 'Please enter school name'),
      grade: z.string().optional(),
      subject: z.string().optional(),
      email: z.string().email(th ? 'อีเมลไม่ถูกต้อง' : 'Email is invalid'),
      password: z
        .string()
        .min(6, th ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must contain at least 6 characters'),
    })
    .superRefine((values, ctx) => {
      if (values.role === 'student' && !values.grade) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['grade'],
          message: th ? 'กรุณาเลือกระดับชั้น' : 'Please select student grade',
        });
      }

      if (values.role === 'teacher' && !values.subject?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['subject'],
          message: th ? 'กรุณากรอกรายวิชาที่สอน' : 'Please enter teaching subject',
        });
      }
    });

type RegisterFormProps = {
  onRequestOtp: (data: RegisterValues) => Promise<void> | void;
  onVerifyOtp: (data: RegisterValues & { emailOtp: string }) => Promise<void> | void;
  onResendOtp?: (email: string) => Promise<void> | void;
};

export function RegisterForm({ onRequestOtp, onVerifyOtp, onResendOtp }: RegisterFormProps) {
  const { th, tx } = useLocale();
  const registerSchema = React.useMemo(() => buildRegisterSchema(th), [th]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'teacher',
    },
  });

  const role = watch('role');
  const [step, setStep] = React.useState<'details' | 'otp'>('details');
  const [pendingData, setPendingData] = React.useState<RegisterValues | null>(null);
  const [emailOtp, setEmailOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRequestOtp = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setOtpError('');
    try {
      await onRequestOtp(values);
      setPendingData(values);
      setEmailOtp('');
      setStep('otp');
    } catch {
      // Error toast is handled by the page-level callback.
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingData) return;
    if (!emailOtp.trim()) {
      setOtpError(tx('กรุณากรอกรหัสยืนยัน', 'Please enter verification code.'));
      return;
    }

    setIsSubmitting(true);
    setOtpError('');
    try {
      await onVerifyOtp({
        ...pendingData,
        emailOtp: emailOtp.trim(),
      });
    } catch {
      // Error toast is handled by the page-level callback.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingData?.email) return;
    setIsSubmitting(true);
    setOtpError('');
    try {
      if (onResendOtp) {
        await onResendOtp(pendingData.email);
      } else {
        await onRequestOtp(pendingData);
      }
    } catch {
      // Error toast is handled by the page-level callback.
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'otp' && pendingData) {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emailOtp">{tx('รหัสยืนยัน', 'Verification Code')}</Label>
          <p className="text-xs text-muted-foreground">
            {tx('เราได้ส่งรหัสไปที่', 'We sent a code to')}{' '}
            <span className="font-medium text-foreground">{pendingData.email}</span>
          </p>
          {isTestOtpEnabled && (
            <p className="text-xs text-amber-600">
              {tx('รหัสทดสอบ', 'Test code')}: 123456
            </p>
          )}
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="emailOtp"
              placeholder={tx('กรอกรหัสยืนยันจากอีเมล', 'Enter email verification code')}
              className="pl-10 rounded-xl tracking-widest"
              value={emailOtp}
              onChange={(event) => setEmailOtp(event.target.value)}
              autoComplete="one-time-code"
            />
          </div>
          {otpError && <p className="text-xs text-destructive">{otpError}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold"
        >
          {tx('ยืนยันและสร้างบัญชี', 'Verify & Create Account')}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="rounded-xl"
            onClick={handleResendOtp}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {tx('ส่งรหัสอีกครั้ง', 'Resend Code')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            className="rounded-xl"
            onClick={() => {
              setStep('details');
              setOtpError('');
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tx('เปลี่ยนอีเมล', 'Change Email')}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">{tx('บทบาท', 'Role')}</Label>
        <Select onValueChange={(val: 'teacher' | 'student') => setValue('role', val, { shouldValidate: true })} defaultValue="teacher">
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder={tx('เลือกบทบาท', 'Choose role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">{tx('ครู', 'Teacher')}</SelectItem>
            <SelectItem value="student">{tx('นักเรียน', 'Student')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">{tx('ชื่อที่แสดง', 'Display Name')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="nickname" placeholder={tx('ชื่อของคุณ', 'Your name')} className="pl-10 rounded-xl" {...register('nickname')} />
          </div>
          {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
        </div>

        {role === 'student' ? (
          <div className="space-y-2">
            <Label htmlFor="grade">{tx('ระดับชั้น', 'Grade')}</Label>
            <Select onValueChange={(val) => setValue('grade', val, { shouldValidate: true })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={tx('เลือกระดับชั้น', 'Select grade')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M.1">M.1</SelectItem>
                <SelectItem value="M.2">M.2</SelectItem>
                <SelectItem value="M.3">M.3</SelectItem>
                <SelectItem value="M.4">M.4</SelectItem>
                <SelectItem value="M.5">M.5</SelectItem>
                <SelectItem value="M.6">M.6</SelectItem>
              </SelectContent>
            </Select>
            {errors.grade && <p className="text-xs text-destructive">{errors.grade.message}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="subject">{tx('รายวิชา', 'Subject')}</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="subject"
                placeholder={tx('คณิต ฟิสิกส์ ภาษาไทย...', 'Math, Physics, Thai...')}
                className="pl-10 rounded-xl"
                {...register('subject')}
              />
            </div>
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">{tx('โรงเรียน', 'School')}</Label>
        <div className="relative">
          <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="school" placeholder={tx('ชื่อโรงเรียน', 'School name')} className="pl-10 rounded-xl" {...register('school')} />
        </div>
        {errors.school && <p className="text-xs text-destructive">{errors.school.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{tx('อีเมล', 'Email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" placeholder="example@email.com" className="pl-10 rounded-xl" {...register('email')} />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{tx('รหัสผ่าน', 'Password')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder={tx('กรอกรหัสผ่าน', 'Enter password')}
            className="pl-10 rounded-xl"
            {...register('password')}
          />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold"
      >
        {tx('ส่งรหัสยืนยัน', 'Send Verification Code')}
      </Button>
    </form>
  );
}

export function ClassCodeForm({ onSubmit }: { onSubmit: (code: string) => void }) {
  const { tx } = useLocale();
  const [code, setCode] = React.useState('');

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg">{tx('กรอกรหัสห้องเรียน', 'Enter Class Code')}</CardTitle>
        <CardDescription>{tx('ใช้รหัสที่ครูให้เพื่อเข้าร่วมห้องเรียน', 'Use the class code from your teacher to join the classroom.')}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <div className="relative">
          <Hash className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={tx('ตัวอย่าง: ABC-123', 'Example: ABC-123')}
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
          {tx('เข้าร่วมห้องเรียน', 'Join Class')}
        </Button>
      </CardContent>
    </Card>
  );
}

type TaskValues = {
  title: string;
  subject: string;
  deadline: string;
  type: 'File' | 'Photo' | 'Paper' | 'Link';
  channel: 'In App' | 'Google Classroom' | 'Submit in classroom';
  estimatedMinutes: number;
  description?: string;
};

const buildTaskSchema = (th: boolean) =>
  z.object({
    title: z.string().min(1, th ? 'กรุณากรอกชื่องาน' : 'Please enter task title'),
    subject: z.string().min(1, th ? 'กรุณากรอกวิชา' : 'Please enter subject'),
    deadline: z.string().min(1, th ? 'กรุณาเลือกวันกำหนดส่ง' : 'Please select deadline'),
    type: z.enum(['File', 'Photo', 'Paper', 'Link']),
    channel: z.enum(['In App', 'Google Classroom', 'Submit in classroom']),
    estimatedMinutes: z.number().min(5, th ? 'อย่างน้อย 5 นาที' : 'Minimum 5 minutes'),
    description: z.string().optional(),
  });

export function TaskForm({ task, onSubmit }: { task?: Task; onSubmit: (data: TaskValues) => void }) {
  const { th, tx } = useLocale();
  const taskSchema = React.useMemo(() => buildTaskSchema(th), [th]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          subject: task.subject,
          deadline: task.deadline.split('T')[0],
          type: task.type as unknown as TaskValues['type'],
          channel: task.channel as unknown as TaskValues['channel'],
          estimatedMinutes: task.estimatedMinutes,
          description: task.description || '',
        }
      : {
          type: 'File',
          channel: 'In App',
          estimatedMinutes: 30,
        },
  });

  const selectedType = watch('type');
  const selectedChannel = watch('channel');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-20">
      <div className="space-y-2">
        <Label htmlFor="title">{tx('ชื่องาน', 'Task title')}</Label>
        <Input id="title" placeholder={tx('เช่น ใบงานประวัติศาสตร์', 'e.g. History worksheet')} className="rounded-xl" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">{tx('วิชา', 'Subject')}</Label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="subject" placeholder={tx('วิชา...', 'Subject...')} className="pl-10 rounded-xl" {...register('subject')} />
          </div>
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">{tx('กำหนดส่ง', 'Deadline')}</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="deadline" type="date" className="pl-10 rounded-xl" {...register('deadline')} />
          </div>
          {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{tx('รูปแบบการส่ง', 'Submission format')}</Label>
          <Select defaultValue={selectedType} onValueChange={(val) => setValue('type', val as TaskValues['type'])}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="File">{tx('ไฟล์ (PDF/Doc)', 'File (PDF/Doc)')}</SelectItem>
              <SelectItem value="Photo">{tx('รูปภาพ/สแกน', 'Photo/Scan')}</SelectItem>
              <SelectItem value="Paper">{tx('กระดาษในห้องเรียน', 'Paper in class')}</SelectItem>
              <SelectItem value="Link">{tx('ลิงก์ (URL)', 'Link (URL)')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{tx('ช่องทางการส่ง', 'Submission channel')}</Label>
          <Select defaultValue={selectedChannel} onValueChange={(val) => setValue('channel', val as TaskValues['channel'])}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In App">{tx('ส่งในแอป DekThai', 'Submit in DekThai')}</SelectItem>
              <SelectItem value="Google Classroom">Google Classroom</SelectItem>
              <SelectItem value="Submit in classroom">{tx('ส่งที่ห้องเรียน/โต๊ะครู', 'Submit at classroom/teacher desk')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimatedMinutes">{tx('เวลาที่คาดว่าจะใช้ (นาที)', 'Estimated time needed (minutes)')}</Label>
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
        <Label htmlFor="description">{tx('รายละเอียด / คำชี้แจง', 'Details / Prompt')}</Label>
        <Textarea
          id="description"
          placeholder={tx('เพิ่มรายละเอียดงานหรือแนบลิงก์คำสั่งงาน...', 'Add assignment details or prompt link...')}
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
          {task ? tx('บันทึกการแก้ไข', 'Save changes') : tx('สร้างงาน', 'Create task')}
        </Button>
      </div>
    </form>
  );
}

