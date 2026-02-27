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

const isTestOtpEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_TEST_OTP === 'true';

// --- Login Form ---
const loginSchema = z.object({
  identifier: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">Email</Label>
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
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
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
        Login
      </Button>
    </form>
  );
}

// --- Register Form ---
const registerSchema = z.object({
  role: z.enum(['teacher', 'student']),
  nickname: z.string().min(1, 'Please enter display name'),
  school: z.string().min(1, 'Please enter school name'),
  grade: z.string().optional(),
  subject: z.string().optional(),
  email: z.string().email('Email is invalid'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
}).superRefine((values, ctx) => {
  if (values.role === 'student' && !values.grade) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['grade'],
      message: 'Please select student grade',
    });
  }

  if (values.role === 'teacher' && !values.subject?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subject'],
      message: 'Please enter teaching subject',
    });
  }
});

export type RegisterValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  onRequestOtp: (data: RegisterValues) => Promise<void> | void;
  onVerifyOtp: (data: RegisterValues & { emailOtp: string }) => Promise<void> | void;
  onResendOtp?: (email: string) => Promise<void> | void;
};

export function RegisterForm({ onRequestOtp, onVerifyOtp, onResendOtp }: RegisterFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterValues>({
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
      setOtpError('Please enter verification code.');
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
          <Label htmlFor="emailOtp">Verification Code</Label>
          <p className="text-xs text-muted-foreground">
            We sent a code to <span className="font-medium text-foreground">{pendingData.email}</span>
          </p>
          {isTestOtpEnabled && (
            <p className="text-xs text-amber-600">
              Test code: 123456
            </p>
          )}
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="emailOtp"
              placeholder="Enter email verification code"
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
          Verify & Create Account
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
            Resend Code
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
            Change Email
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select onValueChange={(val: 'teacher' | 'student') => setValue('role', val, { shouldValidate: true })} defaultValue="teacher">
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Choose role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">Display Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="nickname" placeholder="Your name" className="pl-10 rounded-xl" {...register('nickname')} />
          </div>
          {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
        </div>

        {role === 'student' ? (
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select onValueChange={(val) => setValue('grade', val, { shouldValidate: true })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select grade" />
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
            <Label htmlFor="subject">Subject</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="subject" placeholder="Math, Physics, Thai..." className="pl-10 rounded-xl" {...register('subject')} />
            </div>
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">School</Label>
        <div className="relative">
          <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="school" placeholder="School name" className="pl-10 rounded-xl" {...register('school')} />
        </div>
        {errors.school && <p className="text-xs text-destructive">{errors.school.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" placeholder="example@email.com" className="pl-10 rounded-xl" {...register('email')} />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="password" type="password" placeholder="Enter password" className="pl-10 rounded-xl" {...register('password')} />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold"
      >
        Send Verification Code
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
        <CardTitle className="text-lg">Enter Class Code</CardTitle>
        <CardDescription>Use the class code from your teacher to join the classroom.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <div className="relative">
          <Hash className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Example: ABC-123"
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
          Join Class
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Task Form ---
const taskSchema = z.object({
  title: z.string().min(1, "Please enter task title"),
  subject: z.string().min(1, "Please enter subject"),
  deadline: z.string().min(1, "Please select deadline"),
  type: z.enum(["File", "Photo", "Paper", "Link"]),
  channel: z.enum(["In App", "Google Classroom", "Submit in classroom"]),
  estimatedMinutes: z.number().min(5, "Minimum 5 minutes"),
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
      type: task.type as any,
      channel: task.channel as any,
      estimatedMinutes: task.estimatedMinutes,
      description: task.description || '',
    } : {
      type: "File" as any,
      channel: "In App" as any,
      estimatedMinutes: 30,
    },
  });

  const selectedType = watch('type');
  const selectedChannel = watch('channel');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-20">
      <div className="space-y-2">
        <Label htmlFor="title">Task title</Label>
        <Input id="title" placeholder="e.g. History worksheet" className="rounded-xl" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="subject" placeholder="Subject..." className="pl-10 rounded-xl" {...register("subject")} />
          </div>
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="deadline" type="date" className="pl-10 rounded-xl" {...register('deadline')} />
          </div>
          {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Submission format</Label>
          <Select 
            defaultValue={selectedType} 
            onValueChange={(val) => setValue('type', val as any)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="File">File (PDF/Doc)</SelectItem>
              <SelectItem value="Photo">Photo/Scan</SelectItem>
              <SelectItem value="Paper">Paper in class</SelectItem>
              <SelectItem value="Link">Link (URL)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Submission channel</Label>
          <Select 
            defaultValue={selectedChannel} 
            onValueChange={(val) => setValue('channel', val as any)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In App">Submit in DekThai</SelectItem>
              <SelectItem value="Google Classroom">Google Classroom</SelectItem>
              <SelectItem value="Submit in classroom">Submit at classroom/teacher desk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimatedMinutes">Estimated time needed (minutes)</Label>
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
        <Label htmlFor="description">Details / Prompt</Label>
        <Textarea 
          id="description" 
          placeholder="Add assignment details or prompt link..." 
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
          {task ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}


