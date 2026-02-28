import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ClipboardCheck, Plus, PlusCircle, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AssignmentRecord, formatDateThai } from "@/lib";
import { useAppSettings } from "@/hooks/useAppSettings";
import {
  ACCEPTED_FORMAT_OPTIONS,
  ASSIGNMENT_TEMPLATE_PRESETS,
  CHECKLIST_TEMPLATES,
  ESTIMATE_OPTIONS,
  FAQ_TEMPLATES,
  FILENAME_TEMPLATE_PRESETS,
  LATE_PENALTY_PRESETS,
  LEARNING_OBJECTIVE_PRESETS,
  RESPONSE_WINDOW_PRESETS,
  SUBMISSION_CHANNEL_OPTIONS,
  DeliverableSubmitType,
} from "@/config/assignmentTemplates";

type GroupingMethod = "teacher_assigns" | "students_choose" | "random";
type SubmitType = DeliverableSubmitType;
type AiPolicyLevel = "" | "none" | "limited" | "allowed";
type GradingMethod = "simple" | "rubric";
type LegacyRubricMethod = "rubric" | "checklist" | "total_only";

type DeliverableDraft = {
  id: string;
  name: string;
  submitType: SubmitType;
  acceptedFormats: string[];
  requirement: string;
  maxFileSizeMb: string;
  fileNameTemplate: string;
};

type ResourceDraft = { id: string; label: string; url: string };
type RubricRowDraft = { id: string; title: string; maxScore: string; fullScoreDescription: string };
type FaqDraft = { id: string; question: string; answer: string };

type FormPreferences = {
  fullScore?: number;
  estimateMinutes?: number;
  responseWindow?: string;
  acceptedFormats?: string[];
  subjectByClass?: Record<string, string>;
  questionChannelByClass?: Record<string, string>;
};

type AssignmentFormState = {
  templateId: string;
  classCode: string;
  title: string;
  deadline: string;
  subject: string;
  assignmentType: "individual" | "group";
  groupSize: string;
  groupingMethod: GroupingMethod;
  fullScore: string;
  gradeWeightPercent: string;
  estimatedDurationMinutes: string;
  shortDescription: string;
  instructions: string;
  deliverables: DeliverableDraft[];
  aiPolicyLevel: AiPolicyLevel;
  submissionChannel: string;
  allowLate: boolean;
  finalLateDate: string;
  latePenaltyPreset: string;
  latePenaltyCustom: string;
  allowResubmit: boolean;
  resubmitUntil: string;
  gradingMethod: GradingMethod;
  legacyRubricMethod: LegacyRubricMethod;
  passRule: string;
  questionChannel: string;
  responseWindow: string;
  learningObjectivePresets: string[];
  customLearningObjectives: string;
  steps: string;
  mergeStepsIntoInstructions: boolean;
  dos: string;
  donts: string;
  checklist: string;
  resources: ResourceDraft[];
  deliverableExamples: ResourceDraft[];
  aiAllowed: string;
  aiForbidden: string;
  aiNote: string;
  rubricRows: RubricRowDraft[];
  rubricNotes: string;
  faqRows: FaqDraft[];
};

const FORM_PREF_KEY = "dekthai_assignment_form_prefs_v2";
const STEPS_TEMPLATE_TEXT = "1) ...\n2) ...\n3) ...";
const createAiPolicyDefaults = (
  language: "th" | "en"
): Record<Exclude<AiPolicyLevel, "">, { allowed: string[]; forbidden: string[] }> => {
  if (language === "th") {
    return {
      none: { allowed: [], forbidden: ["ห้ามใช้ AI สำหรับงานนี้"] },
      limited: {
        allowed: ["ใช้ AI ช่วยระดมไอเดียได้", "ใช้ AI ช่วยตรวจภาษาได้"],
        forbidden: ["ห้ามคัดลอกคำตอบจาก AI มาใช้ตรงๆ"],
      },
      allowed: {
        allowed: ["ใช้ AI ช่วยค้นคว้าและวางโครงงานได้"],
        forbidden: ["ต้องตรวจสอบและอ้างอิงก่อนส่งงานเสมอ"],
      },
    };
  }

  return {
    none: { allowed: [], forbidden: ["Do not use AI for this assignment"] },
    limited: {
      allowed: ["Use AI for brainstorming", "Use AI to check language"],
      forbidden: ["Do not copy AI answers directly"],
    },
    allowed: {
      allowed: ["Use AI to research and structure your work"],
      forbidden: ["Always verify and cite before submitting"],
    },
  };
};

const pad = (value: number) => String(value).padStart(2, "0");
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const uniq = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
const splitLines = (input: string) =>
  input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const toDateTimeLocal = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;

const defaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 0, 0);
  return toDateTimeLocal(date);
};

const toIso = (input: string) => {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid date or time");
  return parsed.toISOString();
};

const readPrefs = (): FormPreferences => {
  const raw = localStorage.getItem(FORM_PREF_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as FormPreferences;
  } catch {
    return {};
  }
};

const savePrefs = (prefs: FormPreferences) => {
  localStorage.setItem(FORM_PREF_KEY, JSON.stringify(prefs));
};

const buildQuestionChannelDefault = (gradeRoom?: string, classCode?: string, language: "th" | "en" = "th") => {
  if (gradeRoom) return language === "th" ? `ห้องถาม-ตอบ ${gradeRoom}` : `Q&A room ${gradeRoom}`;
  if (classCode) return language === "th" ? `ห้องถาม-ตอบ ${classCode}` : `Q&A room ${classCode}`;
  return language === "th" ? "กล่องข้อความห้องเรียน DekThai" : "DekThai Classroom Inbox";
};

const buildDefaultDeliverable = (prefs: FormPreferences, language: "th" | "en"): DeliverableDraft => ({
  id: makeId("del"),
  name: language === "th" ? "รายการที่ต้องส่ง" : "Submission item",
  submitType: "file",
  acceptedFormats: prefs.acceptedFormats && prefs.acceptedFormats.length > 0 ? prefs.acceptedFormats : ["PDF"],
  requirement: language === "th" ? "ส่งผลงานฉบับสมบูรณ์" : "Submit the final version",
  maxFileSizeMb: "20",
  fileNameTemplate: FILENAME_TEMPLATE_PRESETS[0],
});

const buildDefaultRubricRows = (fullScore: string, language: "th" | "en"): RubricRowDraft[] => [
  {
    id: makeId("rub"),
    title: language === "th" ? "คุณภาพโดยรวม" : "Overall quality",
    maxScore: fullScore || "10",
    fullScoreDescription:
      language === "th"
        ? "ถูกต้อง ครบถ้วน และตรงตามข้อกำหนด"
        : "Accurate, complete, and aligned to requirements",
  },
];

