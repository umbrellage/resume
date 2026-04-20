import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeListItem, ResumeData } from '../../api/resumes';
import { shareResume, deleteResume, duplicateResume, getResume } from '../../api/resumes';
import { useAuthStore } from '../../store/authStore';
import Modal from './Modal';

interface ResumeCardProps {
  resume: ResumeListItem;
  onUpdate: () => void;
}

export default function ResumeCard({ resume, onUpdate }: ResumeCardProps) {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);

  useEffect(() => {
    if (!token) return;
    getResume(token, resume.id)
      .then(({ resume }) => setPreviewData(resume))
      .catch(console.error);
  }, [token, resume.id]);

  const handleEdit = () => {
    navigate(`/editor/${resume.id}`);
  };

  const handleShare = async () => {
    if (!token) return;
    try {
      const { shareToken } = await shareResume(token, resume.id);
      const url = `${window.location.origin}/shared/${shareToken}`;
      setShareUrl(url);
      setShowShare(true);
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    setIsDeleting(true);
    try {
      await deleteResume(token, resume.id);
      setShowDelete(false);
      onUpdate();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!token) return;
    setIsDuplicating(true);
    try {
      await duplicateResume(token, resume.id);
      onUpdate();
    } catch (err) {
      console.error('Duplicate failed:', err);
    } finally {
      setIsDuplicating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
        <div className="h-44 overflow-hidden bg-white border-b border-gray-100" onClick={handleEdit}>
          {previewData?.data ? (
            <PreviewContent data={previewData.data as any} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="p-4">
          {/* Title - use resume.title first, fall back to personalInfo computation */}
          {(() => {
            // Try resume.title first (the explicitly saved title)
            if (resume.title && resume.title !== '轻松简历') {
              return <h3 className="font-semibold text-gray-800 truncate">{resume.title}</h3>;
            }
            // Fall back to computing from personalInfo
            const p = previewData?.data?.personalInfo;
            const computedTitle = p
              ? [p.title, p.name].filter(Boolean).join('_')
              : '';
            return <h3 className="font-semibold text-gray-800 truncate">{computedTitle || '轻松简历'}</h3>;
          })()}
          <p className="text-xs text-gray-400 mt-1">
            {resume.templateId} · 更新于 {formatDate(resume.updatedAt)}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleEdit}
              className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              编辑
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="分享"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 8.316a3 3 0 110-2.684m0 2.684L6.372 17.66" />
              </svg>
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              title="复制"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal isOpen={showShare} onClose={() => setShowShare(false)} title="分享简历">
        <p className="text-sm text-gray-500 mb-4">复制以下链接分享你的简历</p>
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 mb-4"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
          }}
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          复制链接
        </button>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="删除简历">
        <p className="text-sm text-gray-500 mb-6">
          确定要删除 "{resume.title}" 吗？删除后可在回收站中恢复，保留 30 天。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </button>
        </div>
      </Modal>
    </>
  );
}

function PreviewContent({ data }: { data: any }) {
  if (!data) return null;
  const p = data.personalInfo || {};
  const sections = data.sections || [];

  const sectionLabels: Record<string, string> = {
    education: '教育',
    experience: '工作',
    project: '项目',
    skill: '技能',
    certification: '证书',
    summary: '评价',
  };

  return (
    <div className="w-full h-full bg-white p-2 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="text-center shrink-0">
        <div className="font-bold text-xs text-gray-800 truncate">{p.name || '姓名'}</div>
        <div className="text-[10px] text-gray-500 truncate">{p.title || '职位'}</div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-hidden">
        {sections.slice(0, 3).map((section: any, i: number) => (
          <div key={i} className="mt-1">
            <div className="text-[9px] font-semibold text-gray-600 truncate">
              {sectionLabels[section.type] || section.title || '其他'}
            </div>
            {section.items?.slice(0, 1).map((item: any, j: number) => (
              <div key={j} className="text-[9px] text-gray-500 truncate">
                {item.company || item.school || item.name || item.title || item.category || ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
