// src/types/gov.ts
export type GovItem = {
  id: string;
  title: string;
  date: string;      // "YYYY.M.D" 형태
  thumbnail: string; // 썸네일 이미지 경로
  videoUrl?: string; // 선택: 실제 영상 URL
};

