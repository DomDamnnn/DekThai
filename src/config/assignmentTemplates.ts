export type DeliverableSubmitType = "file" | "link" | "text";

export type AssignmentTemplateId = "report" | "worksheet" | "slides" | "video" | "group_project";

export interface DeliverableDraftPreset {
  name: string;
  submitType: DeliverableSubmitType;
  acceptedFormats: string[];
  requirement: string;
  maxFileSizeMb: number;
  fileNameTemplate: string;
}

export interface AssignmentTemplatePreset {
  id: AssignmentTemplateId;
  label: string;
  description: string;
  assignmentType?: "individual" | "group";
  shortDescription?: string;
  instructions: string;
  steps?: string[];
  checklist?: string[];
  aiPolicyLevel?: "none" | "limited" | "allowed";
  deliverable: DeliverableDraftPreset;
}

export const ACCEPTED_FORMAT_OPTIONS = ["PDF", "DOCX", "PPTX", "JPG", "PNG", "MP4", "ZIP"];

export const ESTIMATE_OPTIONS = [15, 30, 45, 60, 90, 120];

export const FILENAME_TEMPLATE_PRESETS = [
  "{room}_{no}_{name}_{title}",
  "{classCode}_{studentId}_{title}",
  "{title}_{name}",
  "{title}_{submittedAt}",
];

export const RESPONSE_WINDOW_PRESETS = [
  "จ.-ศ. 08:00-16:00",
  "จ.-ศ. 08:00-20:00",
  "ทุกวัน 08:00-20:00",
  "ทุกวัน 24 ชั่วโมง",
];

export const LATE_PENALTY_PRESETS = ["-10%/วัน", "-1 คะแนน/วัน", "กำหนดเอง"];

export const SUBMISSION_CHANNEL_OPTIONS = ["In DekThai", "Google Classroom", "ส่งหน้าห้อง"];

export const LEARNING_OBJECTIVE_PRESETS = [
  "อธิบายแนวคิดหลักของบทเรียนได้",
  "ประยุกต์ใช้ความรู้แก้โจทย์ใหม่ได้",
  "สื่อสารความคิดอย่างเป็นระบบ",
  "ตรวจสอบความถูกต้องของคำตอบได้",
  "ทำงานร่วมกับผู้อื่นอย่างมีประสิทธิภาพ",
];

export const CHECKLIST_TEMPLATES = [
  {
    id: "basic_submission",
    label: "เช็กลิสต์ส่งงานพื้นฐาน",
    items: ["ตรวจชื่อ-ห้องให้ถูกต้อง", "ไฟล์เปิดได้", "ส่งก่อนกำหนด"],
  },
  {
    id: "report_quality",
    label: "เช็กลิสต์รายงาน",
    items: ["มีบทนำ", "มีเนื้อหาหลักครบ", "มีสรุป", "อ้างอิงแหล่งข้อมูล"],
  },
  {
    id: "presentation",
    label: "เช็กลิสต์งานนำเสนอ",
    items: ["สไลด์อ่านง่าย", "เวลาไม่เกินที่กำหนด", "มีสรุปท้ายเรื่อง"],
  },
] as const;

export const FAQ_TEMPLATES = [
  {
    id: "deadline",
    label: "คำถามเส้นตาย",
    rows: [
      {
        question: "ส่งช้าได้หรือไม่?",
        answer: "ได้ตามนโยบายส่งช้าที่กำหนดในงานนี้",
      },
    ],
  },
  {
    id: "format",
    label: "คำถามรูปแบบไฟล์",
    rows: [
      {
        question: "รับไฟล์ประเภทไหนบ้าง?",
        answer: "ดูจากรายการ Accepted formats ในส่วน Deliverable",
      },
      {
        question: "ตั้งชื่อไฟล์อย่างไร?",
        answer: "ใช้รูปแบบชื่อไฟล์ตามที่กำหนดในงาน",
      },
    ],
  },
] as const;

