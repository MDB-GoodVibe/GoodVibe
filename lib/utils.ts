import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind 클래스가 길어질수록 충돌 관리가 중요해지므로,
// shadcn 스타일 프로젝트에서는 보통 cn 유틸리티를 공용으로 둡니다.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
