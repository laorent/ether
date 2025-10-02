export type MessagePart = {
  type: 'text';
  text: string;
} | {
  type: 'image';
  mimeType: string;
  data: string; // base64
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
  citations?: Citation[];
  createdAt: Date;
}

export interface Citation {
  startIndex: number;
  endIndex: number;
  uri: string;
  title: string;
  license: string;
}

export interface StreamPart {
  text?: string;
  citations?: Citation[];
  error?: string;
}
