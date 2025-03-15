export interface BrainstormResult {
  title: string;
  explanation: string;
}

export interface BrainstormResultMetadata {
  additionalInfo: string;
}

export interface Meeting {
  id: number;
  title: string;
  goal: string;
  created_at: string;
}

export interface Idea {
  idea: string;
  userId: string;
}
