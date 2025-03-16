export interface BrainstormResult {
  votes: number | undefined;
  title: string;
  explanation: string;
  id?: number;
  meeting_id?: number;
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
