import { model, generationConfig, safetySettings } from "@/lib/gemini";
import type { ChatMessage, MessagePart } from "@/lib/types";
import { GoogleAIFileManager, Part } from "@google/generative-ai/server";
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 300;

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

async function saveFile(data: string, mimeType: string): Promise<Part> {
    const extension = mimeType.split('/')[1];
    const tempDir = path.join(os.tmpdir(), 'gemini-uploads');
    await fs.mkdir(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}.${extension}`);
    await fs.writeFile(tempFilePath, Buffer.from(data, 'base64'));

    try {
        console.log(`Uploading file: ${tempFilePath}`);
        const uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: mimeType as any,
        });
        console.log(`Uploaded file: ${uploadResult.file.name}`, uploadResult.file.uri);
        return {
            fileData: {
                mimeType: uploadResult.file.mimeType,
                fileUri: uploadResult.file.uri,
            },
        };
    } finally {
        await fs.unlink(tempFilePath);
    }
}

async function convertToGoogleParts(parts: MessagePart[]): Promise<Part[]> {
    const resultParts: Part[] = [];
    for (const part of parts) {
        if (part.type === 'text') {
            resultParts.push({ text: part.text });
        } else if (part.type === 'image') {
            // For server-side, we can use fileData for better performance and to avoid base64 limitations
            const filePart = await saveFile(part.data, part.mimeType);
            resultParts.push(filePart);
        }
    }
    return resultParts;
}

export async function POST(req: Request) {
  try {
    const { history, newParts } = (await req.json()) as { history: ChatMessage[]; newParts: MessagePart[]; };

    const chat = model.startChat({
      history: await Promise.all(history.map(async (msg) => ({
        role: msg.role,
        parts: await convertToGoogleParts(msg.parts),
      }))),
      generationConfig,
      safetySettings,
    });
    
    const googleParts = await convertToGoogleParts(newParts);
    const result = await chat.sendMessageStream(googleParts);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
             controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }

          if (chunk.usageMetadata) {
            console.log("Usage metadata:", chunk.usageMetadata);
          }
        }
        
        // After the stream is done, get the full response to check for grounding
        const response = await result.response;
        const citations = response.candidates?.[0].citationMetadata?.citationSources;
        if (citations) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations })}\n\n`));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return new Response(JSON.stringify({ error: error.message || "An error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
