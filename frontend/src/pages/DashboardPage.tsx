import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { listResumes, listTrash } from '../api/resumes';
import type { ResumeListItem, TrashResumeItem } from '../api/resumes';
import ResumeCard from '../components/common/ResumeCard';
import TrashResumeCard from '../components/common/TrashResumeCard';
import Header from '../components/layout/Header';
import Modal from '../components/common/Modal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, pendingLocalResume, importLocalResume, dismissLocalResume } = useAuthStore();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [trashResumes, setTrashResumes] = useState<TrashResumeItem[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const fetchResumes = async () => {
    if (!token) return;
    try {
      const { resumes } = await listResumes(token);
      setResumes(resumes);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrash = async () => {
    if (!token) return;
    try {
      const { resumes } = await listTrash(token);
      setTrashResumes(resumes);
    } catch (err) {
      console.error('Failed to load trash:', err);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchTrash();
  }, [token]);

  const handleNewResume = () => {
    navigate('/templates');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Modal
        isOpen={pendingLocalResume}
        onClose={dismissLocalResume}
        title="发现本地简历"
      >
        <p className="text-gray-600 mb-6">检测到您有未导入的本地简历，是否导入到云端？</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={dismissLocalResume}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            暂不导入
          </button>
          <button
            onClick={() => {
              setIsImporting(true);
              importLocalResume();
            }}
            disabled={isImporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isImporting ? '导入中...' : '导入'}
          </button>
        </div>
      </Modal>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTrash(false)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!showTrash ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              我的简历{resumes.length > 0 ? ` (${resumes.length})` : ''}
            </button>
            <button
              onClick={() => { setShowTrash(true); fetchTrash(); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showTrash ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              回收站{trashResumes.length > 0 ? ` (${trashResumes.length})` : ''}
            </button>
          </div>
          <button
            onClick={handleNewResume}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建简历
          </button>
        </div>

        {showTrash ? (
          trashResumes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-gray-500">回收站是空的</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trashResumes.map((resume) => (
                <TrashResumeCard
                  key={resume.id}
                  resume={resume}
                  onUpdate={() => { fetchTrash(); fetchResumes(); }}
                />
              ))}
            </div>
          )
        ) : isLoading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">还没有简历</p>
            <button
              onClick={handleNewResume}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              创建第一份简历
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onUpdate={fetchResumes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
