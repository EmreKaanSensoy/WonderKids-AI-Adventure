export enum AppScreen {
  HOME = 'HOME',
  STORY = 'STORY',
  VIDEO = 'VIDEO',
  IMAGE_MAGIC = 'IMAGE_MAGIC',
  PUZZLE = 'PUZZLE'
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export interface PuzzleData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
