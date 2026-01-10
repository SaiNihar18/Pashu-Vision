import type { HistoryEntry, BreedInfo } from '../types';

const HISTORY_KEY = 'breed_ai_history';

export const getHistory = (): HistoryEntry[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

const saveHistory = (history: HistoryEntry[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
};

export const addToHistory = (item: { imageDataUrl: string; result: BreedInfo }): void => {
  const newEntry: HistoryEntry = {
    id: `${new Date().getTime()}-${Math.random().toString(36).substring(2, 9)}`,
    imageDataUrl: item.imageDataUrl,
    result: item.result,
    date: new Date().toISOString(),
  };

  const history = getHistory();
  history.unshift(newEntry); // Add to the beginning of the list
  saveHistory(history);
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history from localStorage", error);
  }
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
