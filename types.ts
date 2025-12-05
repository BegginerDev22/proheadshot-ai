import React from 'react';

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}