import React from 'react';
import {
    FaTimes, FaQuestionCircle, FaCalendarAlt, FaBullhorn,
    FaCommentDots, FaPaperclip, FaMicrophone, FaImage,
    FaFileAlt, FaCamera, FaPaperPlane, FaExpandArrowsAlt, FaCompressArrowsAlt, FaThumbtack
} from 'react-icons/fa';
import UserAvatar from '../common/UserAvatar';
import type { MessageCategory, LookUp, UserLookUp } from '../../types/hub.types';

interface NewMessageFormProps {
    category: MessageCategory;
    setCategory: (category: MessageCategory) => void;
    departments: LookUp[];
    selectedDepartment: string;
    setSelectedDepartment: (dept: string) => void;
    allUsers: UserLookUp[];
    selectedUsers: number[];
    setSelectedUsers: (users: number[]) => void;
    messageText: string;
    setMessageText: (text: string) => void;
    appointmentDate: string;
    setAppointmentDate: (date: string) => void;
    appointmentTime: string;
    setAppointmentTime: (time: string) => void;
    announcementTitle: string;
    setAnnouncementTitle: (title: string) => void;
    additionalNotes: string;
    setAdditionalNotes: (notes: string) => void;
    isRecording: boolean;
    recordingBlob: any;
    startRecording: () => void;
    showAttachmentMenu: boolean;
    setShowAttachmentMenu: (show: boolean) => void;
    isUploadingFile: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    attachmentUrls: string[];
    isSubmitting: boolean;
    handleSubmit: () => void;
    onCancel: () => void;
    onClose: () => void;
    onToggleFullScreen: () => void;
    isFullScreen: boolean;
    onTogglePinned: () => void;
    isPinned: boolean;
    selectedChatUser: UserLookUp | null;
    setSelectedChatUser: (user: UserLookUp | null) => void;
    renderRecordingUI: (color: string, border: string, bg: string, hover: string) => React.ReactNode;
    renderPendingAttachments: (accentColor: string) => React.ReactNode;
    locationPreview?: { lat: number; lng: number } | null;
    setLocationPreview?: (loc: { lat: number; lng: number } | null) => void;
}

/**
 * Component for creating a new message (Question, Appointment, Announcement, or Chat).
 */
const NewMessageForm: React.FC<NewMessageFormProps> = (
    {
    category,
    setCategory,
    departments,
    selectedDepartment,
    setSelectedDepartment,
    allUsers,
    selectedUsers,
    setSelectedUsers,
    messageText,
    setMessageText,
    appointmentDate,
    setAppointmentDate,
    appointmentTime,
    setAppointmentTime,
    announcementTitle,
    setAnnouncementTitle,
    additionalNotes,
    setAdditionalNotes,
    isRecording,
    recordingBlob,
    startRecording,
    showAttachmentMenu,
    setShowAttachmentMenu,
    isUploadingFile,
    fileInputRef,
    handleFileUpload,
    attachmentUrls,
    isSubmitting,
    handleSubmit,
    onCancel,
    onClose,
    onToggleFullScreen,
    isFullScreen,
    onTogglePinned,
    isPinned,
    selectedChatUser,
    setSelectedChatUser,
    renderRecordingUI,
    renderPendingAttachments,
    locationPreview,
    setLocationPreview
}) => {
    return (
        <div>

        </div>
    );
};

export default NewMessageForm;
// this is the new message form

// <div className="w-full h-full max-w-4xl mx-auto bg-[var(--hub-bg)] flex flex-col p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden shadow-2xl rounded-3xl border border-[var(--hub-border)]">
// {/* Window Controls */}
// <div className="flex items-center justify-end gap-2 mb-6">
//     <button
//         onClick={onClose}
//         className="w-9 h-9 rounded-xl bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 text-white flex items-center justify-center transition-all active:scale-90"
//         title="إغلاق"
//     >
//         <FaTimes className="text-sm" />
//     </button>
//     <button
//         onClick={onToggleFullScreen}
//         className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20 text-white flex items-center justify-center transition-all active:scale-90"
//         title={isFullScreen ? 'تصغير' : 'تكبير'}
//     >
//         {isFullScreen ? <FaCompressArrowsAlt className="text-sm" /> : <FaExpandArrowsAlt className="text-sm" />}
//     </button>
//     <button
//         onClick={onTogglePinned}
//         className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${isPinned ? 'bg-yellow-400 text-gray-900 shadow-yellow-500/20' : 'bg-[var(--hub-input-bg)] text-[var(--hub-text-muted)] hover:text-yellow-500'}`}
//         title={isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
//     >
//         <FaThumbtack className={`text-sm ${isPinned ? 'rotate-45' : ''}`} />
//     </button>
// </div>

