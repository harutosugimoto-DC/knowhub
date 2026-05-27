import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `あなたは質問作成を支援するAIアシスタントです。エンジニアがより良い質問を作成できるよう、具体的で再現性のある質問にするためのアドバイスをします。日本語で返答してください。

【重要な指示】
1. 回答は可能な限り簡潔に、短くまとめてください。冗長な説明は避けてください。
2. ユーザーが「〇〇について質問したい」など、質問したいテーマや情報を提示した場合は、提供された情報を整理し、必ず以下のフォーマットで出力してください。

■ 質問タイトル（※必ず40文字以内）
[具体的でわかりやすいタイトル案]

■ 詳細(※必ず5000文字以内)
[整理された再現性のある質問本文]

※ もし情報が不足していて明確な質問文が作成できない場合は、フォーマットを出力する前に「〇〇の情報があるとより良い質問になります」と簡潔にヒントを追加で求めてください。`;
type ChatMessage = { role: 'user' | 'model'; text: string };

// AIチャット
// POST /api/v1/ai/chat
router.post('/chat', requireAuth, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini APIキーが設定されていません' });
  }

  const { messages } = req.body as { messages?: ChatMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messagesが必要です' });
  }

  // Gemini API は最初のメッセージが user である必要があるため、
  // 先頭の model メッセージ（初期挨拶など）を除去する
  const firstUserIndex = messages.findIndex((m) => m.role === 'user');
  if (firstUserIndex === -1) {
    return res.status(400).json({ error: 'ユーザーメッセージが必要です' });
  }
  const trimmedMessages = messages.slice(firstUserIndex);

  const contents = trimmedMessages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  let response: Response;
  try {
    response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
      }),
    });
  } catch (err) {
    console.error('Gemini fetch error:', err);
    return res.status(500).json({ error: 'AI APIへの接続に失敗しました' });
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini API error:', errText);
    return res.status(500).json({ error: errText });
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return res.json({ text });
});

export default router;
