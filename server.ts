import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { dbStore } from "./server/store";
import {
  parseJobAndResume,
  generateAdaptiveQuestion,
  evaluateAnswer,
  generateSessionReport,
  polishSTARStory,
  generateTTSAudio
} from "./server/gemini";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "MockMate", timestamp: new Date().toISOString() });
  });

  // Authentication Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.json({ user: dbStore.getUser(existingUser.id) });
    }

    // Auto register for demo/convenience if user doesn't exist yet
    const name = email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    const newUser = dbStore.createUser(email, name.charAt(0).toUpperCase() + name.slice(1), password);
    return res.json({ user: newUser });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.json({ user: dbStore.getUser(existingUser.id) });
    }

    const newUser = dbStore.createUser(email, name, password);
    res.json({ user: newUser });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    res.json({ success: true, message: `Password reset instructions sent to ${email}` });
  });

  app.get("/api/auth/me", (req, res) => {
    const userId = (req.headers["x-user-id"] as string) || "demo-user";
    const user = dbStore.getUser(userId) || dbStore.getUser("demo-user");
    res.json({ user });
  });

  // Target Profile Management
  app.get("/api/target-profiles", (req, res) => {
    const userId = (req.headers["x-user-id"] as string) || "demo-user";
    const profiles = dbStore.getTargetProfiles(userId);
    res.json({ profiles });
  });

  app.post("/api/target-profiles", async (req, res) => {
    try {
      const userId = (req.headers["x-user-id"] as string) || "demo-user";
      const { title, company, roleCategory, jobDescription, resumeText } = req.body;

      if (!title || !jobDescription || !resumeText) {
        return res.status(400).json({ error: "Title, Job Description, and Resume text are required" });
      }

      // Parse with Gemini
      let parsedSummary;
      try {
        parsedSummary = await parseJobAndResume(jobDescription, resumeText);
      } catch (e) {
        console.warn("Failed to parse JD & Resume with AI, using fallback:", e);
        parsedSummary = {
          keyRequirements: ["Core software engineering skills", "Problem solving & architecture"],
          technicalStack: ["TypeScript", "React", "Node.js"],
          matchingSkills: ["React", "TypeScript"],
          potentialGaps: ["Specific system scale metrics"],
          suggestedFocusAreas: ["Technical trade-offs", "STAR behavioral stories"]
        };
      }

      const newProfile = dbStore.saveTargetProfile({
        id: "tp_" + Date.now().toString(36),
        userId,
        title,
        company: company || "Target Company",
        roleCategory: roleCategory || "Software Engineering",
        jobDescription,
        resumeText,
        parsedSummary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      res.json({ profile: newProfile });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to save profile" });
    }
  });

  app.delete("/api/target-profiles/:id", (req, res) => {
    dbStore.deleteTargetProfile(req.params.id);
    res.json({ success: true });
  });

  // Parse Documents Endpoint
  app.post("/api/parse-documents", async (req, res) => {
    try {
      const { jobDescription, resumeText } = req.body;
      if (!jobDescription || !resumeText) {
        return res.status(400).json({ error: "Both Job Description and Resume text are required" });
      }
      const parsed = await parseJobAndResume(jobDescription, resumeText);
      res.json({ parsed });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Parsing failed" });
    }
  });

  // Start New Interview Session
  app.post("/api/interview/start", async (req, res) => {
    try {
      const userId = (req.headers["x-user-id"] as string) || "demo-user";
      const { targetProfileId, persona, focusArea, isVoiceMode, totalQuestions } = req.body;

      const profile = dbStore.getTargetProfile(targetProfileId);
      if (!profile) {
        return res.status(404).json({ error: "Target profile not found" });
      }

      const activeWeakSpots = dbStore.getWeakSpots(userId).filter((w) => w.status === "active");

      // Generate first adaptive question
      const q1Data = await generateAdaptiveQuestion({
        persona: persona || "friendly",
        focusArea: focusArea || "hybrid",
        jobDescription: profile.jobDescription,
        resumeText: profile.resumeText,
        previousTurns: [],
        weakSpotsMemory: activeWeakSpots,
        questionIndex: 1,
        totalQuestions: totalQuestions || 5
      });

      const session = dbStore.saveSession({
        id: "sess_" + Date.now().toString(36),
        userId,
        targetProfileId: profile.id,
        targetProfileTitle: profile.title,
        persona: persona || "friendly",
        focusArea: focusArea || "hybrid",
        isVoiceMode: !!isVoiceMode,
        totalQuestions: totalQuestions || 5,
        turns: [
          {
            id: "turn_1",
            questionNumber: 1,
            isFollowUp: false,
            question: q1Data.question,
            interviewerRationale: q1Data.interviewerRationale,
            expectedKeyPoints: q1Data.expectedKeyPoints
          }
        ],
        currentTurnIndex: 0,
        status: "in_progress",
        createdAt: new Date().toISOString()
      });

      res.json({ session });
    } catch (err: any) {
      console.error("Start interview error:", err);
      res.status(500).json({ error: err.message || "Failed to start interview session" });
    }
  });

  // Get Session
  app.get("/api/interview/session/:id", (req, res) => {
    const session = dbStore.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ session });
  });

  // Submit Answer to Current Question
  app.post("/api/interview/submit-answer", async (req, res) => {
    try {
      const userId = (req.headers["x-user-id"] as string) || "demo-user";
      const { sessionId, answer, audioDurationSeconds } = req.body;

      const session = dbStore.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const profile = dbStore.getTargetProfile(session.targetProfileId);
      if (!profile) {
        return res.status(404).json({ error: "Target profile missing" });
      }

      const currentTurn = session.turns[session.currentTurnIndex];
      if (!currentTurn) {
        return res.status(400).json({ error: "Invalid current turn" });
      }

      currentTurn.candidateAnswer = answer;
      currentTurn.audioDurationSeconds = audioDurationSeconds;
      currentTurn.answeredAt = new Date().toISOString();

      const knownWeakSpots = dbStore.getWeakSpots(userId);

      // Evaluate answer with Gemini
      const evaluation = await evaluateAnswer({
        question: currentTurn.question,
        candidateAnswer: answer,
        expectedKeyPoints: currentTurn.expectedKeyPoints || [],
        persona: session.persona,
        focusArea: session.focusArea,
        jobDescription: profile.jobDescription,
        resumeText: profile.resumeText,
        knownWeakSpots,
        isFollowUp: currentTurn.isFollowUp
      });

      currentTurn.evaluation = evaluation;

      // Handle detected weak spots
      if (evaluation.detectedWeakSpots && evaluation.detectedWeakSpots.length > 0) {
        for (const ws of evaluation.detectedWeakSpots) {
          const existing = knownWeakSpots.find((k) => k.title.toLowerCase() === ws.title.toLowerCase());
          if (existing) {
            existing.occurrences += 1;
            existing.status = "active";
            existing.updatedAt = new Date().toISOString();
            dbStore.saveWeakSpot(existing);
          } else {
            dbStore.saveWeakSpot({
              id: "ws_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
              userId,
              category: ws.category as any,
              title: ws.title,
              description: ws.description,
              impactScore: ws.impactScore,
              status: "active",
              occurrences: 1,
              remedyTip: ws.remedyTip,
              firstDetectedSessionId: session.id,
              lastSeenSessionId: session.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      }

      // Handle extracted STAR story
      if (evaluation.extractedSTARStory) {
        const storyData = evaluation.extractedSTARStory;
        dbStore.saveSTARStory({
          id: "story_" + Date.now().toString(36),
          userId,
          title: storyData.title || `Story from ${profile.title}`,
          category: storyData.category || "General",
          situation: storyData.situation,
          task: storyData.task,
          action: storyData.action,
          result: storyData.result,
          metrics: storyData.metrics || [],
          tags: storyData.tags || ["Interview Extract"],
          sourceSessionId: session.id,
          isPolished: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      let isSessionComplete = false;

      // Check if adaptive follow-up is needed OR progress to next main question
      if (evaluation.followUpNeeded && evaluation.suggestedFollowUpQuestion && !currentTurn.isFollowUp) {
        // Add follow-up turn
        session.turns.push({
          id: `turn_${session.turns.length + 1}`,
          questionNumber: currentTurn.questionNumber,
          isFollowUp: true,
          question: evaluation.suggestedFollowUpQuestion,
          interviewerRationale: "Follow-up cross-examination: the candidate's response was missing specific technical depth or metrics.",
          expectedKeyPoints: ["Address missing details from previous response", "Provide concrete metrics or architecture specifics"]
        });
        session.currentTurnIndex += 1;
      } else {
        // Advance question number
        const nextQNum = currentTurn.questionNumber + 1;
        if (nextQNum <= session.totalQuestions) {
          const activeWeakSpots = dbStore.getWeakSpots(userId).filter((w) => w.status === "active");
          const nextQData = await generateAdaptiveQuestion({
            persona: session.persona,
            focusArea: session.focusArea,
            jobDescription: profile.jobDescription,
            resumeText: profile.resumeText,
            previousTurns: session.turns,
            weakSpotsMemory: activeWeakSpots,
            questionIndex: nextQNum,
            totalQuestions: session.totalQuestions
          });

          session.turns.push({
            id: `turn_${session.turns.length + 1}`,
            questionNumber: nextQNum,
            isFollowUp: false,
            question: nextQData.question,
            interviewerRationale: nextQData.interviewerRationale,
            expectedKeyPoints: nextQData.expectedKeyPoints
          });
          session.currentTurnIndex += 1;
        } else {
          isSessionComplete = true;
          session.status = "completed";
          session.completedAt = new Date().toISOString();

          // Generate final summary report card
          const report = await generateSessionReport({
            persona: session.persona,
            focusArea: session.focusArea,
            targetTitle: session.targetProfileTitle,
            turns: session.turns,
            jobDescription: profile.jobDescription
          });

          session.overallScore = report.overallScore;
          session.summaryFeedback = {
            overallRating: report.overallRating,
            keyTakeaways: report.keyTakeaways,
            topStrengths: report.topStrengths,
            priorityImprovements: report.priorityImprovements,
            personaVerdict: report.personaVerdict
          };
        }
      }

      dbStore.saveSession(session);

      res.json({
        session,
        isSessionComplete,
        evaluation
      });
    } catch (err: any) {
      console.error("Submit answer error:", err);
      res.status(500).json({ error: err.message || "Failed to submit answer" });
    }
  });

  // Weak Spots API
  app.get("/api/weak-spots", (req, res) => {
    const userId = (req.headers["x-user-id"] as string) || "demo-user";
    const weakSpots = dbStore.getWeakSpots(userId);
    res.json({ weakSpots });
  });

  app.put("/api/weak-spots/:id/status", (req, res) => {
    const { status } = req.body;
    dbStore.updateWeakSpotStatus(req.params.id, status);
    res.json({ success: true });
  });

  // STAR Stories API
  app.get("/api/star-stories", (req, res) => {
    const userId = (req.headers["x-user-id"] as string) || "demo-user";
    const stories = dbStore.getSTARStories(userId);
    res.json({ stories });
  });

  app.post("/api/star-stories", (req, res) => {
    const userId = (req.headers["x-user-id"] as string) || "demo-user";
    const { title, category, situation, task, action, result, metrics, tags } = req.body;

    const newStory = dbStore.saveSTARStory({
      id: "story_" + Date.now().toString(36),
      userId,
      title: title || "New STAR Story",
      category: category || "Behavioral",
      situation: situation || "",
      task: task || "",
      action: action || "",
      result: result || "",
      metrics: metrics || [],
      tags: tags || ["Custom"],
      isPolished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({ story: newStory });
  });

  app.post("/api/star-stories/:id/polish", async (req, res) => {
    try {
      const story = dbStore.getSTARStories("demo-user").find((s) => s.id === req.params.id);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      const polished = await polishSTARStory(story);

      story.title = polished.title;
      story.category = polished.category;
      story.situation = polished.situation;
      story.task = polished.task;
      story.action = polished.action;
      story.result = polished.result;
      story.metrics = polished.metrics;
      story.tags = polished.tags;
      story.isPolished = true;
      story.updatedAt = new Date().toISOString();

      dbStore.saveSTARStory(story);

      res.json({ story });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to polish story" });
    }
  });

  app.delete("/api/star-stories/:id", (req, res) => {
    dbStore.deleteSTARStory(req.params.id);
    res.json({ success: true });
  });

  // Analytics API
  app.get("/api/analytics", (req, res) => {
    const userId = (req.headers["x-user-id"] as string) || "demo-user";
    const analytics = dbStore.getAnalytics(userId);
    res.json({ analytics });
  });

  // TTS Voice Generation Endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, persona } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const voiceMap: Record<string, string> = {
        friendly: "Kore",
        neutral: "Puck",
        stress_test: "Fenrir"
      };

      const voiceName = voiceMap[persona || "friendly"] || "Kore";
      const audioBase64 = await generateTTSAudio(text, voiceName);

      res.json({ audioBase64 });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "TTS error" });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    }).then((vite) => {
      app.use(vite.middlewares);
    });
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`MockMate Server running on http://0.0.0.0:${PORT}`);
    });
  }

export default app;