// {/* Premium Header */}
// <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--hub-border)]">
//     <button
//         onClick={onCancel}
//         className="flex items-center gap-2 px-4 py-2 text-[var(--hub-text-muted)] hover:text-[#6366F1] hover:bg-[var(--hub-hover)] rounded-2xl transition-all active:scale-90 border border-transparent hover:border-[var(--hub-border)] group"
//         title="الرجوع"
//     >
//         <svg className="w-5 h-5 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
//         <span className="font-black text-sm">التراجع</span>
//     </button>
//     <div className="flex flex-col items-center flex-1">
//         <h3 className="text-3xl font-black text-[var(--hub-text-main)] mb-1">
//             إنشاء مراسلة جديدة
//         </h3>
//         <div className="h-1.5 w-16 bg-gradient-to-r from-[#6366F1] to-purple-600 rounded-full"></div>
//     </div>
//     <div className="w-12 h-12 bg-[var(--hub-panel-bg)] shadow-xl rounded-[1.5rem] flex items-center justify-center border border-[var(--hub-border)] text-[#6366F1]">
//         <FaPaperPlane className="text-xl animate-bounce" />
//     </div>
// </div>

// {/* Category Selector */}
// <div className="bg-[var(--hub-panel-bg)] p-2 rounded-[2rem] flex items-center gap-2 mb-10 shadow-xl border border-[var(--hub-border)]" dir="rtl">
//     {[
//         { id: 'questions', name: 'أسئلة', icon: FaQuestionCircle, color: '#3B82F6', bg: 'bg-[#3B82F6]' },
//         { id: 'appointments', name: 'مواعيد', icon: FaCalendarAlt, color: '#10B981', bg: 'bg-[#10B981]' },
//         { id: 'announcements', name: 'تعاميم', icon: FaBullhorn, color: '#F97316', bg: 'bg-[#F97316]' },
//         { id: 'chat', name: 'دردشة', icon: FaCommentDots, color: '#A855F7', bg: 'bg-[#A855F7]' }
//     ].map(tab => (
//         <button
//             key={tab.id}
//             onClick={() => setCategory(tab.id as MessageCategory)}
//             className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-3xl font-black text-base transition-all duration-300 transform active:scale-95 ${category === tab.id
//                 ? `${tab.bg} text-white shadow-lg scale-105`
//                 : 'text-[var(--hub-text-secondary)] hover:text-[var(--hub-text-main)] hover:bg-[var(--hub-hover)]'}`}
//         >
//             <tab.icon className={`text-2xl transition-transform duration-500 ${category === tab.id ? 'scale-110 rotate-12' : 'opacity-70 group-hover:scale-110'}`} />
//             <span className="hidden sm:inline">{tab.name}</span>
//         </button>
//     ))}
// </div>

// <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4 space-y-4">
//     {category === 'questions' && (
//         <div className="flex flex-col space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
//             <div className="relative group" dir="rtl">
//                 <div className="flex items-center gap-3 mb-3 justify-start">
//                     <div className="w-10 h-10 rounded-2xl bg-[#3B82F6] shadow-lg shadow-blue-500/30 flex items-center justify-center text-white ring-4 ring-blue-500/10">
//                         <FaBullhorn className="text-base" />
//                     </div>
//                     <label className="text-lg font-black text-[var(--hub-text-main)] cursor-pointer">القسم الموجه إليه السؤال *</label>
//                 </div>
//                 <div className="relative">
//                     <select
//                         value={selectedDepartment}
//                         onChange={(e) => {
//                             setSelectedDepartment(e.target.value);
//                             setSelectedUsers([]);
//                         }}
//                         className="w-full border-[3px] border-[var(--hub-border)] rounded-[1.5rem] py-5 px-6 text-[15px] font-black text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-[#3B82F6] focus:ring-8 focus:ring-blue-500/10 transition-all appearance-none shadow-xl cursor-pointer hover:border-blue-300"
//                         dir="rtl"
//                     >
//                         <option value="">(اختياري) اختر القسم للأسئلة المحددة</option>
//                         {departments.map((dept) => (
//                             <option key={dept.Id} value={dept.Id}>
//                                 جروب: {dept.Name}
//                             </option>
//                         ))}
//                     </select>
//                     <div className="absolute top-1/2 left-6 -translate-y-1/2 pointer-events-none text-[#3B82F6]">
//                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
//                     </div>
//                 </div>
//             </div>

