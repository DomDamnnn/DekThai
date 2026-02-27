import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Info, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const PDPA_CONSENT_KEY = 'dekthai_pdpa_consent_v1';

const PDPA: React.FC = () => {
  const navigate = useNavigate();
  const { student } = useAuth();

  const handleAccept = () => {
    localStorage.setItem(PDPA_CONSENT_KEY, new Date().toISOString());

    if (!student) {
      navigate(ROUTE_PATHS.REGISTER);
      return;
    }

    if (student.role === 'student' && student.status !== 'approved') {
      navigate(ROUTE_PATHS.CLASS_CODE);
      return;
    }

    if (student.role === 'teacher') {
      navigate(ROUTE_PATHS.TEACHER_CLASSROOMS);
      return;
    }

    navigate(ROUTE_PATHS.PROFILE);
  };

  const dataItems = [
    {
      title: 'Identity Data',
      description:
        'Nickname, school, and grade are used to display your profile and map assignments.',
      icon: <Info className="w-5 h-5 text-primary" />,
    },
    {
      title: 'Contact Data',
      description:
        'Email or phone number is used for notifications and account recovery.',
      icon: <Lock className="w-5 h-5 text-primary" />,
    },
    {
      title: 'Learning Data',
      description:
        'Assignments and deadlines are used by Priority AI to rank your tasks.',
      icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 pb-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            DekThai protects student data and uses only what is needed for learning workflows.
          </p>
        </div>

        <Card className="border-none shadow-sm mb-6 bg-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Summary</CardTitle>
            <CardDescription>
              We collect limited data to help you manage tasks better and do not sell your data.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-lg px-2">What We Collect</h2>
          {dataItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-shrink-0 mt-1">{item.icon}</div>
                  <div>
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="font-semibold text-lg px-2 mb-3">Details</h2>
          <Card className="border-border/50">
            <ScrollArea className="h-44 p-4 text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                1. Priority AI uses your task and deadline data to provide a ranked task list.
              </p>
              <p className="mb-3">
                2. Task status is visible only to relevant classroom members and teachers.
              </p>
              <p className="mb-3">
                3. You can update your personal profile data anytime from the profile screen.
              </p>
              <p>
                4. Data access is controlled and limited to system features that need it.
              </p>
            </ScrollArea>
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            Accept and Continue
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full h-12 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-widest">
          DekThai © 2026 Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default PDPA;
