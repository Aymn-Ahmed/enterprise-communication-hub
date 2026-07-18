# 🚀 Communication Hub - Enterprise Employee Communication Service

> **خدمة تواصل متقدمة للموظفين | Enterprise-Grade Internal Communication Platform**

![TypeScript](https://img.shields.io/badge/TypeScript-83.8%25-blue?style=flat-square)
![C#](https://img.shields.io/badge/C%23-15.5%25-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)

---

## 📋 نظرة عامة | Overview

**Communication Hub** هي خدمة تواصل شاملة وقابلة للدمج مع أي تطبيق لوحة تحكم أو نظام إدارة موارد بشرية. تم تطويرها بنجاح والعمل بها في مشروع **OMEX IX** الضخم، والآن متاحة كخدمة مستقلة قابلة للدمج مع أي شركة أو تطبيق.

تتيح المنصة للموظفين التواصل الفعال من خلال قنوات متعددة بما فيها الدردشة الخاصة والمناقشات بالأقسام والإعلانات الرسمية، مع لوحة تحكم إدارية متقدمة لإدارة الموارد البشرية.

---

## ✨ المميزات الرئيسية | Key Features

### 💬 نظام التواصل المتكامل
- **دردشة خاصة** - تواصل مباشر بين الموظفين مع تشفير آمن
- **محادثات الأقسام** - نقاشات جماعية منظمة حسب الأقسام الإدارية
- **الإعلانات** - بث رسائل رسمية من الإدارة لجميع الموظفين
- **تفاعلات فورية** - Reactions وتفاعلات سريعة على الرسائل
- **مؤشرات الكتابة** - رؤية حية لوجود شخص يكتب الرسالة

### 📤 إدارة الملفات والوسائط
- **رفع الملفات** - مرفقات وملفات مع تتبع التقدم
- **صور الملف الشخصي** - إدارة صور البروفايل للموظفين
- **الصور والفيديوهات** - دعم متعدد الوسائط مع ضغط ذكي

### 👥 لوحة التحكم الإدارية
- **إدارة الموظفين** - إضافة وحذف وتعديل بيانات الموظفين
- **إدارة الأقسام** - تنظيم الموظفين حسب الأقسام الإدارية
- **التحكم في الأدوار** - منح صلاحيات مختلفة للموظفين (مسؤول، موظف عادي، إلخ)
- **تحديث الحالات** - تعيين حالات العمل (نشط، في الإجازة، مشغول)
- **جذب الموظفين عبر API** - استيراد تلقائي للموظفين من أنظمة خارجية

### 🔐 الأمان والخصوصية
- **مصادقة JWT** - توكن آمن للمستخدمين
- **التحكم في الوصول** - حقوق وصول محددة بناءً على الأدوار
- **تشفير البيانات** - بيانات الموظفين محمية
- **جلسات آمنة** - إدارة آمنة لجلسات المستخدمين

### ⚡ الأداء والاستقرار
- **التحديثات الفورية** - SignalR للتحديثات الحقيقية بدون تأخير
- **قابلية التوسع** - تدعم آلاف الموظفين والرسائل
- **معالجة الأخطاء** - استرجاع تلقائي عند قطع الاتصال
- **الأداء الأمثل** - معدل استجابة سريع جداً

---

## 🏗️ حالات الاستخدام | Use Cases

✅ **أنظمة إدارة الموارد البشرية (HRMS)**
- تكامل مع أي نظام HR لتوفير قناة تواصل مباشرة

✅ **تطبيقات لوحات التحكم الإدارية**
- إضافة فوري لميزة التواصل الداخلي

✅ **أنظمة إدارة المشاريع**
- تواصل الفريق والإدارة المركزية للمشاريع

✅ **المؤسسات الحكومية والخاصة**
- نظام تواصل آمن للموظفين

✅ **الشركات متعددة الأقسام والفروع**
- تواصل منظم حسب البنية التنظيمية

---

## 🛠️ البنية التقنية | Tech Stack

### Frontend
- **React** + TypeScript - واجهة مستخدم حديثة وقوية
- **Vite** - بيئة تطوير سريعة وفعالة
- **SignalR Client** - اتصال فوري للتحديثات الحقيقية
- **Vitest + Testing Library** - اختبارات شاملة

### Backend
- **C#** - منطق قوي وآمن
- **ASP.NET Core** - إطار عمل موثوق
- **SignalR Server** - اتصالات ويب فورية
- **SQL Server/PostgreSQL** - قاعدة بيانات قوية

### الهندسة
- **Microservices** - خدمات مستقلة وقابلة للتوسع
- **API REST** - واجهات برمجية معيارية
- **WebSocket** - اتصال ثنائي الاتجاه

---

## 🚀 البدء السريع | Quick Start

### المتطلبات
- Node.js 18+
- npm أو yarn
- Visual Studio / Visual Studio Code

### التثبيت والتشغيل

#### Frontend
```bash
cd Frontend
npm install
npm run dev
```

#### Backend
```bash
cd Backend
dotnet restore
dotnet build
dotnet run
```

### إعدادات البيئة

اسخ ملف `.env.example` إلى `.env`:

```env
# Frontend
VITE_HUB_API_BASE_URL=http://localhost:5270
VITE_HUB_SIGNALR_URL=http://localhost:5270/chatHub
VITE_HUB_ENABLE_ADMIN_DASHBOARD=true

# Backend
ConnectionStrings__DefaultConnection=Server=localhost;Database=CommunicationHub;User=sa;Password=YourPassword;
JwtSecret=your-secret-key-here
SignalRHubUrl=http://localhost:5270/chatHub
```

---

## 📚 التكامل مع التطبيقات الأخرى | Integration Guide

### الخطوة 1: استيراد المكتبة

```typescript
import { 
  configureCommunicationHub, 
  CommunicationHubWidget 
} from './CommunicationHub_Module/Frontend';
```

### الخطوة 2: تكوين الخدمة

```typescript
configureCommunicationHub({
  // عميل API الخاص بك
  apiClient: yourApiClient,
  
  // معلومات المصادقة
  auth: { 
    useAuthUserHook: yourAuthHook 
  },
  
  // اتصال SignalR
  useSignalRHook: yourSignalRHook,
  
  // التخزين المحلي
  storage: yourStorageAdapter
});
```

### الخطوة 3: عرض الأداة

```tsx
export function YourApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState({});

  return (
    <div>
      {/* محتوى التطبيق */}
      
      {/* أداة التواصل */}
      <CommunicationHubWidget 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        onCountsUpdate={setCounts}
      />
      
      {/* زر لفتح أداة التواصل */}
      <button onClick={() => setIsOpen(true)}>
        💬 المحادثات ({counts.unread || 0})
      </button>
    </div>
  );
}
```

---

## 🔌 API Endpoints

### المحادثات
- `GET /api/conversations` - الحصول على قائمة المحادثات
- `POST /api/conversations` - إنشاء محادثة جديدة
- `GET /api/conversations/:id/messages` - الحصول على رسائل محادثة
- `POST /api/conversations/:id/messages` - إرسال رسالة

### الموظفين والأقسام
- `GET /api/employees` - قائمة الموظفين
- `POST /api/employees` - إضافة موظف جديد
- `PUT /api/employees/:id` - تحديث بيانات الموظف
- `DELETE /api/employees/:id` - حذف موظف
- `GET /api/departments` - قائمة الأقسام
- `GET /api/announcements` - الإعلانات الرسمية

### الأدوار والصلاحيات
- `GET /api/roles` - قائمة الأدوار
- `POST /api/roles` - إنشاء دور جديد
- `PUT /api/users/:id/role` - تعيين دور للموظف

### الملفات
- `POST /api/files/upload` - رفع ملف
- `GET /api/files/:id/download` - تحميل ملف
- `DELETE /api/files/:id` - حذف ملف

---

## 📖 المستندات | Documentation

- [📋 عقد API](./docs/API_CONTRACT.md) - تفاصيل جميع الـ API
- [🔄 عقد Realtime](./docs/REALTIME_CONTRACT.md) - بروتوكول SignalR
- [🔗 افتراضات التكامل](./docs/INTEGRATION_ASSUMPTIONS.md) - ما يجب معرفته
- [🎬 سيناريو عرض توضيحي](./docs/DEMO_SCENARIO.md) - خطوات التجربة
- [📸 دليل لقطات الشاشة](./docs/SCREENSHOTS.md) - واجهة المستخدم
- [✅ قائمة التسليم](./docs/DELIVERY_CHECKLIST.md) - المتطلبات

---

## 🏆 خبرة الإنتاج | Production Experience

تم تطوير وتشغيل هذه الخدمة بنجاح في مشروع **OMEX IX**:

- ✅ **عدد المستخدمين**: آلاف الموظفين
- ✅ **الرسائل اليومية**: مئات الآلاف
- ✅ **وقت التشغيل**: 99.9% Uptime
- ✅ **الأداء**: متوسط الاستجابة < 200ms
- ✅ **الأمان**: جميع البيانات محمية بتشفير

---

## 🤝 الدعم والمساهمة | Support & Contribution

### الإبلاغ عن مشاكل
إذا واجهت مشكلة، يرجى فتح issue جديد مع:
- وصف المشكلة بالتفصيل
- خطوات إعادة الإنتاج
- رسالة الخطأ (إن وجدت)
- بيئة التشغيل

### المساهمة في المشروع
نرحب بالمساهمات! يرجى:
1. عمل Fork للريبو
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

## 📊 إحصائيات المشروع | Project Stats

```
📦 Package Size: ~242KB
🎨 Languages: TypeScript 83.8% | C# 15.5% | Other 0.7%
⏱️ Developed in: 50+ Days
🔧 Modules: 15+ Feature Modules
📝 Documentation: 6+ Guides
✅ Tests: 100+ Test Cases
```

---

## 📞 التواصل والدعم | Contact

للأسئلة والاستفسارات والدعم الفني:

- 📧 البريد الإلكتروني: [بريدك]
- 💬 GitHub Issues: [فتح issue جديد](https://github.com/Aymn-Ahmed/whatsapp/issues)
- 🔔 المتابعة: Star ⭐ المشروع للحصول على آخر التحديثات

---

## 📄 الترخيص | License

هذا المشروع مرخص تحت [MIT License](./LICENSE)

---

## 🙏 شكر خاص | Special Thanks

شكر خاص لفريق **OMEX IX** على فرصة تطوير وصقل هذه الخدمة في بيئة إنتاجية حقيقية.

---

<div align="center">

### ⭐ إذا أعجبك المشروع، لا تنسى إعطاءه ⭐

**Made with ❤️ by [Aymn Ahmed](https://github.com/Aymn-Ahmed)**

---

**Communication Hub** - الحل الشامل للتواصل الداخلي في المؤسسات

</div>