//             {selectedDepartment && selectedDepartment !== 'all' && (
//                 <div className="flex flex-col space-y-4 border-[3px] border-blue-500/10 rounded-[2rem] p-6 bg-blue-500/5 backdrop-blur-sm shadow-inner">
//                     <div className="flex items-center justify-between mb-2">
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 const deptUsers = allUsers.filter(u => u.WorkId === Number(selectedDepartment));
//                                 if (selectedUsers.length === deptUsers.length) {
//                                     setSelectedUsers([]);
//                                 } else {
//                                     setSelectedUsers(deptUsers.map(u => u.Id));
//                                 }
//                             }}
//                             className="bg-[#3B82F6] text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
//                         >
//                             إدراج جميع المسؤولين
//                         </button>
//                         <h4 className="text-base font-black text-blue-600">طاقم القسم المختار</h4>
//                     </div>
//                     <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2 custom-scrollbar" dir="rtl">
//                         {allUsers.filter(u => u.WorkId === Number(selectedDepartment)).length === 0 ? (
//                             <div className="col-span-full text-center text-sm text-blue-600 font-black py-8 bg-[var(--hub-panel-bg)] rounded-2xl border-2 border-dashed border-blue-500/20">لا يوجد مسؤولين مسجلين في هذا القسم</div>
//                         ) : (
//                             allUsers.filter(u => u.WorkId === Number(selectedDepartment)).map(u => (
//                                 <label key={u.Id} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all group/item shadow-sm hover:shadow-xl hover:-translate-y-1 ${selectedUsers.includes(u.Id) ? 'bg-[#3B82F6] border-[#3B82F6] text-white' : 'bg-[var(--hub-panel-bg)] border-[var(--hub-border)] text-[var(--hub-text-main)] hover:border-blue-300'}`}>
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedUsers.includes(u.Id)}
//                                         onChange={(e) => {
//                                             if (e.target.checked) setSelectedUsers([...selectedUsers, u.Id]);
//                                             else setSelectedUsers(selectedUsers.filter(id => id !== u.Id));
//                                         }}
//                                         className="w-6 h-6 rounded-lg accent-white cursor-pointer"
//                                     />
//                                     <span className="text-base font-black">{u.Name}</span>
//                                 </label>
//                             ))
//                         )}
//                     </div>
//                 </div>
//             )}

//             <div className="flex flex-col min-h-[120px] relative group" dir="rtl">
//                 <div className="flex items-center gap-3 mb-3 justify-start">
//                     <div className="w-10 h-10 rounded-2xl bg-[#3B82F6] shadow-lg shadow-blue-500/30 flex items-center justify-center text-white ring-4 ring-blue-500/10">
//                         <FaQuestionCircle className="text-base" />
//                     </div>
//                     <label className="text-lg font-black text-[var(--hub-text-main)]">نص السؤال الموجه *</label>
//                 </div>
//                 <div className="relative">
//                     {isRecording || recordingBlob ? (
//                         renderRecordingUI('#3B82F6', 'border-blue-500/20', 'bg-blue-500/5', 'hover:bg-blue-600')
//                     ) : (
//                         <>
//                             <textarea
//                                 className="w-full h-48 border-[3px] border-[var(--hub-border)] rounded-[2rem] p-6 pl-24 resize-none text-base font-bold text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-[#3B82F6] focus:ring-8 focus:ring-blue-500/10 placeholder-[var(--hub-text-muted)] transition-all shadow-xl"
//                                 placeholder="اكتب سؤالك هنا بأكبر قدر من التفصيل ليتم الرد عليك بدقة..."
//                                 value={messageText}
//                                 onChange={(e) => setMessageText(e.target.value)}
//                                 dir="rtl"
//                             ></textarea>
//                             <button
//                                 type="button"
//                                 onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
//                                 disabled={isUploadingFile}
//                                 className="absolute left-3 bottom-3 w-8 h-8 flex items-center justify-center rounded-full text-[var(--hub-text-muted)] hover:text-[#3B82F6] hover:bg-blue-500/10 transition-all attach-btn-ref"
//                                 title="إرفاق ملف"
//                             >
//                                 <FaPaperclip className={`text-lg transition-transform ${showAttachmentMenu ? 'rotate-45' : ''}`} />
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={startRecording}
//                                 disabled={isUploadingFile || attachmentUrls.length > 0 || isSubmitting}
//                                 className="absolute left-12 bottom-3 w-8 h-8 flex items-center justify-center rounded-full text-[var(--hub-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
//                                 title="تسجيل مقطع صوتي"
//                             >
//                                 <FaMicrophone className="text-lg" />
//                             </button>
//                         </>
//                     )}

