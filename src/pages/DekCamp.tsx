import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Bookmark,
  Bell,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Code,
  Palette,
  Briefcase,
  Heart,
  Clock
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { IMAGES } from '@/assets/images';

interface CampItem {
  id: string;
  title: string;
  category: string;
  type: 'ค่าย' | 'แข่งขัน' | 'ทุนการศึกษา';
  deadline: string;
  startDate: string;
  location: string;
  organizer: string;
  description: string;
  requirements: string[];
  link: string;
  image: string;
  isSaved: boolean;
}

const mockCamps: CampItem[] = [
  {
    id: '1',
    title: 'DekThai AI Hackathon 2026',
    category: 'AI & Technology',
    type: 'แข่งขัน',
    deadline: '2026-03-15',
    startDate: '2026-04-01',
    location: 'Online / Bangkok',
    organizer: 'สถาบันเทคโนโลยี DekThai',
    description: 'แข่งขันสร้างนวัตกรรม AI เพื่อแก้ปัญหาการศึกษาไทย ชิงเงินรางวัลรวมกว่า 100,000 บาท',
    requirements: ['นักเรียนมัธยมปลาย', 'ทีมละ 3-5 คน', 'มีความสนใจด้านโปรแกรมมิ่งหรือดีไซน์'],
    link: 'https://example.com/ai-hackathon',
    image: IMAGES.CLASSROOM_BG_1,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Young Business Leader Camp',
    category: 'Business',
    type: 'ค่าย',
    deadline: '2026-03-20',
    startDate: '2026-05-10',
    location: 'จุฬาลงกรณ์มหาวิทยาลัย',
    organizer: 'คณะพาณิชยศาสตร์และการบัญชี',
    description: 'เรียนรู้ทักษะการเป็นผู้ประกอบการรุ่นเยาว์ ตั้งแต่การวางแผนธุรกิจไปจนถึงการ Pitching',
    requirements: ['นักเรียนมัธยมศึกษาปีที่ 4-6', 'เกรดเฉลี่ย 3.00 ขึ้นไป'],
    link: 'https://example.com/business-camp',
    image: IMAGES.CLASSROOM_BG_2,
    isSaved: true,
  },
  {
    id: '3',
    title: 'Creative Design Workshop',
    category: 'Design',
    type: 'ค่าย',
    deadline: '2026-04-05',
    startDate: '2026-06-15',
    location: 'TCDC Bangkok',
    organizer: 'Creative Economy Agency',
    description: 'เวิร์กชอปด้านการออกแบบกราฟิกและ UI/UX สำหรับนักเรียนที่อยากเข้าสายอาร์ต',
    requirements: ['นักเรียนมัธยมทุกระดับชั้น', 'มีผลงานวาดภาพหรือออกแบบเบื้องต้น'],
    link: 'https://example.com/design-ws',
    image: IMAGES.CLASSROOM_BG_3,
    isSaved: false,
  },
  {
    id: '4',
    title: 'STEM Scholarship for Future',
    category: 'Science',
    type: 'ทุนการศึกษา',
    deadline: '2026-05-01',
    startDate: '2026-08-01',
    location: 'National',
    organizer: 'กระทรวงการอุดมศึกษาฯ',
    description: 'ทุนการศึกษาต่อระดับปริญญาตรีในสาขา STEM สำหรับนักเรียนที่มีผลการเรียนดีเด่น',
    requirements: ['นักเรียนมัธยมศึกษาปีที่ 6', 'GPAX 3.50 ขึ้นไป', 'ผ่านการทดสอบมาตรฐานตามกำหนด'],
    link: 'https://example.com/stem-scholarship',
    image: IMAGES.CLASSROOM_BG_4,
    isSaved: false,
  },
  {
    id: '5',
    title: 'Volunteer Teachers for Rural Schools',
    category: 'Volunteer',
    type: 'ค่าย',
    deadline: '2026-03-10',
    startDate: '2026-04-20',
    location: 'จังหวัดเชียงราย',
    organizer: 'มูลนิธิกระจกเงา',
    description: 'ค่ายอาสาพัฒนาโรงเรียนในถิ่นทุรกันดาร สอนหนังสือและปรับปรุงภูมิทัศน์',
    requirements: ['นักเรียนมัธยมอายุ 15 ปีขึ้นไป', 'มีความรับผิดชอบและรักเด็ก'],
    link: 'https://example.com/volunteer-camp',
    image: IMAGES.CLASSROOM_BG_5,
    isSaved: false,
  }
];