export const ASSIGNMENT_TEMPLATE_PRESETS: AssignmentTemplatePreset[] = [
  {
    id: "report",
    label: "รายงาน (1 หน้า)",
    description: "สรุปใจความสำคัญ 1 หน้า",
    shortDescription: "รายงานสรุป 1 หน้า",
    instructions:
      "เขียนรายงานสรุปเนื้อหา 1 หน้า โดยใช้ภาษาของตนเองและยกตัวอย่างประกอบอย่างน้อย 1 ตัวอย่าง",
    steps: ["อ่านเนื้อหาที่กำหนด", "สรุปใจความสำคัญ", "ตรวจทานและส่งไฟล์"],
    checklist: ["ยาวประมาณ 1 หน้า", "มีตัวอย่างประกอบ", "ระบุชื่อ-ห้องเรียน"],
    aiPolicyLevel: "limited",
    deliverable: {
      name: "รายงาน 1 หน้า",
      submitType: "file",
      acceptedFormats: ["PDF", "DOCX"],
      requirement: "ส่งไฟล์รายงาน 1 หน้า",
      maxFileSizeMb: 20,
      fileNameTemplate: "{room}_{no}_{name}_{title}",
    },
  },
  {
    id: "worksheet",
    label: "ใบงาน",
    description: "ตอบคำถามจากใบงาน",
    shortDescription: "ทำใบงานและส่งคำตอบ",
    instructions: "ทำใบงานให้ครบทุกข้อ แสดงวิธีคิดในข้อที่คำนวณ และส่งภายในกำหนด",
    steps: ["อ่านคำสั่งแต่ละข้อ", "ทำคำตอบให้ครบ", "ตรวจคำตอบก่อนส่ง"],
    checklist: ["ตอบครบทุกข้อ", "ลายมืออ่านได้หรือพิมพ์ชัดเจน"],
    aiPolicyLevel: "none",
    deliverable: {
      name: "คำตอบใบงาน",
      submitType: "file",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      requirement: "ส่งไฟล์คำตอบใบงานครบทุกหน้า",
      maxFileSizeMb: 20,
      fileNameTemplate: "{room}_{no}_{name}_{title}",
    },
  },
  {
    id: "slides",
    label: "สไลด์",
    description: "งานนำเสนอแบบสไลด์",
    shortDescription: "จัดทำสไลด์นำเสนอ",
    instructions: "จัดทำสไลด์นำเสนอหัวข้อที่ได้รับมอบหมาย จำนวน 6-10 หน้า พร้อมแหล่งอ้างอิง",
    steps: ["วางโครงเรื่อง", "ออกแบบสไลด์", "ซ้อมและตรวจทาน"],
    checklist: ["สไลด์อ่านง่าย", "มีแหล่งอ้างอิง", "เนื้อหาครบตามหัวข้อ"],
    aiPolicyLevel: "limited",
    deliverable: {
      name: "ไฟล์สไลด์",
      submitType: "file",
      acceptedFormats: ["PPTX", "PDF"],
      requirement: "ส่งไฟล์สไลด์ฉบับสมบูรณ์",
      maxFileSizeMb: 30,
      fileNameTemplate: "{room}_{no}_{name}_{title}",
    },
  },
  {
    id: "video",
    label: "วิดีโอ",
    description: "ส่งผลงานเป็นวิดีโอ",
    shortDescription: "วิดีโออธิบายผลงาน",
    instructions: "อัดวิดีโออธิบายผลงานความยาว 3-5 นาที เนื้อหาชัดเจนและเสียงชัดเจน",
    steps: ["เขียนสคริปต์ย่อ", "บันทึกวิดีโอ", "อัปโหลดและทดสอบลิงก์/ไฟล์"],
    checklist: ["ความยาวตามกำหนด", "ภาพและเสียงชัดเจน", "เนื้อหาครบหัวข้อ"],
    aiPolicyLevel: "allowed",
    deliverable: {
      name: "วิดีโอผลงาน",
      submitType: "file",
      acceptedFormats: ["MP4"],
      requirement: "ส่งไฟล์วิดีโอหรือแนบลิงก์วิดีโอ",
      maxFileSizeMb: 100,
      fileNameTemplate: "{room}_{no}_{name}_{title}",
    },
  },
  {
    id: "group_project",
    label: "โปรเจกต์กลุ่ม",
    description: "ชิ้นงานแบบกลุ่ม",
    assignmentType: "group",
    shortDescription: "โครงงานกลุ่ม",
    instructions: "ทำโครงงานกลุ่มตามหัวข้อที่เลือก แบ่งหน้าที่ชัดเจน และสรุปผลการทำงานร่วมกัน",
    steps: ["วางแผนและแบ่งงาน", "ลงมือทำตามบทบาท", "รวมผลงานและสะท้อนการเรียนรู้"],
    checklist: ["ระบุสมาชิกครบ", "สรุปบทบาทแต่ละคน", "มีหลักฐานการทำงาน"],
    aiPolicyLevel: "limited",
    deliverable: {
      name: "ไฟล์สรุปโครงงานกลุ่ม",
      submitType: "file",
      acceptedFormats: ["PDF", "DOCX", "PPTX", "ZIP"],
      requirement: "ส่งรายงานสรุปและไฟล์ประกอบโครงงาน",
      maxFileSizeMb: 50,
      fileNameTemplate: "{room}_{group}_{title}",
    },
  },
];