//                     {showAttachmentMenu && (
//                         <div className="absolute bottom-12 left-0 bg-[var(--hub-panel-bg)] rounded-2xl shadow-xl border border-[var(--hub-border)] p-2 flex flex-col gap-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 attachment-menu-popup">
//                             <button
//                                 onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = 'image/*,video/*'; fileInputRef.current.click(); setTimeout(() => setShowAttachmentMenu(false), 100); } }}
//                                 className="flex items-center gap-3 px-4 py-2 hover:bg-blue-500/10 rounded-xl text-blue-600 text-sm font-bold transition-colors"
//                             >
//                                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
//                                     <FaImage />
//                                 </div>
//                                 <span>صورة / فيديو</span>
//                             </button>
//                             <button
//                                 onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt'; fileInputRef.current.click(); setTimeout(() => setShowAttachmentMenu(false), 100); } }}
//                                 className="flex items-center gap-3 px-4 py-2 hover:bg-emerald-500/10 rounded-xl text-emerald-600 text-sm font-bold transition-colors"
//                             >
//                                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
//                                     <FaFileAlt />
//                                 </div>
//                                 <span>مستند</span>
//                             </button>
//                             <button
//                                 onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = 'image/*;capture=camera'; fileInputRef.current.click(); setTimeout(() => setShowAttachmentMenu(false), 100); } }}
//                                 className="flex items-center gap-3 px-4 py-2 hover:bg-orange-500/10 rounded-xl text-orange-600 text-sm font-bold transition-colors"
//                             >
//                                 <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
//                                     <FaCamera />
//                                 </div>
//                                 <span>كاميرا</span>
//                             </button>
//                             <button
//                                 onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = 'audio/*'; fileInputRef.current.click(); setTimeout(() => setShowAttachmentMenu(false), 100); } }}
//                                 className="flex items-center gap-3 px-4 py-2 hover:bg-purple-500/10 rounded-xl text-purple-600 text-sm font-bold transition-colors"
//                             >
//                                 <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
//                                     <FaMicrophone />
//                                 </div>
//                                 <span>صوتي</span>
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {renderPendingAttachments('#3B82F6')}
//             </div>
//         </div>
//     )}

//     {category === 'appointments' && (
//         <div className="flex flex-col space-y-4 animate-in fade-in duration-300">
//             <div className="relative group" dir="rtl">
//                 <div className="flex items-center gap-2 mb-2 justify-start">
//                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#10B981]">
//                         <FaCalendarAlt className="text-xs" />
//                     </div>
//                     <label className="text-sm font-black text-[var(--hub-text-main)] cursor-pointer">القسم الموجه إليه الموعد (اختياري)</label>
//                 </div>
//                 <div className="relative">
//                     <select
//                         className="w-full border-2 border-[var(--hub-border)] rounded-2xl py-4 px-5 text-sm font-bold text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-[#10B981] transition-all appearance-none shadow-sm cursor-pointer hover:border-emerald-300"
//                         value={selectedDepartment}
//                         onChange={(e) => {
//                             setSelectedDepartment(e.target.value);
//                             setSelectedUsers([]);
//                         }}
//                         dir="rtl"
//                     >
//                         <option value="">(اختياري) اختر القسم للإشعار</option>
//                         {departments.map((dept) => (
//                             <option key={dept.Id} value={dept.Id}>
//                                 جروب: {dept.Name}
//                             </option>
//                         ))}
//                     </select>
//                     <div className="absolute top-1/2 left-5 -translate-y-1/2 pointer-events-none text-[var(--hub-text-muted)] group-hover:text-[#10B981] transition-colors">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
//                     </div>
//                 </div>
//             </div>

