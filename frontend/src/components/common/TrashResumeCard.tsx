import { useState } from 'react';
import type { TrashResumeItem } from '../../api/resumes';
import { restoreResume, permanentDeleteResume } from '../../api/resumes';
import { useAuthStore } from '../../store/authStore';
import Modal from './Modal';

interface TrashResumeCardProps {
  resume: TrashResumeItem;
  onUpdate: () => void;
}

export default function TrashResumeCard({ resume, onUpdate }: TrashResumeCardProps) {
  const { token } = useAuthStore();
  const [showDelete, setShowDelete] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRestore = async () => {
    if (!token) return;
    setIsRestoring(true);
    try {
      await restoreResume(token, resume.id);
      onUpdate();
    } catch (err) {
      console.error('Restore failed:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!token) return;
    setIsDeleting(true);
    try {
      await permanentDeleteResume(token, resume.id);
      setShowDelete(false);
      onUpdate();
    } catch (err) {
      console.error('Permanent delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const daysLeft = () => {
    if (!resume.deletedAt) return 30;
    const deletedDate = new Date(resume.deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const diff = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{resume.title || '轻松简历'}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {resume.templateId} · 删除于 {formatDate(resume.deletedAt)} · 剩余 {daysLeft()} 天
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {isRestoring ? '恢复中...' : '恢复'}
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="永久删除"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="永久删除">
        <p className="text-sm text-gray-500 mb-6">
          确定要永久删除 "{resume.title}" 吗？此操作不可恢复。
        </p>
        <div className="flex gap-3">
          <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button onClick={handlePermanentDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
            {isDeleting ? '删除中...' : '永久删除'}
          </button>
        </div>
      </Modal>
    </>
  );
}
