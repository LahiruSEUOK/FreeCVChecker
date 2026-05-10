import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import AdSlot from '../components/ui/AdSlot';
import { uploadResume, scoreResume } from '../api/resumes';
import { useResumeStore } from '../store/resumeStore';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };

function getAnonymousId(): string {
  const key = 'fcv_uid';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const {
    setResumeId, setFileName, setParsedData, setScore, setJobDescription,
    jobDescription, isUploading, isScoring, setIsUploading, setIsScoring,
    uploadError, scoreError, setUploadError, setScoreError,
  } = useResumeStore();

  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'jd' | 'scoring'>('upload');
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setUploadError(null);
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') setUploadError('File is too large. Maximum size is 5 MB.');
      else setUploadError('Only PDF and DOCX files are accepted.');
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
    }
  }, [setUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const uid = getAnonymousId();
      const res = await uploadResume(file, uid);
      setResumeId(res.data.id);
      setFileName(res.data.fileName);
      if (res.data.parsedData) setParsedData(res.data.parsedData);
      setUploadedResumeId(res.data.id);
      setStep('jd');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleScore() {
    if (!uploadedResumeId || !jobDescription.trim()) return;
    setIsScoring(true);
    setScoreError(null);
    try {
      const res = await scoreResume(uploadedResumeId, jobDescription);
      setScore(res.data);
      navigate(`/results/${uploadedResumeId}`);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setIsScoring(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">F</div>
            <span className="text-lg font-bold text-slate-900">FresherCV</span>
          </a>
          <span className="text-sm text-slate-400">Step {step === 'upload' ? '1' : step === 'jd' ? '2' : '3'} of 3</span>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 space-y-6 animate-fade-in">
        <AdSlot slot="banner" />

        {/* Progress */}
        <div className="flex gap-2">
          {['Upload Resume', 'Job Description', 'Get Score'].map((label, i) => {
            const idx = i + 1;
            const currentIdx = step === 'upload' ? 1 : step === 'jd' ? 2 : 3;
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-2 w-full rounded-full transition-colors ${done || active ? 'bg-brand-600' : 'bg-slate-200'}`} />
                <span className={`text-xs font-medium ${active ? 'text-brand-700' : done ? 'text-brand-400' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step 1 — Upload */}
        {step === 'upload' && (
          <div className="card space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Upload Your Resume</h1>
              <p className="text-sm text-slate-500">PDF or DOCX · Max 5 MB · No login required</p>
            </div>

            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-brand-500 bg-brand-50'
                  : file
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                    <svg className="h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-slate-500">or click to browse · PDF, DOCX</p>
                  </div>
                </>
              )}
            </div>

            {uploadError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                {uploadError}
              </p>
            )}

            <Button
              onClick={handleUpload}
              loading={isUploading}
              disabled={!file}
              className="w-full"
              size="lg"
            >
              Continue →
            </Button>
          </div>
        )}

        {/* Step 2 — Job Description */}
        {step === 'jd' && (
          <div className="card space-y-6 animate-slide-up">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Paste the Job Description</h1>
              <p className="text-sm text-slate-500">Copy the full job posting from LinkedIn, Glassdoor, or any job board</p>
            </div>

            <textarea
              className="w-full h-64 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 placeholder-slate-400 resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
              placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Junior Software Engineer with skills in React, Node.js, and SQL. The ideal candidate has 0–2 years of experience and a strong foundation in computer science fundamentals..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              minLength={50}
            />

            <p className="text-xs text-slate-400">
              {jobDescription.length} characters · Minimum 50 for accurate scoring
            </p>

            {scoreError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                {scoreError}
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('upload')} disabled={isScoring}>
                ← Back
              </Button>
              <Button
                onClick={handleScore}
                loading={isScoring}
                disabled={jobDescription.trim().length < 50}
                className="flex-1"
                size="lg"
              >
                {isScoring ? 'Analyzing your resume...' : 'Get My ATS Score →'}
              </Button>
            </div>

            {isScoring && (
              <div className="flex items-center justify-center gap-3 text-sm text-slate-500 py-2">
                <Spinner size="sm" />
                <span>Claude AI is analyzing your resume against the job description...</span>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © 2025 FresherCV · Free forever · No login required
      </footer>
    </div>
  );
}