//             {selectedDepartment && selectedDepartment !== 'all' && (
//                 <div className="flex flex-col space-y-3 border-2 border-emerald-500/10 rounded-2xl p-4 bg-emerald-500/5">
//                     <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-500/20">
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 const deptUsers = allUsers.filter(u => u.WorkId === Number(selectedDepartment));
//                                 if (selectedUsers.length === deptUsers.length) {
//                                     setSelectedUsers([]);
//                                 } else {
//                                     setSelectedUsers(deptUsers.map(u => u.Id));
//                                 }
//                             }}
//                             className="bg-[#10B981] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-green-600 transition-all shadow-sm active:scale-95"
//                         >
//                             تحديد الكل
//                         </button>
//                         <h4 className="text-right text-sm font-black text-emerald-600">المنفذين الأساسيين (اختياري)</h4>
//                     </div>
//                     <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-2 pr-2 custom-scrollbar" dir="rtl">
//                         {allUsers.filter(u => u.WorkId === Number(selectedDepartment)).length === 0 ? (
//                             <div className="col-span-2 text-center text-xs text-green-600 font-bold py-4 bg-[var(--hub-panel-bg)] rounded-xl border-dashed border-2 border-emerald-500/20">لا يوجد مستخدمين متاحين في هذا القسم</div>
//                         ) : (
//                             allUsers.filter(u => u.WorkId === Number(selectedDepartment)).map(u => (
//                                 <label key={u.Id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all group/item shadow-sm hover:shadow-md ${selectedUsers.includes(u.Id) ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-[var(--hub-panel-bg)] border-[var(--hub-border)] text-[var(--hub-text-main)] hover:border-emerald-300'}`}>
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedUsers.includes(u.Id)}
//                                         onChange={(e) => {
//                                             if (e.target.checked) setSelectedUsers([...selectedUsers, u.Id]);
//                                             else setSelectedUsers(selectedUsers.filter(id => id !== u.Id));
//                                         }}
//                                         className="w-5 h-5 rounded-lg accent-white cursor-pointer transition-all"
//                                     />
//                                     <span className="text-sm font-bold">{u.Name}</span>
//                                 </label>
//                             ))
//                         )}
//                     </div>
//                 </div>
//             )}

//             <div className="grid grid-cols-2 gap-6" dir="rtl">
//                 <div className="group">
//                     <label className="block text-right text-sm font-black text-[var(--hub-text-main)] mb-2">تاريخ الموعد *</label>
//                     <div className="relative flex items-center bg-transparent group overflow-hidden">
//                         <input
//                             type="text"
//                             placeholder="اختر تاريخ الموعد"
//                             value={appointmentDate ? appointmentDate.split('-').reverse().join('-') : ''}
//                             readOnly
//                             className="w-full border-2 border-[var(--hub-border)] rounded-2xl py-4 pr-10 pl-5 text-sm font-bold text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-[#10B981] transition-all shadow-sm pointer-events-none"
//                         />
//                         <input
//                             type="date"
//                             id="newFormAppointmentDatePicker"
//                             min={new Date().toISOString().split('T')[0]}
//                             value={appointmentDate}
//                             onChange={(e) => setAppointmentDate(e.target.value)}
//                             className="absolute inset-0 opacity-0 cursor-pointer z-10"
//                         />
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 const dateInput = document.getElementById('newFormAppointmentDatePicker') as HTMLInputElement;
//                                 dateInput?.showPicker?.();
//                             }}
//                             className="absolute right-4 text-[#10B981] z-20 transition-transform group-hover:scale-110"
//                         >
//                             <FaCalendarAlt size={16} />
//                         </button>
//                     </div>
//                 </div>
//                 <div className="group">
//                     <label className="block text-right text-sm font-black text-[var(--hub-text-main)] mb-2">الوقت *</label>
//                     <div className="relative">
//                         <input
//                             type="time"
//                             className="w-full border-2 border-[var(--hub-border)] rounded-2xl py-4 px-5 text-sm font-bold text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-[#10B981] transition-all shadow-sm"
//                             value={appointmentTime}
//                             onChange={(e) => setAppointmentTime(e.target.value)}
//                         />
//                     </div>
//                 </div>
//             </div>
//             <div className="flex flex-col min-h-[80px] relative">
//                 <label className="block text-right text-sm font-bold text-[#10B981] mb-2">ملاحظات إضافية</label>
//                 <div className="relative">
//                     {isRecording || recordingBlob ? (
//                         renderRecordingUI('#10B981', 'border-emerald-500/20', 'bg-emerald-500/5', 'hover:bg-green-600')
//                     ) : (
//                         <>
//                             <textarea
//                                 className="w-full h-24 border-2 border-emerald-500/20 rounded-xl p-3 pl-24 resize-none text-sm text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-green-400 placeholder-[var(--hub-text-muted)] transition-colors shadow-sm"
//                                 placeholder="ملاحظات حول الموعد..."
//                                 value={messageText}
//                                 onChange={(e) => setMessageText(e.target.value)}
//                                 dir="rtl"
//                             ></textarea>
//                             <button
//                                 type="button"
//                                 onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
//                                 disabled={isUploadingFile}
//                                 className="absolute left-3 bottom-3 w-8 h-8 flex items-center justify-center rounded-full text-[var(--hub-text-muted)] hover:text-[#10B981] hover:bg-emerald-500/10 transition-all attach-btn-ref"
//                                 title="إرفاق ملف"
//                             >
//                                 <FaPaperclip className={`text-lg transition-transform ${showAttachmentMenu ? 'rotate-45' : ''}`} />
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={startRecording}
//                                 disabled={isUploadingFile || attachmentUrls.length > 0 || isSubmitting}
//                                 className="absolute left-12 bottom-3 w-8 h-8 flex items-center justify-center rounded-full text-[var(--hub-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
//                                 title="تسجيل مقطع صوتي"
//                             >
//                                 <FaMicrophone className="text-lg" />
//                             </button>
//                         </>
//                     )}
//                 </div>
//                 {renderPendingAttachments('#10B981')}
//             </div>
//         </div>
//     )}