const buildDefaultForm = (
  classCode: string,
  gradeRoom: string,
  subject: string,
  prefs: FormPreferences,
  language: "th" | "en"
): AssignmentFormState => ({
  templateId: "",
  classCode,
  title: "",
  deadline: defaultDeadline(),
  subject,
  assignmentType: "individual",
  groupSize: "4",
  groupingMethod: "students_choose",
  fullScore: String(prefs.fullScore || 10),
  gradeWeightPercent: "",
  estimatedDurationMinutes: String(prefs.estimateMinutes || 60),
  shortDescription: "",
  instructions: "",
  deliverables: [buildDefaultDeliverable(prefs, language)],
  aiPolicyLevel: "",
  submissionChannel: "In DekThai",
  allowLate: false,
  finalLateDate: "",
  latePenaltyPreset: LATE_PENALTY_PRESETS[0],
  latePenaltyCustom: "",
  allowResubmit: false,
  resubmitUntil: "",
  gradingMethod: "simple",
  legacyRubricMethod: "rubric",
  passRule: language === "th" ? ">= 50% ของคะแนนเต็ม" : ">= 50% of total score",
  questionChannel:
    prefs.questionChannelByClass?.[classCode] ||
    buildQuestionChannelDefault(gradeRoom, classCode, language),
  responseWindow: prefs.responseWindow || RESPONSE_WINDOW_PRESETS[0],
  learningObjectivePresets: [],
  customLearningObjectives: "",
  steps: "",
  mergeStepsIntoInstructions: false,
  dos: "",
  donts: "",
  checklist: "",
  resources: [],
  deliverableExamples: [],
  aiAllowed: "",
  aiForbidden: "",
  aiNote: "",
  rubricRows: buildDefaultRubricRows(String(prefs.fullScore || 10), language),
  rubricNotes: "",
  faqRows: [],
});

