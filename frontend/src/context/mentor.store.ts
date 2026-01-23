import { create } from 'zustand';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface MentorStore {
  isOpen: boolean;
  conversations: Record<string, ConversationMessage[]>;
  currentContext: string;
  loading: boolean;
  
  openMentor: () => void;
  closeMentor: () => void;
  setContext: (context: string) => void;
  addMessage: (conversationId: string, message: ConversationMessage) => void;
  setLoading: (loading: boolean) => void;
}

export const useMentorStore = create<MentorStore>((set) => ({
  isOpen: false,
  conversations: {},
  currentContext: 'global',
  loading: false,

  openMentor: () => set({ isOpen: true }),
  
  closeMentor: () => set({ isOpen: false }),
  
  setContext: (context) => set({ currentContext: context }),
  
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: [
          ...(state.conversations[conversationId] || []),
          message,
        ],
      },
    })),

  setLoading: (loading) => set({ loading }),
}));