//     {category === 'announcements' && (
//         <div className="flex flex-col space-y-4 animate-in fade-in duration-300">
//             <div className="relative group" dir="rtl">
//                 <div className="flex items-center gap-2 mb-2 justify-start">
//                     <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F97316]">
//                         <FaBullhorn className="text-xs" />
//                     </div>
//                     <label className="text-sm font-black text-[var(--hub-text-main)] cursor-pointer">موجه إلى *</label>
//                 </div>
//                 <div className="relative">
//                     <select
//                         className="w-full border-2 border-[var(--hub-border)] rounded-2xl py-4 px-5 text-sm font-bold text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-[#F97316] transition-all appearance-none shadow-sm cursor-pointer hover:border-orange-300"
//                         value={selectedDepartment}
//                         onChange={(e) => {
//                             setSelectedDepartment(e.target.value);
//                             setSelectedUsers([]);
//                         }}
//                         dir="rtl"
//                     >
//                         <option value="all">جميع الأقسام (عام)</option>
//                         {departments.map((dept) => (
//                             <option key={dept.Id} value={dept.Id}>
//                                 جروب: {dept.Name} (فقط)
//                             </option>
//                         ))}
//                     </select>
//                     <div className="absolute top-1/2 left-5 -translate-y-1/2 pointer-events-none text-[var(--hub-text-muted)] group-hover:text-[#F97316] transition-colors">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
//                     </div>
//                 </div>
//             </div>

//             {selectedDepartment && selectedDepartment !== 'all' && (
//                 <div className="flex flex-col space-y-3 border-2 border-orange-500/10 rounded-2xl p-4 bg-orange-500/5">
//                     <div className="flex items-center justify-between mb-2 pb-2 border-b border-orange-500/20">
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 const deptUsers = allUsers.filter(u => u.WorkId === Number(selectedDepartment));
//                                 if (selectedUsers.length === deptUsers.length) {
//                                     setSelectedUsers([]);
//                                 } else {
//                                     setSelectedUsers(deptUsers.map(u => u.Id));
//                                 }
//                             }}
//                             className="bg-[#F97316] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm active:scale-95"
//                         >
//                             تحديد الكل
//                         </button>
//                         <h4 className="text-right text-sm font-black text-orange-600">المرسل إليهم (اختياري)</h4>
//                     </div>
//                     <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-2 pr-2 custom-scrollbar" dir="rtl">
//                         {allUsers.filter(u => u.WorkId === Number(selectedDepartment)).length === 0 ? (
//                             <div className="col-span-2 text-center text-xs text-orange-600 font-bold py-4 bg-[var(--hub-panel-bg)] rounded-xl border-dashed border-2 border-orange-500/20">لا يوجد مستخدمين متاحين في هذا القسم</div>
//                         ) : (
//                             allUsers.filter(u => u.WorkId === Number(selectedDepartment)).map(u => (
//                                 <label key={u.Id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all group/item shadow-sm hover:shadow-md ${selectedUsers.includes(u.Id) ? 'bg-[#F97316] border-[#F97316] text-white' : 'bg-[var(--hub-panel-bg)] border-[var(--hub-border)] text-[var(--hub-text-main)] hover:border-orange-300'}`}>
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedUsers.includes(u.Id)}
//                                         onChange={(e) => {
//                                             if (e.target.checked) setSelectedUsers([...selectedUsers, u.Id]);
//                                             else setSelectedUsers(selectedUsers.filter(id => id !== u.Id));
//                                         }}
//                                         className="w-5 h-5 rounded-lg accent-white cursor-pointer transition-all"
//                                     />
//                                     <UserAvatar user={u} size="sm" />
//                                     <span className="text-sm font-bold">{u.Name}</span>
//                                 </label>
//                             ))
//                         )}
//                     </div>
//                 </div>
//             )}

