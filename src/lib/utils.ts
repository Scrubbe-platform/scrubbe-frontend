import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const getEmailDomain = (email: string): {domain:string, email:string} => {
  if (!email || !email.includes('@')) return {domain: "", email: ""};
  
  // We split by '@' and take the last element in case of weird edge cases
  return {
    domain: email.split('@').pop()?.replace(".com", "") || '',
    email: `${email.split("@")[0].substring(0,3)}*****@` + email.split('@').pop() || ''
  }
};