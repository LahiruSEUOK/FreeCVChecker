import { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import AdSlot from '../components/ui/AdSlot';
import { uploadResume, scoreResume } from '../api/resumes';
import { useResumeStore } from '../store/resumeStore';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };

const PROGRESS_MESSAGES = [
  'Extracting text from your resume...',
  'Analysing keyword match rate...',
  'Evaluating content quality...',
  'Checking structure & formatting...',
  'Generating personalised recommendations...',
  'Calculating final ATS score...',
];

function getAnonymousId(): string {
  const key = 'fcv_uid';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

const STEPS_LABELS = ['Upload Resume', 'Job Description', 'Get Score'];

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
  const [progressMsgIdx, setProgressMsgIdx] = useState(0);

  // Cycle progress messages while scoring
  useEffect(() => {
    if (!isScoring) {
      setProgressMsgIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressMsgIdx((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isScoring]);

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
      setResumeId(res.data.resumeId);
      setFileName(file.name);
      if (res.data.parsedData) setParsedData(res.data.parsedData);
      setUploadedResumeId(res.data.resumeId);
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

  const currentStepIdx = step === 'upload' ? 0 : step === 'jd' ? 1 : 2;

  const jdLen = jobDescription.trim().length;
  const jdCountColor =
    jdLen === 0
      ? 'text-slate-400'
      : jdLen < 50
      ? 'text-amber-500'
      : 'text-emerald-600';
  const jdCountLabel =
    jdLen < 50
      ? `${jdLen} / 50 minimum — keep typing`
      : `${jdLen} characters — ready to analyse`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-5 py-2.5 sm:py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white text-xs sm:text-sm font-bold shadow-soft">
              F
            </div>
            <span className="text-sm sm:text-lg font-bold text-slate-950 tracking-tight">FresherCV</span>
          </a>
          <span className="text-xs sm:text-sm text-slate-400 font-medium">
            Step {currentStepIdx + 1} of {STEPS_LABELS.length}
          </span>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-5 py-5 sm:py-10 space-y-4 sm:space-y-7 animate-fade-in">
        <AdSlot slot="banner" />

        {/* Progress — numbered circles */}
        <div className="flex items-center">
          {STEPS_LABELS.map((label, i) => {
            const done = i < currentStepIdx;
            const active = i === currentStepIdx;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`step-circle ${
                      done
                        ? 'step-circle-done'
                        : active
                        ? 'step-circle-active'
                        : 'step-circle-pending'
                    }`}
                  >
                    {done ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      active
                        ? 'text-brand-700'
                        : done
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-5 transition-colors duration-500 ${
                      done ? 'bg-brand-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Upload */}
        {step === 'upload' && (
          <div className="card space-y-5 sm:space-y-7 animate-fade-in-up">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mb-1 sm:mb-1.5 tracking-tight">Upload Your Resume</h1>
              <p className="text-xs sm:text-sm text-slate-500">PDF or DOCX · Max 5 MB · No login required</p>
            </div>

            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center gap-3 sm:gap-5 rounded-2xl border-2 border-dashed p-8 sm:p-14 cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/60'
                  : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50/30'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <>
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-100 shadow-glow-emerald">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-semibold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Click to change file</p>
                  </div>
                  <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs font-medium">
                    Ready to upload
                  </span>
                </>
              ) : (
                <>
                  <div className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl transition-colors ${isDragActive ? 'bg-brand-100' : 'bg-brand-50'}`}>
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-semibold text-slate-900">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">or click to browse</p>
                    <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">PDF, DOCX · up to 5 MB</p>
                  </div>
                </>
              )}
            </div>

            {uploadError && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {uploadError}
              </div>
            )}

            <Button
              onClick={handleUpload}
              loading={isUploading}
              disabled={!file}
              className="w-full"
              size="lg"
            >
              {isUploading ? 'Uploading...' : 'Continue'}
              {!isUploading && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </Button>
          </div>
        )}

        {/* Step 2 — Job Description */}
        {step === 'jd' && (
          <div className="card space-y-4 sm:space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mb-1 sm:mb-1.5 tracking-tight">Paste the Job Description</h1>
              <p className="text-xs sm:text-sm text-slate-500">Copy the full job posting from LinkedIn, Glassdoor, or any job board</p>
            </div>

            <div className="relative">
              <textarea
                className="w-full h-44 sm:h-64 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4 text-sm text-slate-700 placeholder-slate-400 resize-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white outline-none transition-all duration-200"
                placeholder={`Paste the full job description here...\n\nExample:\nWe are looking for a Junior Software Engineer with skills in React, Node.js, and SQL. The ideal candidate has 0–2 years of experience and a strong foundation in computer science fundamentals...`}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                minLength={50}
              />
              {/* Character counter */}
              <div className={`absolute bottom-3 right-3 text-xs font-medium transition-colors ${jdCountColor}`}>
                {jdLen < 50 ? `${jdLen}/50` : jdLen}
              </div>
            </div>

            <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${jdCountColor}`}>
              {jdLen >= 50 ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {jdCountLabel}
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {jdCountLabel}
                </>
              )}
            </div>

            {scoreError && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {scoreError}
              </div>
            )}

            {/* Loading state with cycling messages */}
            {isScoring && (
              <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-900">Analysing your resume</p>
                    <p
                      key={progressMsgIdx}
                      className="text-sm text-brand-700/80 mt-0.5 animate-progress-message truncate"
                    >
                      {PROGRESS_MESSAGES[progressMsgIdx]}
                    </p>
                  </div>
                </div>
                {/* Animated progress dots */}
                <div className="flex gap-1.5">
                  {PROGRESS_MESSAGES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        i <= progressMsgIdx ? 'bg-brand-600' : 'bg-brand-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('upload')} disabled={isScoring}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
              <Button
                onClick={handleScore}
                loading={isScoring}
                disabled={jdLen < 50}
                className="flex-1"
                size="lg"
              >
                {isScoring ? 'Analysing...' : 'Get My ATS Score'}
                {!isScoring && (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 sm:py-6 text-center text-xs text-slate-400">
        © 2025 FresherCV · Free forever · No login required
      </footer>
    </div>
  );
}