//             <div className="flex-1 flex flex-col min-h-[160px] relative group" dir="rtl">
//                 <div className="flex items-center gap-2 mb-2 justify-start">
//                     <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F97316]">
//                         <FaBullhorn className="text-xs" />
//                     </div>
//                     <label className="text-sm font-black text-[var(--hub-text-main)]">نص التعميم *</label>
//                 </div>
//                 <div className="relative flex-1 flex flex-col">
//                     {isRecording || recordingBlob ? (
//                         renderRecordingUI('#F97316', 'border-orange-500/20', 'bg-orange-500/5', 'hover:bg-orange-600')
//                     ) : (
//                         <>
//                             <textarea
//                                 className="w-full flex-1 min-h-[160px] border-2 border-[var(--hub-border)] rounded-2xl p-5 pl-24 resize-none text-sm font-medium text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-orange-400 placeholder-[var(--hub-text-muted)] transition-all shadow-sm"
//                                 placeholder="اكتب التوجيهات أو الأخبار هنا..."
//                                 value={messageText}
//                                 onChange={(e) => setMessageText(e.target.value)}
//                                 dir="rtl"
//                             ></textarea>
//                             <button
//                                 type="button"
//                                 onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
//                                 disabled={isSubmitting}
//                                 className="absolute left-3 bottom-3 w-8 h-8 flex items-center justify-center rounded-full text-[var(--hub-text-muted)] hover:text-[#F97316] hover:bg-orange-500/10 transition-all attach-btn-ref"
//                             >
//                                 <FaPaperclip className="text-lg" />
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={startRecording}
//                                 disabled={isSubmitting}
//                                 className="absolute left-12 bottom-3 w-8 h-8 flex items-center justify-center rounded-full text-[var(--hub-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
//                             >
//                                 <FaMicrophone className="text-lg" />
//                             </button>
//                         </>
//                     )}
//                 </div>
//                 {renderPendingAttachments('#F97316')}
//             </div>
//         </div>
//     )}

//     {category === 'chat' && (
//         <div className="flex flex-col space-y-6 animate-in fade-in duration-300">
//             {selectedChatUser ? (
//                 <div className="bg-purple-500/10 p-4 rounded-[1.5rem] border-2 border-purple-500/20 text-purple-600 text-[15px] font-black flex items-center justify-between gap-3 shadow-sm" dir="rtl">
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
//                             <FaCommentDots />
//                         </div>
//                         <span>مراسلة خاصة: {selectedChatUser.Name}</span>
//                     </div>
//                     <button
//                         onClick={() => setSelectedChatUser(null)}
//                         className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-purple-300 hover:text-red-500 transition-all active:scale-90"
//                     >
//                         <FaTimes size={16} />
//                     </button>
//                 </div>
//             ) : (
//                 <div className="space-y-6">
//                     <div className="relative group" dir="rtl">
//                         <div className="flex items-center gap-2 mb-2 justify-start">
//                             <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-[#A855F7]">
//                                 <FaCommentDots className="text-xs" />
//                             </div>
//                             <label className="text-sm font-black text-[var(--hub-text-main)]">اختر الوجهة</label>
//                         </div>
//                         <div className="relative">
//                             <select
//                                 value={selectedDepartment}
//                                 onChange={(e) => {
//                                     setSelectedDepartment(e.target.value);
//                                     setSelectedUsers([]);
//                                 }}
//                                 className="w-full border-2 border-[var(--hub-border)] rounded-2xl py-4 px-5 text-sm font-bold text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-[#A855F7] transition-all appearance-none shadow-sm cursor-pointer hover:border-purple-300"
//                                 dir="rtl"
//                             >
//                                 <option value="">اختر القسم</option>
//                                 <option value="all" className="font-bold text-purple-600">الجميع (إرسال للكل)</option>
//                                 {departments.map((dept) => (
//                                     <option key={dept.Id} value={dept.Id}>
//                                         {dept.Name}
//                                     </option>
//                                 ))}
//                             </select>
//                             <div className="absolute top-1/2 left-5 -translate-y-1/2 pointer-events-none text-[var(--hub-text-muted)] group-hover:text-[#A855F7] transition-colors">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
//                             </div>
//                         </div>
//                     </div>

