import React, { useState, useEffect, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { InterviewTurn, QuestionEvaluation } from '../types';
import { fetchTTSApi } from '../services/api';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  Smile,
  Shield,
  Zap,
  RotateCcw,
  Square
} from 'lucide-react';

interface InterviewRoomProps {
  onFinishSession: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({ onFinishSession }) => {
  const { activeSession, submitAnswer, setActiveSession } = useInterview();
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showMicroEvaluation, setShowMicroEvaluation] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<QuestionEvaluation | null>(null);
  const [isSessionCompleteState, setIsSessionCompleteState] = useState(false);
  const [interviewerStatus, setInterviewerStatus] = useState<'speaking' | 'listening' | 'evaluating'>('speaking');
  const [hintText, setHintText] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  if (!activeSession) return null;

  const currentTurn = activeSession.turns[activeSession.currentTurnIndex] || activeSession.turns[activeSession.turns.length - 1];

  // Voice Speech Synthesis / Gemini TTS
  const speakQuestion = async (text: string) => {
    if (isAudioMuted || !text) return;
    setIsPlayingAudio(true);
    setInterviewerStatus('speaking');

    // Try Gemini Server TTS first
    try {
      const base64Audio = await fetchTTSApi(text, activeSession.persona);
      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audio.onended = () => {
          setIsPlayingAudio(false);
          setInterviewerStatus('listening');
        };
        await audio.play();
        return;
      }
    } catch (e) {
      // Fallback to browser SpeechSynthesis
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = activeSession.persona === 'stress_test' ? 0.9 : 1.0;
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setInterviewerStatus('listening');
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setInterviewerStatus('listening');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      setInterviewerStatus('listening');
    }
  };

  useEffect(() => {
    if (currentTurn?.question && !currentTurn.candidateAnswer && activeSession.isVoiceMode) {
      speakQuestion(currentTurn.question);
    }
  }, [currentTurn?.id]);

  // Speech Recognition (STT) setup
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setInterviewerStatus('listening');
        setAudioDuration(0);
        timerRef.current = setInterval(() => {
          setAudioDuration((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = async () => {
    if (!answerText.trim()) return;
    stopRecording();
    setIsSubmitting(true);
    setInterviewerStatus('evaluating');
    setHintText(null);

    try {
      const res = await submitAnswer(answerText, audioDuration);
      setLatestEvaluation(res.evaluation);
      setIsSessionCompleteState(res.isSessionComplete);
      setShowMicroEvaluation(true);
      setAnswerText('');
      setAudioDuration(0);
    } catch (err: any) {
      alert('Failed to submit answer: ' + err.message);
    } finally {
      setIsSubmitting(false);
      setInterviewerStatus('speaking');
    }
  };

  const handleProvideHint = () => {
    if (currentTurn?.expectedKeyPoints?.length) {
      const hint = `Focus on mentioning: ${currentTurn.expectedKeyPoints[0]}. Be specific with technical trade-offs or metrics.`;
      setHintText(hint);
    } else {
      setHintText('Describe your concrete role, specific technical actions taken, and measurable business outcomes.');
    }
  };

  const handleContinueNextQuestion = () => {
    setShowMicroEvaluation(false);
    if (isSessionCompleteState) {
      onFinishSession();
    }
  };

  // Persona Badge Styling
  const getPersonaBadge = () => {
    switch (activeSession.persona) {
      case 'friendly':
        return {
          label: 'Alex (Friendly Coach)',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: Smile
        };
      case 'neutral':
        return {
          label: 'Morgan (Neutral Recruiter)',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: Shield
        };
      case 'stress_test':
        return {
          label: 'Viktor (Stress-Test Manager)',
          color: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: Zap
        };
    }
  };

  const badge = getPersonaBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center space-x-1.5 ${badge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </span>
          <div className="text-xs text-slate-500 border-l border-slate-200 pl-3">
            Role: <span className="text-slate-800 font-semibold">{activeSession.targetProfileTitle}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-xs font-semibold text-slate-700">
            Question <span className="text-slate-900 font-bold">{currentTurn?.questionNumber || 1}</span> of{' '}
            <span>{activeSession.totalQuestions}</span>
            {currentTurn?.isFollowUp && (
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold uppercase">
                Adaptive Follow-Up
              </span>
            )}
          </div>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            onClick={onFinishSession}
            className="text-xs text-slate-500 hover:text-rose-600 hover:underline font-semibold"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Main Interview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interviewer Avatar & Live Question Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            {/* Avatar Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs">
                    <BadgeIcon className="w-6 h-6 text-slate-800" />
                  </div>
                  {interviewerStatus === 'speaking' && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{badge.label}</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                    <span className="capitalize">{interviewerStatus}...</span>
                    {isPlayingAudio && <span className="text-emerald-700 font-semibold">🔊 Audio Output Active</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => speakQuestion(currentTurn?.question || '')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Repeat Voice</span>
              </button>
            </div>

            {/* Question Text Display */}
            <div className="my-6 z-10 space-y-3">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm md:text-base font-semibold leading-relaxed shadow-xs">
                "{currentTurn?.question}"
              </div>

              {currentTurn?.interviewerRationale && (
                <div className="text-[11px] text-slate-600 bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex items-start space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Adaptive Rationale: </strong>
                    {currentTurn.interviewerRationale}
                  </div>
                </div>
              )}

              {hintText && (
                <div className="text-[11px] text-slate-800 bg-slate-100 border border-slate-300 rounded-xl p-3 flex items-start space-x-2 animate-fadeIn">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Interviewer Hint: </strong>
                    {hintText}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between z-10 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={handleProvideHint}
                className="text-slate-800 hover:text-slate-900 font-semibold flex items-center space-x-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Request Hint</span>
              </button>

              <div className="text-slate-500 text-[11px]">
                Speak or type your answer clearly
              </div>
            </div>
          </div>
        </div>

        {/* Right: Candidate Response Box & Speech Input */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mic className="w-4 h-4 text-slate-700" />
                  <span>Your Response</span>
                </label>

                {isRecording && (
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span>Recording ({audioDuration}s)</span>
                  </div>
                )}
              </div>

              {/* Speech-To-Text Textarea */}
              <textarea
                rows={8}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Click the microphone to record your voice answer or type here..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 leading-relaxed font-medium resize-none"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>{answerText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <button
                  type="button"
                  onClick={() => setAnswerText('')}
                  className="hover:text-slate-800 text-slate-500 font-medium"
                >
                  Clear text
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-semibold transition-all border ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4 text-slate-700" />}
                  <span>{isRecording ? 'Stop Recording' : 'Voice Input (Mic)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !answerText.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-xs transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit Answer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Micro-Evaluation Feedback Modal */}
      {showMicroEvaluation && latestEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Answer Evaluation & Micro-Feedback</h3>
                  <p className="text-xs text-slate-500">Gemini AI response assessment</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-slate-900">{latestEvaluation.score}/100</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Turn Score</div>
              </div>
            </div>

            {/* Score Grid Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900">{latestEvaluation.technicalDepthScore}%</div>
                <div className="text-[10px] text-slate-500">Technical Depth</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900">{latestEvaluation.starAlignmentScore}%</div>
                <div className="text-[10px] text-slate-500">STAR Alignment</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900">{latestEvaluation.communicationClarityScore}%</div>
                <div className="text-[10px] text-slate-500">Clarity</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900">{latestEvaluation.confidenceScore}%</div>
                <div className="text-[10px] text-slate-500">Confidence</div>
              </div>
            </div>

            {/* Strengths & Actionable Advice */}
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                <div className="font-bold text-xs flex items-center space-x-1.5 mb-1 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Answer Strengths</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {latestEvaluation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1">
                <div className="font-bold text-xs flex items-center space-x-1.5 mb-1 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Actionable Coaching Advice</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{latestEvaluation.actionableAdvice}</p>
              </div>

              {/* Detected Filler Words */}
              {latestEvaluation.fillerWordsDetected?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Detected Filler Words:</span>
                  <div className="flex flex-wrap gap-1">
                    {latestEvaluation.fillerWordsDetected.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold">
                        "{f.word}" ({f.count}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ideal Top 1% Response Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 space-y-1">
                <div className="font-bold text-xs text-slate-800 flex items-center space-x-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  <span>Ideal High-Impact Response Blueprint</span>
                </div>
                <p className="text-slate-800 italic leading-relaxed">{latestEvaluation.idealResponseSummary}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleContinueNextQuestion}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <span>{isSessionCompleteState ? 'View Complete Report Card' : 'Continue to Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
