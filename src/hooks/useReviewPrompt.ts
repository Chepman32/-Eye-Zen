import { useCallback } from 'react';
import InAppReview from 'react-native-in-app-review';
import { storageService } from '../services/storageService';

const STORAGE_KEY = 'review_prompt_state';
const SESSION_THRESHOLD = 3;

type ReviewPromptState = {
  sessionCount: number;
  purchaseTriggered: boolean;
  hasPrompted: boolean;
  lastPromptDate?: string;
};

const initialState: ReviewPromptState = {
  sessionCount: 0,
  purchaseTriggered: false,
  hasPrompted: false,
};

const loadState = async (): Promise<ReviewPromptState> => {
  const saved = await storageService.getItem<ReviewPromptState>(STORAGE_KEY);
  if (!saved) {
    return { ...initialState };
  }
  return {
    ...initialState,
    ...saved,
  };
};

const persistState = async (state: ReviewPromptState) => {
  await storageService.setItem(STORAGE_KEY, state);
};

export type PositiveEvent = 'session' | 'purchase';

export const useReviewPrompt = () => {
  const recordPositiveEvent = useCallback(async (event: PositiveEvent) => {
    const state = await loadState();

    if (event === 'session') {
      state.sessionCount += 1;
    } else if (event === 'purchase') {
      state.purchaseTriggered = true;
    }

    let shouldPrompt = false;
    if (!state.hasPrompted) {
      if (state.purchaseTriggered) {
        shouldPrompt = true;
      } else if (state.sessionCount >= SESSION_THRESHOLD) {
        shouldPrompt = true;
      }
    }

    if (shouldPrompt && InAppReview.isAvailable()) {
      try {
        await InAppReview.RequestInAppReview();
        state.hasPrompted = true;
        state.lastPromptDate = new Date().toISOString();
      } catch (error) {
        console.warn('[reviewPrompt] Failed to trigger review prompt', error);
      }
    }

    await persistState(state);
  }, []);

  return { recordPositiveEvent };
};
