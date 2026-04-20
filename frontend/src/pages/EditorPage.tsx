import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';
import { useAuthStore } from '../store/authStore';
import { getResume, updateResume, sendResumeEmail, createResume } from '../api/resumes';
import { serializeResumeToHtml } from '../utils/htmlSerializer';
import SplitEditor from '../components/layout/SplitEditor';
import Modal from '../components/common/Modal';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading';

function hasContent(r: { personalInfo: Record<string, string>; sections: { items: unknown[] }[] }): boolean {
  const pi = r.personalInfo;
  if (pi.name || pi.title || pi.phone || pi.email) return true;
  return r.sections.some((s) => s.items.length > 0);
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resume = useResumeStore((s) => s.resume);
  const setResume = useResumeStore((s) => s.setResume);
  const onePageScale = useResumeStore((s) => s.onePageScale);
  const { token, user } = useAuthStore();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const displayTitle = resume
    ? resume.title || [resume.personalInfo.title, resume.personalInfo.name].filter(Boolean).join('_') || '轻松简历'
    : '轻松简历';
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState(user?.email || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverResumeIdRef = useRef<string | null>(null);
  const lastSavedRef = useRef<string>('');

  // Load resume from server
  useEffect(() => {
    if (!id) return;

    if (resume && resume.id === id) {
      serverResumeIdRef.current = null;
      setSaveStatus('idle');
      setIsInitialLoad(false);
      return;
    }

    if (!token) {
      setSaveStatus(resume ? 'idle' : 'error');
      setIsInitialLoad(false);
      return;
    }

    const loadResume = async () => {
      try {
        const { resume: serverResume } = await getResume(token, id);
        if (serverResume && serverResume.data) {
          const dataWithTitle = {
            ...(serverResume.data as any),
            title: serverResume.title || (serverResume.data as any).title,
          };
          setResume(dataWithTitle);
          lastSavedRef.current = JSON.stringify(dataWithTitle);
        }
        serverResumeIdRef.current = id;
        setSaveStatus('idle');
      } catch (err) {
        console.error('Failed to load resume:', err);
        setSaveStatus('error');
      }
    };

    loadResume();
  }, [id, token, setResume]);

  useEffect(() => {
    if (resume && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [resume, isInitialLoad]);

  // Optimized auto-save: only save when content actually changes
  const handleSave = useCallback(async () => {
    if (!token || !resume) return;
    if (!hasContent(resume)) return;

    const currentData = JSON.stringify(resume);
    if (currentData === lastSavedRef.current) return;

    setSaveStatus('saving');

    try {
      const resumeData = {
        title: resume.title,
        templateId: resume.templateId,
        data: resume,
      };

      if (serverResumeIdRef.current) {
        await updateResume(token, serverResumeIdRef.current, resumeData);
      } else {
        const { resume: created } = await createResume(token, resumeData);
        serverResumeIdRef.current = created.id;
      }
      lastSavedRef.current = currentData;
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    }
  }, [token, resume]);

  // Auto-save with 1.5s debounce
  useEffect(() => {
    if (!resume || isInitialLoad || !token || !id) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [resume, token, id, isInitialLoad, handleSave]);

  const handleSendEmail = async () => {
    if (!token || !resume) return;

    setIsSendingEmail(true);
    setEmailError('');

    try {
      const html = serializeResumeToHtml(resume, onePageScale);
      await sendResumeEmail(token, emailTo, emailSubject || resume.personalInfo.name || '我的简历', html);
      setShowEmailModal(false);
      setEmailTo('');
      setEmailSubject('');
    } catch (err) {
      console.error('Send email failed:', err);
      setEmailError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (saveStatus === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (saveStatus === 'error' || !resume) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">简历加载失败</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            返回仪表板
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SplitEditor
        saveStatus={saveStatus}
        onSave={handleSave}
        onSendEmail={() => { setEmailTo(user?.email || ''); setShowEmailModal(true); }}
        showBack
        editableTitle
        title={displayTitle}
        onTitleChange={(newTitle) => {
          if (resume) {
            setResume({
              ...resume,
              title: newTitle,
            });
          }
        }}
      />

      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="发送简历到邮箱">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">收件人邮箱</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">主题（选填）</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder={resume.personalInfo.name || '我的简历'}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          <button
            onClick={handleSendEmail}
            disabled={isSendingEmail || !emailTo}
            className="w-full py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isSendingEmail ? '发送中...' : '发送'}
          </button>
        </div>
      </Modal>
    </>
  );
}