const TeacherAssignments: React.FC = () => {
  const { isTeacher, teacher } = useTeacherGuard();
  const { teacherClassrooms, createDetailedAssignment } = useAuth();
  const { assignments } = useTasks();
  const { toast } = useToast();
  const { settings } = useAppSettings();
  const th = settings.language === "th";
  const tx = (thText: string, enText: string) => (th ? thText : enText);
  const submissionChannelLabel = (channel: string) => {
    if (channel === "In DekThai") return tx("ใน DekThai", "In DekThai");
    if (channel === "ส่งหน้าห้อง") return tx("ส่งหน้าห้อง", "In-class handoff");
    return channel;
  };
  const AI_POLICY_DEFAULTS = useMemo(() => createAiPolicyDefaults(settings.language), [settings.language]);

  const [prefs, setPrefs] = useState<FormPreferences>(() => readPrefs());
  const [form, setForm] = useState<AssignmentFormState>(() =>
    buildDefaultForm("", "", tx("ทั่วไป", "General"), prefs, settings.language)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeListClassCode, setActiveListClassCode] = useState("all");
  const [mainAdvancedOpen, setMainAdvancedOpen] = useState(false);
  const [briefAdvancedOpen, setBriefAdvancedOpen] = useState(false);
  const [gradingAdvancedOpen, setGradingAdvancedOpen] = useState(false);

  const roomByCode = useMemo(() => new Map(teacherClassrooms.map((room) => [room.code, room])), [teacherClassrooms]);
  const currentRoom = useMemo(() => roomByCode.get(form.classCode), [form.classCode, roomByCode]);

  useEffect(() => {
    if (!teacher || teacherClassrooms.length === 0 || form.classCode) return;
    const room = teacherClassrooms[0];
    const subject = prefs.subjectByClass?.[room.code] || teacher.subject || tx("ทั่วไป", "General");
    setForm(buildDefaultForm(room.code, room.gradeRoom || "", subject, prefs, settings.language));
  }, [form.classCode, prefs, teacher, teacherClassrooms, settings.language, th]);

  const visibleAssignments = useMemo(() => {
    const sorted = [...assignments].sort(
      (a, b) => new Date(b.submission.deadline).getTime() - new Date(a.submission.deadline).getTime()
    );
    if (activeListClassCode === "all") return sorted;
    return sorted.filter((assignment) =>
      assignment.assignmentInfo.targetClassCodes.includes(activeListClassCode)
    );
  }, [activeListClassCode, assignments]);

  const subjectOptions = useMemo(() => {
    const preset = [
      teacher?.subject || "",
      tx("ทั่วไป", "General"),
      ...assignments.map((item) => item.assignmentInfo.subject),
    ];
    return uniq(preset);
  }, [assignments, teacher?.subject, th]);

  const questionChannelOptions = useMemo(() => {
    const roomLabel = currentRoom?.gradeRoom || form.classCode;
    return uniq([
      buildQuestionChannelDefault(currentRoom?.gradeRoom, form.classCode, settings.language),
      roomLabel
        ? th
          ? `ประกาศห้องเรียน ${roomLabel}`
          : `Classroom announcements ${roomLabel}`
        : tx("กล่องข้อความห้องเรียน DekThai", "DekThai Classroom Inbox"),
      tx("กล่องข้อความห้องเรียน DekThai", "DekThai Classroom Inbox"),
    ]);
  }, [currentRoom?.gradeRoom, form.classCode, settings.language, th]);

  const rubricTotal = useMemo(
    () => form.rubricRows.reduce((sum, row) => sum + (Number(row.maxScore) || 0), 0),
    [form.rubricRows]
  );

  const updateForm = <K extends keyof AssignmentFormState>(key: K, value: AssignmentFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateDeliverable = <K extends keyof DeliverableDraft>(
    deliverableId: string,
    key: K,
    value: DeliverableDraft[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((item) =>
        item.id === deliverableId ? { ...item, [key]: value } : item
      ),
    }));
  };

  const toggleAcceptedFormat = (deliverableId: string, format: string) => {
    setForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((item) => {
        if (item.id !== deliverableId) return item;
        const next = item.acceptedFormats.includes(format)
          ? item.acceptedFormats.filter((value) => value !== format)
          : [...item.acceptedFormats, format];
        return { ...item, acceptedFormats: next };
      }),
    }));
  };

  const addDeliverable = () => {
    setForm((prev) => ({
      ...prev,
      deliverables: [
        ...prev.deliverables,
        { ...buildDefaultDeliverable(prefs, settings.language), id: makeId("del") },
      ],
    }));
  };

  const removeDeliverable = (deliverableId: string) => {
    setForm((prev) => ({
      ...prev,
      deliverables:
        prev.deliverables.length > 1
          ? prev.deliverables.filter((item) => item.id !== deliverableId)
          : prev.deliverables,
    }));
  };

  const addResourceRow = (key: "resources" | "deliverableExamples") => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], { id: makeId("res"), label: "", url: "" }] }));
  };

  const updateResourceRow = (
    key: "resources" | "deliverableExamples",
    rowId: string,
    field: "label" | "url",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  };

  const removeResourceRow = (key: "resources" | "deliverableExamples", rowId: string) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((row) => row.id !== rowId) }));
  };

  const addFaqRow = () => {
    setForm((prev) => ({
      ...prev,
      faqRows: [...prev.faqRows, { id: makeId("faq"), question: "", answer: "" }],
    }));
  };

  const updateFaqRow = (rowId: string, field: "question" | "answer", value: string) => {
    setForm((prev) => ({
      ...prev,
      faqRows: prev.faqRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  };

  const removeFaqRow = (rowId: string) => {
    setForm((prev) => ({ ...prev, faqRows: prev.faqRows.filter((row) => row.id !== rowId) }));
  };

  const addRubricRow = () => {
    setForm((prev) => ({
      ...prev,
      rubricRows: [
        ...prev.rubricRows,
        { id: makeId("rub"), title: "", maxScore: "", fullScoreDescription: "" },
      ],
    }));
  };

  const updateRubricRow = (
    rowId: string,
    field: "title" | "maxScore" | "fullScoreDescription",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      rubricRows: prev.rubricRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  };

  const removeRubricRow = (rowId: string) => {
    setForm((prev) => ({
      ...prev,
      rubricRows: prev.rubricRows.length > 1 ? prev.rubricRows.filter((row) => row.id !== rowId) : prev.rubricRows,
    }));
  };

  const toggleLearningObjectivePreset = (objective: string) => {
    setForm((prev) => {
      const exists = prev.learningObjectivePresets.includes(objective);
      return {
        ...prev,
        learningObjectivePresets: exists
          ? prev.learningObjectivePresets.filter((item) => item !== objective)
          : [...prev.learningObjectivePresets, objective],
      };
    });
  };

  const handleClassCodeChange = (classCode: string) => {
    const room = roomByCode.get(classCode);
    const classSubject =
      prefs.subjectByClass?.[classCode] ||
      teacher?.subject ||
      form.subject ||
      tx("ทั่วไป", "General");
    const classQuestionChannel =
      prefs.questionChannelByClass?.[classCode] ||
      buildQuestionChannelDefault(room?.gradeRoom, classCode, settings.language);

    setForm((prev) => ({ ...prev, classCode, subject: classSubject, questionChannel: classQuestionChannel }));
  };

  const applyTemplate = (templateId: string) => {
    updateForm("templateId", templateId);
    const template = ASSIGNMENT_TEMPLATE_PRESETS.find((item) => item.id === templateId);
    if (!template) return;

    const aiDefaults = template.aiPolicyLevel ? AI_POLICY_DEFAULTS[template.aiPolicyLevel] : null;
    setForm((prev) => ({
      ...prev,
      templateId,
      instructions: template.instructions,
      steps: template.steps?.join("\n") || prev.steps,
      checklist: template.checklist?.join("\n") || prev.checklist,
      shortDescription: template.shortDescription || prev.shortDescription,
      assignmentType: template.assignmentType || prev.assignmentType,
      aiPolicyLevel: template.aiPolicyLevel || prev.aiPolicyLevel,
      aiAllowed: aiDefaults ? aiDefaults.allowed.join("\n") : prev.aiAllowed,
      aiForbidden: aiDefaults ? aiDefaults.forbidden.join("\n") : prev.aiForbidden,
      deliverables: [
        {
          id: makeId("del"),
          name: template.deliverable.name,
          submitType: template.deliverable.submitType,
          acceptedFormats: template.deliverable.acceptedFormats,
          requirement: template.deliverable.requirement,
          maxFileSizeMb: String(template.deliverable.maxFileSizeMb),
          fileNameTemplate: template.deliverable.fileNameTemplate,
        },
      ],
    }));
  };

  const insertStepsTemplateIntoInstructions = () => {
    setForm((prev) => ({
      ...prev,
      instructions: prev.instructions.trim()
        ? `${prev.instructions.trim()}\n\n${STEPS_TEMPLATE_TEXT}`
        : STEPS_TEMPLATE_TEXT,
    }));
  };

  const applyChecklistTemplate = (templateId: string) => {
    const template = CHECKLIST_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    setForm((prev) => ({ ...prev, checklist: template.items.join("\n") }));
  };

  const applyFaqTemplate = (templateId: string) => {
    const template = FAQ_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    setForm((prev) => ({
      ...prev,
      faqRows: template.rows.map((row) => ({ id: makeId("faq"), question: row.question, answer: row.answer })),
    }));
  };

  const handleAiPolicyLevelChange = (level: AiPolicyLevel) => {
    if (!level) return updateForm("aiPolicyLevel", "");
    const defaults = AI_POLICY_DEFAULTS[level];
    setForm((prev) => ({
      ...prev,
      aiPolicyLevel: level,
      aiAllowed: prev.aiAllowed.trim() ? prev.aiAllowed : defaults.allowed.join("\n"),
      aiForbidden: prev.aiForbidden.trim() ? prev.aiForbidden : defaults.forbidden.join("\n"),
    }));
  };

  const addResourceFiles = (key: "resources" | "deliverableExamples", files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items = Array.from(files).map((file) => ({
      id: makeId("res"),
      label: file.name,
      url: `file:${file.name}`,
    }));
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ...items] }));
  };

  const validateBeforeSubmit = () => {
    if (!form.classCode.trim()) return tx("กรุณาเลือกห้องเรียน", "Please select a classroom");
    if (!form.title.trim()) return tx("กรุณาระบุชื่องาน", "Please enter an assignment title");
    if (!form.deadline.trim()) return tx("กรุณาเลือกวันส่ง", "Please select a due date");
    if (!form.instructions.trim()) return tx("กรุณาระบุคำสั่งงาน", "Please enter instructions");
    if (form.deliverables.length === 0) {
      return tx("ต้องมีรายการที่ต้องส่งอย่างน้อย 1 รายการ", "At least one submission item is required");
    }
    for (const deliverable of form.deliverables) {
      if (!deliverable.requirement.trim()) {
        return tx("กรุณาระบุข้อกำหนดการส่งงาน", "Please specify the submission requirement");
      }
      if (deliverable.submitType === "file" && deliverable.acceptedFormats.length === 0) {
        return tx(
          "งานแบบไฟล์ต้องเลือกนามสกุลไฟล์อย่างน้อย 1 แบบ",
          "For file submissions, select at least one accepted format"
        );
      }
    }
    if (form.allowLate && !form.finalLateDate) {
      return tx("กรุณาระบุวันสุดท้ายที่รับงานส่งช้า", "Please set the latest accepted late submission date");
    }
    if (form.allowResubmit && !form.resubmitUntil) {
      return tx("กรุณาระบุวันสุดท้ายที่อนุญาตให้ส่งแก้", "Please set the resubmission deadline");
    }
    if (form.gradingMethod === "rubric") {
      const validRows = form.rubricRows.filter(
        (row) => row.title.trim() && row.fullScoreDescription.trim() && (Number(row.maxScore) || 0) > 0
      );
      if (validRows.length === 0) {
        return tx("กรุณาเพิ่มแถวรูบริกที่กรอกครบอย่างน้อย 1 แถว", "Please add at least one complete rubric row");
      }
    }
    return "";
  };

  const handleCreateAssignment = async () => {
    if (!teacher) return;

    try {
      const validationMessage = validateBeforeSubmit();
      if (validationMessage) throw new Error(validationMessage);

      const room = roomByCode.get(form.classCode);
      const targetClassCodes = [form.classCode.trim().toUpperCase()];
      const targetGradeRooms = room?.gradeRoom ? [room.gradeRoom] : [];

      const fullScore = Math.max(1, Number(form.fullScore) || 10);
      const estimateMinutes = Math.max(1, Number(form.estimatedDurationMinutes) || 60);
      const groupSize = Math.max(2, Number(form.groupSize) || 4);
      const stepLines = splitLines(form.steps);

      const finalInstructionText =
        form.mergeStepsIntoInstructions && stepLines.length > 0
          ? `${form.instructions.trim()}\n\n${tx("ขั้นตอน", "Steps")}\n${stepLines
              .map((line, index) => `${index + 1}) ${line}`)
              .join("\n")}`
          : form.instructions.trim();

      const instructionLines = splitLines(finalInstructionText);
      const learningObjectives = uniq([...form.learningObjectivePresets, ...splitLines(form.customLearningObjectives)]);

      const aiLevel = form.aiPolicyLevel;
      const aiDefaults = aiLevel ? AI_POLICY_DEFAULTS[aiLevel] : null;
      const aiAllowed = splitLines(form.aiAllowed);
      const aiForbidden = splitLines(form.aiForbidden);
      const aiPolicyNeeded = Boolean(aiLevel || aiAllowed.length > 0 || aiForbidden.length > 0 || form.aiNote.trim());
      const aiPolicy = aiPolicyNeeded
        ? {
            allowed: aiAllowed.length > 0 ? aiAllowed : aiDefaults?.allowed || [],
            forbidden: aiForbidden.length > 0 ? aiForbidden : aiDefaults?.forbidden || [],
            note: form.aiNote.trim() || undefined,
          }
        : undefined;

      const resources = form.resources
        .map((row) => ({ label: row.label.trim(), url: row.url.trim() }))
        .filter((row) => row.label && row.url);
      const deliverableExamples = form.deliverableExamples
        .map((row) => ({ label: row.label.trim(), url: row.url.trim() }))
        .filter((row) => row.label && row.url);

      const rubricRows =
        form.gradingMethod === "rubric"
          ? form.rubricRows
              .map((row) => ({
                title: row.title.trim(),
                maxScore: Number(row.maxScore),
                fullScoreDescription: row.fullScoreDescription.trim(),
              }))
              .filter((row) => row.title && row.fullScoreDescription && Number.isFinite(row.maxScore) && row.maxScore > 0)
          : [
              {
                title: tx("คะแนนรวม", "Total score"),
                maxScore: fullScore,
                fullScoreDescription: tx(
                  "ให้คะแนนตามความครบถ้วนและความถูกต้อง",
                  "Scored by completeness and correctness"
                ),
              },
            ];

      const latePenaltyPolicy = form.allowLate
        ? form.latePenaltyPreset === LATE_PENALTY_PRESETS[2]
          ? form.latePenaltyCustom.trim()
          : form.latePenaltyPreset
        : undefined;

      const assignment: Omit<AssignmentRecord, "id" | "createdAt"> = {
        assignmentInfo: {
          title: form.title.trim(),
          subject: form.subject.trim() || teacher.subject || tx("ทั่วไป", "General"),
          targetGradeRooms,
          targetClassCodes,
          assignmentType: form.assignmentType,
          groupConfig:
            form.assignmentType === "group"
              ? { minMembers: groupSize, maxMembers: groupSize, groupingMethod: form.groupingMethod }
              : undefined,
          fullScore,
          gradeWeightPercent: form.gradeWeightPercent.trim() ? Number(form.gradeWeightPercent) : undefined,
          estimatedDurationMinutes: estimateMinutes,
          shortDescription: form.shortDescription.trim() || undefined,
        },
        taskBrief: {
          learningObjectives,
          steps: stepLines.length > 0 ? stepLines : instructionLines,
          dos: splitLines(form.dos),
          donts: splitLines(form.donts),
          checklist: splitLines(form.checklist),
          resources: resources.length > 0 ? resources : undefined,
          aiPolicy,
        },
        deliverables: {
          items: form.deliverables.map((item) => ({
            name: item.name.trim() || tx("งานที่ต้องส่ง", "Assignment submission"),
            submitType: item.submitType,
            acceptedFormats: item.submitType === "file" ? uniq(item.acceptedFormats.map((f) => f.toUpperCase())) : [],
            requirement: item.requirement.trim(),
            maxFileSizeMb: item.maxFileSizeMb.trim() ? Number(item.maxFileSizeMb) : undefined,
            fileNameTemplate: item.fileNameTemplate.trim() || FILENAME_TEMPLATE_PRESETS[0],
          })),
          examples: deliverableExamples.length > 0 ? deliverableExamples : undefined,
        },
        submission: {
          channel: form.submissionChannel,
          instructionSteps: instructionLines,
          deadline: toIso(form.deadline),
          allowLate: form.allowLate,
          lateUntil: form.allowLate && form.finalLateDate ? toIso(form.finalLateDate) : undefined,
          latePenaltyPolicy: latePenaltyPolicy || undefined,
          allowResubmit: form.allowResubmit,
          resubmitUntil: form.allowResubmit && form.resubmitUntil ? toIso(form.resubmitUntil) : undefined,
        },
        rubric: {
          method:
            form.gradingMethod === "rubric"
              ? form.legacyRubricMethod === "total_only"
                ? "rubric"
                : form.legacyRubricMethod
              : "total_only",
          rows:
            rubricRows.length > 0
              ? rubricRows
              : [
                  {
                    title: tx("คุณภาพโดยรวม", "Overall quality"),
                    maxScore: fullScore,
                    fullScoreDescription: tx("ให้คะแนนตามคุณภาพโดยรวม", "Scored by overall quality"),
                  },
                ],
          passRule: form.passRule.trim() || tx(">= 50% ของคะแนนเต็ม", ">= 50% of total score"),
          notes: form.rubricNotes.trim() || undefined,
        },
        qa: {
          questionChannel:
            form.questionChannel.trim() ||
            buildQuestionChannelDefault(room?.gradeRoom, form.classCode, settings.language),
          responseWindow: form.responseWindow.trim() || undefined,
          faq:
            form.faqRows
              .map((row) => ({ question: row.question.trim(), answer: row.answer.trim() }))
              .filter((row) => row.question && row.answer).length > 0
              ? form.faqRows
                  .map((row) => ({ question: row.question.trim(), answer: row.answer.trim() }))
                  .filter((row) => row.question && row.answer)
              : undefined,
        },
      };

      setIsSubmitting(true);
      await createDetailedAssignment(assignment);

      const primaryFileDeliverable = form.deliverables.find((item) => item.submitType === "file");
      const nextPrefs: FormPreferences = {
        ...prefs,
        fullScore,
        estimateMinutes,
        responseWindow: form.responseWindow.trim() || prefs.responseWindow,
        acceptedFormats:
          primaryFileDeliverable?.acceptedFormats && primaryFileDeliverable.acceptedFormats.length > 0
            ? uniq(primaryFileDeliverable.acceptedFormats)
            : prefs.acceptedFormats,
        subjectByClass: {
          ...(prefs.subjectByClass || {}),
          [form.classCode]: form.subject.trim() || teacher.subject || tx("ทั่วไป", "General"),
        },
        questionChannelByClass: { ...(prefs.questionChannelByClass || {}), [form.classCode]: form.questionChannel },
      };

      savePrefs(nextPrefs);
      setPrefs(nextPrefs);
      toast({
        title: tx("สร้างงานแล้ว", "Assignment created"),
        description: th
          ? `มอบหมายงาน "${form.title.trim()}" เรียบร้อย`
          : `Assigned "${form.title.trim()}" successfully`,
      });

      const subject = nextPrefs.subjectByClass?.[form.classCode] || teacher.subject || tx("ทั่วไป", "General");
      setForm(buildDefaultForm(form.classCode, currentRoom?.gradeRoom || "", subject, nextPrefs, settings.language));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      toast({
        title: tx("สร้างงานไม่สำเร็จ", "Unable to create assignment"),
        description: message || tx("กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง", "Please review the form and try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTeacher || !teacher) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 space-y-5">
        <div className="pt-6 space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            {tx("งานที่มอบหมาย", "Assigned Work")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx(
              "สร้างงานได้เร็วในโหมดพื้นฐาน และขยายโหมดขั้นสูงเมื่อต้องการรายละเอียดเพิ่ม",
              "Create tasks quickly in Basic mode, then expand Advanced for extra details."
            )}
          </p>
        </div>

        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="assigned" className="flex-1">
              {tx("รายการงาน", "Assignment List")}
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1">
              {tx("สร้างงานใหม่", "Create New")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-4 space-y-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {tx("กรองตามห้องเรียน", "Filter by classroom")}
                </p>
                <Select value={activeListClassCode} onValueChange={setActiveListClassCode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tx("ทุกห้องเรียน", "All classrooms")}</SelectItem>
                    {teacherClassrooms.map((room) => (
                      <SelectItem key={room.code} value={room.code}>
                        {room.gradeRoom} ({room.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {tx("งานที่มอบหมาย", "Assigned Work")} ({visibleAssignments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {visibleAssignments.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                    {tx("ยังไม่มีงานในมุมมองนี้", "No assignments in this view yet.")}
                  </div>
                )}
                {visibleAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{assignment.assignmentInfo.title}</p>
                        <p className="text-xs text-muted-foreground">{assignment.assignmentInfo.subject}</p>
                      </div>
                      <Badge variant="secondary">
                        {assignment.assignmentInfo.assignmentType === "group"
                          ? tx("กลุ่ม", "Group")
                          : tx("เดี่ยว", "Individual")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assignment.assignmentInfo.targetClassCodes.map((code) => (
                        <Badge key={code} variant="outline">
                          {code}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tx("กำหนดส่ง:", "Due:")} {formatDateThai(assignment.submission.deadline, settings.language)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="mt-4 space-y-4">
            {teacherClassrooms.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  {tx("กรุณาสร้างห้องเรียนก่อนมอบหมายงาน", "Please create a classroom before assigning work.")}
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      {tx("ข้อมูลงานหลัก (พื้นฐาน)", "Core Assignment Info (Basic)")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label>{tx("เทมเพลต (ไม่บังคับ)", "Template (optional)")}</Label>
                      <Select value={form.templateId || "none"} onValueChange={(value) => applyTemplate(value === "none" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={tx("เลือกเทมเพลต", "Select a template")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{tx("ไม่ใช้เทมเพลต", "No template")}</SelectItem>
                          {ASSIGNMENT_TEMPLATE_PRESETS.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>{tx("ห้องเรียน", "Classroom")} <span className="text-destructive">*</span></Label>
                      <Select value={form.classCode} onValueChange={handleClassCodeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={tx("เลือกห้องเรียน", "Select classroom")} />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherClassrooms.map((room) => (
                            <SelectItem key={room.code} value={room.code}>
                              {room.gradeRoom} ({room.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>{tx("ชื่องาน", "Assignment title")} <span className="text-destructive">*</span></Label>
                      <Input value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder={tx("เช่น ใบงานบทที่ 5", "e.g. Worksheet 5")} />
                    </div>

                    <div className="space-y-1">
                      <Label>{tx("กำหนดส่ง", "Due date")} <span className="text-destructive">*</span></Label>
                      <Input type="datetime-local" value={form.deadline} onChange={(event) => updateForm("deadline", event.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>{tx("รายวิชา", "Subject")}</Label>
                        <Select value={form.subject || tx("ทั่วไป", "General")} onValueChange={(value) => updateForm("subject", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {subjectOptions.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>{tx("ประเภทงาน", "Assignment type")}</Label>
                        <Select value={form.assignmentType} onValueChange={(value: "individual" | "group") => updateForm("assignmentType", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">{tx("เดี่ยว", "Individual")}</SelectItem>
                            <SelectItem value="group">{tx("กลุ่ม", "Group")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>{tx("คะแนนเต็ม", "Total score")}</Label>
                        <Input type="number" min={1} value={form.fullScore} onChange={(event) => updateForm("fullScore", event.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>{tx("เวลาประมาณ (นาที)", "Estimated time (minutes)")}</Label>
                        <Select value={String(form.estimatedDurationMinutes)} onValueChange={(value) => updateForm("estimatedDurationMinutes", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTIMATE_OPTIONS.map((item) => (
                              <SelectItem key={item} value={String(item)}>
                                {item} {tx("นาที", "min")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {form.assignmentType === "group" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>{tx("จำนวนสมาชิกต่อกลุ่ม", "Members per group")}</Label>
                          <Input type="number" min={2} value={form.groupSize} onChange={(event) => updateForm("groupSize", event.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>{tx("วิธีจัดกลุ่ม", "Grouping method")}</Label>
                          <Select value={form.groupingMethod} onValueChange={(value: GroupingMethod) => updateForm("groupingMethod", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="teacher_assigns">{tx("ครูจัดกลุ่ม", "Teacher assigns")}</SelectItem>
                              <SelectItem value="students_choose">{tx("นักเรียนเลือกเอง", "Students choose")}</SelectItem>
                              <SelectItem value="random">{tx("สุ่ม", "Random")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <Collapsible open={mainAdvancedOpen} onOpenChange={setMainAdvancedOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between rounded-lg px-2">
                          <span>{tx("ขั้นสูง: รายละเอียดเพิ่มเติม", "Advanced: More details")}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${mainAdvancedOpen ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <Label>{tx("คำอธิบายสั้น (ไม่เกิน 200 ตัวอักษร)", "Short description (max 200 chars)")}</Label>
                          <Textarea value={form.shortDescription} onChange={(event) => updateForm("shortDescription", event.target.value.slice(0, 200))} className="min-h-[72px]" />
                          <p className="text-xs text-muted-foreground text-right">{form.shortDescription.length}/200</p>
                        </div>
                        <div className="space-y-1">
                          <Label>{tx("สัดส่วนคะแนน (%)", "Grade weight (%)")}</Label>
                          <Input type="number" min={0} value={form.gradeWeightPercent} onChange={(event) => updateForm("gradeWeightPercent", event.target.value)} placeholder={tx("ไม่บังคับ", "Optional")} />
                        </div>
                        <div className="rounded-lg border border-border p-2 space-y-2 text-xs text-muted-foreground">
                          <p>{tx("ฟิลด์แบบเก่าที่ซ้ำกันจะถูกซ่อนอัตโนมัติ", "Duplicated legacy fields are auto-hidden.")}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">targetClassCodes: {form.classCode || "-"}</Badge>
                            <Badge variant="outline">targetGradeRooms: {currentRoom?.gradeRoom || "-"}</Badge>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {tx("คำสั่งงาน + สิ่งที่ต้องส่ง (พื้นฐาน)", "Instructions + Deliverables (Basic)")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Label>{tx("คำสั่งงาน", "Instructions")} <span className="text-destructive">*</span></Label>
                        <Button variant="outline" size="sm" onClick={insertStepsTemplateIntoInstructions}>
                          {tx("แทรกแม่แบบขั้นตอน", "Insert steps template")}
                        </Button>
                      </div>
                      <Textarea value={form.instructions} onChange={(event) => updateForm("instructions", event.target.value)} className="min-h-[110px]" placeholder={tx("อธิบายงานให้ชัดเจนสำหรับนักเรียน", "Describe the assignment clearly for students")} />
                    </div>

                    <div className="space-y-1">
                      <Label>{tx("นโยบาย AI (ไม่บังคับ)", "AI policy (optional)")}</Label>
                      <Select value={form.aiPolicyLevel || "unset"} onValueChange={(value) => handleAiPolicyLevelChange(value === "unset" ? "" : (value as AiPolicyLevel))}>
                        <SelectTrigger>
                          <SelectValue placeholder={tx("เลือกนโยบาย AI", "Select AI policy")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unset">{tx("ยังไม่กำหนด", "Not set")}</SelectItem>
                          <SelectItem value="none">{tx("ไม่อนุญาต", "Not allowed")}</SelectItem>
                          <SelectItem value="limited">{tx("จำกัด", "Limited")}</SelectItem>
                          <SelectItem value="allowed">{tx("อนุญาต", "Allowed")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{tx("สิ่งที่ต้องส่ง", "Deliverables")} <span className="text-destructive">*</span></Label>
                        <Button variant="outline" size="sm" onClick={addDeliverable}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> {tx("เพิ่มรายการ", "Add item")}
                        </Button>
                      </div>
                      {form.deliverables.map((item, index) => (
                        <div key={item.id} className="rounded-lg border border-border p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {tx("รายการส่งงาน", "Deliverable")} {index + 1}
                            </p>
                            {form.deliverables.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => removeDeliverable(item.id)} className="h-8 w-8">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label>{tx("ชื่อรายการ", "Item name")}</Label>
                            <Input value={item.name} onChange={(event) => updateDeliverable(item.id, "name", event.target.value)} placeholder={tx("เช่น ไฟล์ใบงานฉบับสุดท้าย", "e.g. Final worksheet file")} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label>{tx("ประเภทการส่ง", "Submit type")} <span className="text-destructive">*</span></Label>
                              <Select value={item.submitType} onValueChange={(value: SubmitType) => updateDeliverable(item.id, "submitType", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="file">{tx("ไฟล์", "File")}</SelectItem>
                                  <SelectItem value="link">{tx("ลิงก์", "Link")}</SelectItem>
                                  <SelectItem value="text">{tx("ข้อความ", "Text")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label>{tx("ข้อกำหนด", "Requirement")} <span className="text-destructive">*</span></Label>
                              <Input value={item.requirement} onChange={(event) => updateDeliverable(item.id, "requirement", event.target.value)} placeholder={tx("เช่น อัปโหลดไฟล์ฉบับสุดท้าย", "e.g. Upload the final file")} />
                            </div>
                          </div>
                          {item.submitType === "file" && (
                            <div className="space-y-1">
                              <Label>{tx("รูปแบบไฟล์ที่รับ", "Accepted formats")} <span className="text-destructive">*</span></Label>
                              <div className="flex flex-wrap gap-2">
                                {ACCEPTED_FORMAT_OPTIONS.map((format) => {
                                  const active = item.acceptedFormats.includes(format);
                                  return (
                                    <Button key={format} type="button" variant={active ? "default" : "outline"} size="sm" onClick={() => toggleAcceptedFormat(item.id, format)}>
                                      {format}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between rounded-lg px-2">
                                <span>{tx("ตัวเลือกไฟล์เพิ่มเติม (ไม่บังคับ)", "Extra file options (optional)")}</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 pt-2">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label>{tx("ขนาดไฟล์สูงสุด (MB)", "Max file size (MB)")}</Label>
                                  <Input type="number" min={1} value={item.maxFileSizeMb} onChange={(event) => updateDeliverable(item.id, "maxFileSizeMb", event.target.value)} />
                                </div>
                                <div className="space-y-1">
                                  <Label>{tx("แม่แบบชื่อไฟล์", "File name template")}</Label>
                                  <Select value={FILENAME_TEMPLATE_PRESETS.includes(item.fileNameTemplate) ? item.fileNameTemplate : "__custom__"} onValueChange={(value) => {
                                    if (value === "__custom__") return;
                                    updateDeliverable(item.id, "fileNameTemplate", value);
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FILENAME_TEMPLATE_PRESETS.map((preset) => (
                                        <SelectItem key={preset} value={preset}>
                                          {preset}
                                        </SelectItem>
                                      ))}
                                      <SelectItem value="__custom__">{tx("กำหนดเอง", "Custom")}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Input value={item.fileNameTemplate} onChange={(event) => updateDeliverable(item.id, "fileNameTemplate", event.target.value)} placeholder="{room}_{no}_{name}_{title}" />
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>

                    <Collapsible open={briefAdvancedOpen} onOpenChange={setBriefAdvancedOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between rounded-lg px-2">
                          <span>{tx("ขั้นสูง: รายละเอียดเนื้อหาเพิ่มเติม", "Advanced: More content details")}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${briefAdvancedOpen ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label>{tx("จุดประสงค์การเรียนรู้", "Learning objectives")}</Label>
                          <div className="flex flex-wrap gap-2">
                            {LEARNING_OBJECTIVE_PRESETS.map((objective) => {
                              const active = form.learningObjectivePresets.includes(objective);
                              return (
                                <Button type="button" key={objective} variant={active ? "default" : "outline"} size="sm" onClick={() => toggleLearningObjectivePreset(objective)}>
                                  {objective}
                                </Button>
                              );
                            })}
                          </div>
                          <Textarea value={form.customLearningObjectives} onChange={(event) => updateForm("customLearningObjectives", event.target.value)} className="min-h-[72px]" placeholder={tx("เพิ่มจุดประสงค์เพิ่มเติม (1 บรรทัดต่อ 1 ข้อ)", "Add custom objectives (1 line per item)")} />
                        </div>

                        <div className="space-y-1">
                          <Label>{tx("ขั้นตอน", "Steps")}</Label>
                          <Textarea value={form.steps} onChange={(event) => updateForm("steps", event.target.value)} className="min-h-[82px]" placeholder={tx("1 บรรทัดต่อ 1 ขั้นตอน", "1 line per step")} />
                          <div className="flex items-center justify-between rounded-lg border border-border p-2">
                            <p className="text-xs text-muted-foreground">
                              {tx("รวมขั้นตอนเข้ากับคำสั่งงาน", "Merge Steps into Instructions")}
                            </p>
                            <Switch checked={form.mergeStepsIntoInstructions} onCheckedChange={(checked) => updateForm("mergeStepsIntoInstructions", checked)} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>{tx("ควรทำ", "Do")}</Label>
                            <Textarea value={form.dos} onChange={(event) => updateForm("dos", event.target.value)} className="min-h-[80px]" placeholder={tx("1 บรรทัดต่อ 1 ข้อ", "1 line per item")} />
                          </div>
                          <div className="space-y-1">
                            <Label>{tx("ไม่ควรทำ", "Don't")}</Label>
                            <Textarea value={form.donts} onChange={(event) => updateForm("donts", event.target.value)} className="min-h-[80px]" placeholder={tx("1 บรรทัดต่อ 1 ข้อ", "1 line per item")} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>{tx("เช็กลิสต์", "Checklist")}</Label>
                            <div className="flex gap-2 flex-wrap justify-end">
                              {CHECKLIST_TEMPLATES.map((template) => (
                                <Button key={template.id} type="button" variant="outline" size="sm" onClick={() => applyChecklistTemplate(template.id)}>
                                  {template.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <Textarea value={form.checklist} onChange={(event) => updateForm("checklist", event.target.value)} className="min-h-[80px]" placeholder={tx("1 บรรทัดต่อ 1 ข้อ", "1 line per item")} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>{tx("แหล่งข้อมูล", "Resources")}</Label>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => addResourceRow("resources")}>
                                <Plus className="w-3.5 h-3.5 mr-1" /> {tx("เพิ่มลิงก์", "Add link")}
                              </Button>
                              <Label className="cursor-pointer">
                                <span className="sr-only">{tx("อัปโหลดไฟล์แหล่งข้อมูล", "Upload resource file")}</span>
                                <span className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-xs">{tx("เพิ่มไฟล์", "Add file")}</span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(event) => {
                                    addResourceFiles("resources", event.target.files);
                                    event.currentTarget.value = "";
                                  }}
                                />
                              </Label>
                            </div>
                          </div>
                          {form.resources.map((resource) => (
                            <div key={resource.id} className="grid grid-cols-[1fr,1fr,auto] gap-2">
                              <Input value={resource.label} onChange={(event) => updateResourceRow("resources", resource.id, "label", event.target.value)} placeholder={tx("ชื่อ", "Label")} />
                              <Input value={resource.url} onChange={(event) => updateResourceRow("resources", resource.id, "url", event.target.value)} placeholder={tx("URL หรือ file:...", "URL or file:...")} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeResourceRow("resources", resource.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>{tx("ตัวอย่างชิ้นงาน", "Deliverable examples")}</Label>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => addResourceRow("deliverableExamples")}>
                                <Plus className="w-3.5 h-3.5 mr-1" /> {tx("เพิ่มตัวอย่าง", "Add example")}
                              </Button>
                              <Label className="cursor-pointer">
                                <span className="sr-only">{tx("อัปโหลดไฟล์ตัวอย่าง", "Upload example file")}</span>
                                <span className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-xs">{tx("เพิ่มไฟล์", "Add file")}</span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(event) => {
                                    addResourceFiles("deliverableExamples", event.target.files);
                                    event.currentTarget.value = "";
                                  }}
                                />
                              </Label>
                            </div>
                          </div>
                          {form.deliverableExamples.map((resource) => (
                            <div key={resource.id} className="grid grid-cols-[1fr,1fr,auto] gap-2">
                              <Input value={resource.label} onChange={(event) => updateResourceRow("deliverableExamples", resource.id, "label", event.target.value)} placeholder={tx("ชื่อ", "Label")} />
                              <Input value={resource.url} onChange={(event) => updateResourceRow("deliverableExamples", resource.id, "url", event.target.value)} placeholder={tx("URL หรือ file:...", "URL or file:...")} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeResourceRow("deliverableExamples", resource.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>{tx("รายการ AI ที่อนุญาต", "AI allowed list")}</Label>
                            <Textarea value={form.aiAllowed} onChange={(event) => updateForm("aiAllowed", event.target.value)} className="min-h-[70px]" />
                          </div>
                          <div className="space-y-1">
                            <Label>{tx("รายการ AI ที่ห้าม", "AI forbidden list")}</Label>
                            <Textarea value={form.aiForbidden} onChange={(event) => updateForm("aiForbidden", event.target.value)} className="min-h-[70px]" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>{tx("หมายเหตุ AI", "AI note")}</Label>
                          <Textarea value={form.aiNote} onChange={(event) => updateForm("aiNote", event.target.value)} className="min-h-[70px]" />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {tx("การส่งงาน + การให้คะแนน + ถาม-ตอบ (พื้นฐาน)", "Submission + Grading + Q&A (Basic)")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label>{tx("ช่องทางส่งงาน", "Submission channel")}</Label>
                      <Select value={form.submissionChannel} onValueChange={(value) => updateForm("submissionChannel", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBMISSION_CHANNEL_OPTIONS.map((channel) => (
                            <SelectItem key={channel} value={channel}>
                              {submissionChannelLabel(channel)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-xl border border-border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{tx("อนุญาตส่งงานช้า", "Allow late submissions")}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx(
                              "หากเปิดใช้งาน กรุณาระบุวันสุดท้ายที่รับและนโยบายหักคะแนน",
                              "If enabled, set the final accepted date and late penalty policy"
                            )}
                          </p>
                        </div>
                        <Switch checked={form.allowLate} onCheckedChange={(checked) => updateForm("allowLate", checked)} />
                      </div>
                      {form.allowLate && (
                        <>
                          <div className="space-y-1">
                            <Label>{tx("วันสุดท้ายที่รับงานส่งช้า", "Final accepted late date")}</Label>
                            <Input type="datetime-local" value={form.finalLateDate} onChange={(event) => updateForm("finalLateDate", event.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label>{tx("นโยบายหักคะแนนส่งช้า", "Late penalty policy")}</Label>
                              <Select value={form.latePenaltyPreset} onValueChange={(value) => updateForm("latePenaltyPreset", value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LATE_PENALTY_PRESETS.map((preset) => (
                                    <SelectItem key={preset} value={preset}>
                                      {preset}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {form.latePenaltyPreset === LATE_PENALTY_PRESETS[2] && (
                              <div className="space-y-1">
                                <Label>{tx("นโยบายกำหนดเอง", "Custom policy")}</Label>
                                <Input value={form.latePenaltyCustom} onChange={(event) => updateForm("latePenaltyCustom", event.target.value)} placeholder={tx("เช่น -5% ทุก 2 วัน", "e.g. -5% every 2 days")} />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="rounded-xl border border-border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{tx("อนุญาตส่งแก้", "Allow resubmission")}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx("หากเปิดใช้งาน กรุณาระบุวันสิ้นสุดการส่งแก้", "If enabled, set the resubmission deadline")}
                          </p>
                        </div>
                        <Switch checked={form.allowResubmit} onCheckedChange={(checked) => updateForm("allowResubmit", checked)} />
                      </div>
                      {form.allowResubmit && (
                        <div className="space-y-1">
                          <Label>{tx("ส่งแก้ได้ถึง", "Resubmission until")}</Label>
                          <Input type="datetime-local" value={form.resubmitUntil} onChange={(event) => updateForm("resubmitUntil", event.target.value)} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label>{tx("วิธีให้คะแนน", "Grading method")}</Label>
                      <Select value={form.gradingMethod} onValueChange={(value: GradingMethod) => updateForm("gradingMethod", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">{tx("ให้คะแนนรวม", "Simple score")}</SelectItem>
                          <SelectItem value="rubric">{tx("รูบริก", "Rubric")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.gradingMethod === "simple" ? (
                      <div className="space-y-1">
                        <Label>{tx("เกณฑ์ผ่าน", "Pass rule")}</Label>
                        <Input value={form.passRule} onChange={(event) => updateForm("passRule", event.target.value)} placeholder={tx(">= 50% ของคะแนนเต็ม", ">= 50% of total score")} />
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between">
                          <Label>{tx("ตารางรูบริก", "Rubric table")}</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addRubricRow}>
                            <Plus className="w-3.5 h-3.5 mr-1" /> {tx("เพิ่มแถว", "Add row")}
                          </Button>
                        </div>
                        {form.rubricRows.map((row) => (
                          <div key={row.id} className="grid grid-cols-[1fr,88px,1fr,auto] gap-2">
                            <Input value={row.title} onChange={(event) => updateRubricRow(row.id, "title", event.target.value)} placeholder={tx("หัวข้อ", "Title")} />
                            <Input type="number" min={1} value={row.maxScore} onChange={(event) => updateRubricRow(row.id, "maxScore", event.target.value)} placeholder={tx("คะแนน", "Score")} />
                            <Input value={row.fullScoreDescription} onChange={(event) => updateRubricRow(row.id, "fullScoreDescription", event.target.value)} placeholder={tx("คำอธิบาย", "Description")} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeRubricRow(row.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="text-xs text-muted-foreground">
                          {tx("คะแนนรูบริกรวม", "Rubric total")}: {rubricTotal} / {tx("คะแนนเต็ม", "Full score")}: {Number(form.fullScore) || 10}
                        </div>
                        {rubricTotal > 0 && rubricTotal !== (Number(form.fullScore) || 10) && (
                          <p className="text-xs text-amber-600">
                            {tx("คำเตือน: คะแนนรวมรูบริกไม่เท่าคะแนนเต็ม", "Warning: rubric total does not equal full score")}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>{tx("ช่องทางถามคำถาม", "Question channel")}</Label>
                        <Select value={form.questionChannel} onValueChange={(value) => updateForm("questionChannel", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionChannelOptions.map((channel) => (
                              <SelectItem key={channel} value={channel}>
                                {channel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>{tx("ช่วงเวลาตอบกลับ", "Response window")}</Label>
                        <Select value={RESPONSE_WINDOW_PRESETS.includes(form.responseWindow) ? form.responseWindow : "__custom__"} onValueChange={(value) => {
                          if (value === "__custom__") return;
                          updateForm("responseWindow", value);
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RESPONSE_WINDOW_PRESETS.map((windowLabel) => (
                              <SelectItem key={windowLabel} value={windowLabel}>
                                {windowLabel}
                              </SelectItem>
                            ))}
                            <SelectItem value="__custom__">{tx("กำหนดเอง", "Custom")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Input value={form.responseWindow} onChange={(event) => updateForm("responseWindow", event.target.value)} placeholder={tx("กำหนดช่วงเวลาตอบกลับเอง", "Set custom response window")} />

                    <Collapsible open={gradingAdvancedOpen} onOpenChange={setGradingAdvancedOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between rounded-lg px-2">
                          <span>{tx("ขั้นสูง: FAQ และหมายเหตุ", "Advanced: FAQ and notes")}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${gradingAdvancedOpen ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pt-2">
                        {form.gradingMethod === "rubric" && (
                          <div className="space-y-1">
                            <Label>{tx("โหมดรูบริกแบบเดิม (รองรับระบบเก่า)", "Legacy rubric mode (compatibility)")}</Label>
                            <Select value={form.legacyRubricMethod} onValueChange={(value: LegacyRubricMethod) => updateForm("legacyRubricMethod", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rubric">{tx("รูบริก", "rubric")}</SelectItem>
                                <SelectItem value="checklist">{tx("เช็กลิสต์", "checklist")}</SelectItem>
                                <SelectItem value="total_only">{tx("รวมคะแนนอย่างเดียว", "total_only")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label>{tx("หมายเหตุการให้คะแนน", "Rubric notes")}</Label>
                          <Textarea value={form.rubricNotes} onChange={(event) => updateForm("rubricNotes", event.target.value)} className="min-h-[70px]" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>FAQ</Label>
                            <div className="flex gap-2">
                              {FAQ_TEMPLATES.map((template) => (
                                <Button key={template.id} type="button" variant="outline" size="sm" onClick={() => applyFaqTemplate(template.id)}>
                                  {template.label}
                                </Button>
                              ))}
                              <Button type="button" variant="outline" size="sm" onClick={addFaqRow}>
                                <Plus className="w-3.5 h-3.5 mr-1" /> {tx("เพิ่ม FAQ", "Add FAQ")}
                              </Button>
                            </div>
                          </div>
                          {form.faqRows.map((row) => (
                            <div key={row.id} className="grid grid-cols-[1fr,1fr,auto] gap-2">
                              <Input value={row.question} onChange={(event) => updateFaqRow(row.id, "question", event.target.value)} placeholder={tx("คำถาม", "Question")} />
                              <Input value={row.answer} onChange={(event) => updateFaqRow(row.id, "answer", event.target.value)} placeholder={tx("คำตอบ", "Answer")} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeFaqRow(row.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Button className="w-full rounded-xl" disabled={isSubmitting} onClick={handleCreateAssignment}>
                      {isSubmitting
                        ? tx("กำลังสร้างงาน...", "Creating assignment...")
                        : tx("สร้างงาน", "Create assignment")}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeacherAssignments;