const categories = [
  { name: 'ทั้งหมด', icon: <Filter className="w-4 h-4" /> },
  { name: 'AI & Tech', icon: <Code className="w-4 h-4" /> },
  { name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
  { name: 'Design', icon: <Palette className="w-4 h-4" /> },
  { name: 'Science', icon: <GraduationCap className="w-4 h-4" /> },
  { name: 'Volunteer', icon: <Heart className="w-4 h-4" /> },
];

const DekCamp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [selectedCamp, setSelectedCamp] = useState<CampItem | null>(null);

  const filteredCamps = mockCamps.filter(camp => {
    const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          camp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ทั้งหมด' || camp.category.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-background pb-24">
        {/* Header Section */}
        <header className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">โอกาสนอกห้องเรียน</h1>
          <p className="text-muted-foreground">ค้นหาค่าย แข่งขัน และทุนการศึกษาเพื่ออนาคต</p>
        </header>

        {/* Search and Filters */}
        <div className="px-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อค่าย หรือทักษะที่สนใจ..."
              className="pl-10 h-12 rounded-2xl border-none bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-2 pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.name}
                  variant={activeCategory === cat.name ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-full h-9 px-4 flex items-center gap-2 transition-all ${
                    activeCategory === cat.name ? 'bg-primary text-white shadow-lg' : ''
                  }`}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  {cat.icon}
                  {cat.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>

        {/* Opportunity List */}
        <div className="px-6 mt-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredCamps.length > 0 ? (
              filteredCamps.map((camp, index) => (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group rounded-3xl">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={camp.image}
                        alt={camp.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-md border-none shadow-sm">
                          {camp.type}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur-md border-none shadow-sm h-8 w-8">
                          <Bookmark className={`w-4 h-4 ${camp.isSaved ? 'fill-primary text-primary' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-medium text-primary mb-1">{camp.category}</p>
                          <CardTitle className="text-lg leading-tight">{camp.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span>ปิดรับ {formatDate(camp.deadline)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{camp.location}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full rounded-xl bg-muted/50 text-foreground hover:bg-primary hover:text-white group-hover:bg-primary group-hover:text-white transition-all"
                        onClick={() => setSelectedCamp(camp)}
                      >
                        ดูรายละเอียด
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">ไม่พบผลการค้นหา</h3>
                <p className="text-muted-foreground">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่อื่นดูนะ</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Camp Detail Dialog */}
        <Dialog open={!!selectedCamp} onOpenChange={() => setSelectedCamp(null)}>
          <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none">
            {selectedCamp && (
              <div className="flex flex-col">
                <div className="relative h-56">
                  <img
                    src={selectedCamp.image}
                    alt={selectedCamp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <Badge className="bg-primary text-white mb-2 border-none">
                      {selectedCamp.type}
                    </Badge>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {selectedCamp.title}
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">วันรับสมัคร</p>
                        <p className="text-xs font-semibold">ถึง {formatDate(selectedCamp.deadline)}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">สถานที่</p>
                        <p className="text-xs font-semibold">{selectedCamp.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      รายละเอียด
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedCamp.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      คุณสมบัติผู้สมัคร
                    </h3>
                    <ul className="space-y-1">
                      {selectedCamp.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-sm">จัดโดย</h3>
                    <p className="text-sm text-primary font-medium">{selectedCamp.organizer}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl gap-2"
                    onClick={() => {}}
                  >
                    <Bookmark className="w-4 h-4" />
                    บันทึกไว้
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl bg-primary text-white gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={() => window.open(selectedCamp.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    สมัครเลย
                  </Button>
                </div>
                
                <div className="px-6 pb-6">
                  <Button 
                    variant="ghost" 
                    className="w-full rounded-xl text-primary hover:bg-primary/5 gap-2"
                    onClick={() => {}}
                  >
                    <Bell className="w-4 h-4" />
                    เตือนก่อนปิดรับสมัคร
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DekCamp;