//                     {selectedDepartment && selectedDepartment !== 'all' && (
//                         <div className="flex flex-col space-y-3 border-2 border-purple-500/10 rounded-2xl p-4 bg-purple-500/5">
//                             <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-500/20">
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         const deptUsers = allUsers.filter(u => u.WorkId === Number(selectedDepartment));
//                                         if (selectedUsers.length === deptUsers.length) {
//                                             setSelectedUsers([]);
//                                         } else {
//                                             setSelectedUsers(deptUsers.map(u => u.Id));
//                                         }
//                                     }}
//                                     className="bg-[#A855F7] text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-purple-600 transition-all active:scale-95"
//                                 >
//                                     تحديد الكل
//                                 </button>
//                                 <h4 className="text-right text-sm font-black text-purple-600">المنفذين (اختياري)</h4>
//                             </div>
//                             <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-2 pr-2 custom-scrollbar" dir="rtl">
//                                 {allUsers.filter(u => u.WorkId === Number(selectedDepartment)).length === 0 ? (
//                                     <div className="col-span-2 text-center text-xs text-purple-600 py-4 bg-[var(--hub-panel-bg)] rounded-xl border-dashed border-2 border-purple-500/20">لا يوجد مستخدمين لإضافتهم</div>
//                                 ) : (
//                                     allUsers.filter(u => u.WorkId === Number(selectedDepartment)).map(u => (
//                                         <label key={u.Id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all group/item shadow-sm hover:shadow-md ${selectedUsers.includes(u.Id) ? 'bg-[#A855F7] border-[#A855F7] text-white' : 'bg-[var(--hub-panel-bg)] border-[var(--hub-border)] text-[var(--hub-text-main)] hover:border-purple-300'}`}>
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedUsers.includes(u.Id)}
//                                                 onChange={(e) => {
//                                                     if (e.target.checked) setSelectedUsers([...selectedUsers, u.Id]);
//                                                     else setSelectedUsers(selectedUsers.filter(id => id !== u.Id));
//                                                 }}
//                                                 className="w-5 h-5 rounded-lg accent-white cursor-pointer"
//                                             />
//                                             <span className="text-sm font-bold">{u.Name}</span>
//                                         </label>
//                                     ))
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             <div className="flex-1 flex flex-col min-h-[160px] relative">
//                 <label className="block text-right text-sm font-bold text-purple-600 mb-2">نص الرسالة *</label>
//                 <div className="relative flex-1 flex flex-col">
//                     {isRecording || recordingBlob ? (
//                         renderRecordingUI('#A855F7', 'border-purple-500/20', 'bg-purple-500/5', 'hover:bg-purple-600')
//                     ) : (
//                         <>
//                             <textarea
//                                 className="w-full flex-1 min-h-[160px] border-2 border-[var(--hub-border)] rounded-2xl p-5 pl-24 resize-none text-[15px] font-bold text-right bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] focus:outline-none focus:border-purple-400 placeholder-[var(--hub-text-muted)] transition-all shadow-xl"
//                                 placeholder="اكتب رسالتك الخاصة هنا..."
//                                 value={messageText}
//                                 onChange={(e) => setMessageText(e.target.value)}
//                                 dir="rtl"
//                             ></textarea>
//                             <div className="absolute left-3 bottom-3 flex items-center gap-1">
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
//                                     disabled={isSubmitting}
//                                     className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--hub-text-muted)] hover:text-purple-600 hover:bg-purple-500/10 transition-all active:scale-90"
//                                 >
//                                     <FaPaperclip className="text-xl" />
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={startRecording}
//                                     disabled={isSubmitting}
//                                     className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--hub-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
//                                 >
//                                     <FaMicrophone className="text-xl" />
//                                 </button>
//                             </div>
//                         </>
//                     )}
//                 </div>
//                 {renderPendingAttachments('#A855F7')}
//             </div>
//         </div>
//     )}
// </div>

// {/* Premium Submit Button */}
// <div className="pt-8 border-t border-[var(--hub-border)] flex items-center justify-between gap-4">
//     <button
//         onClick={onCancel}
//         className="px-8 py-4 rounded-[1.5rem] bg-[var(--hub-input-bg)] text-[var(--hub-text-main)] font-black hover:bg-[var(--hub-hover)] transition-all active:scale-95"
//     >
//         إلغاء
//     </button>
//     <button
//         onClick={handleSubmit}
//         disabled={isSubmitting || (!messageText.trim() && !recordingBlob && attachmentUrls.length === 0)}
//         className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
//             category === 'questions' ? 'bg-[#3B82F6]' :
//             category === 'appointments' ? 'bg-[#10B981]' :
//             category === 'announcements' ? 'bg-[#F97316]' : 'bg-[#A855F7]'
//         }`}
//     >
//         {isSubmitting ? (
//             <>
//                 <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
//                 <span>جاري المعالجة...</span>
//             </>
//         ) : (
//             <>
//                 <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
//                 <span>إرسال الطلب الآن</span>
//             </>
//         )}
//     </button>
// </div>
// </div>
