import { create } from 'zustand';

interface SignatureData {
  encoded: string;
  pathName?: string;
  timestamp: number;
  sectionId?: number;
  documentId?: string | number;
}

interface SignatureState {
  signatures: { [rowId: string]: SignatureData };
  
  // Actions
  setSignature: (rowId: string, encoded: string, sectionId?: number, documentId?: string | number) => void;
  getSignature: (rowId: string) => SignatureData | null;
  clearSignature: (rowId: string) => void;
  clearAllSignatures: () => void;
  hasSignature: (rowId: string) => boolean;
  
  // Section-specific actions
  getSignaturesForSection: (sectionId: number) => { [rowId: string]: SignatureData };
  clearSignaturesForDocument: (documentId: string | number) => void;
}

export const useSignatureStore = create<SignatureState>()((set, get) => ({
      signatures: {},

      setSignature: (rowId: string, encoded: string, sectionId?: number, documentId?: string | number) => {
        console.log('🖊️ [SIGNATURE STORE] Setting signature for:', rowId, 'length:', encoded.length);
        
        set((state) => ({
          signatures: {
            ...state.signatures,
            [rowId]: {
              encoded,
              timestamp: Date.now(),
              sectionId,
              documentId,
            }
          }
        }));
      },

      getSignature: (rowId: string) => {
        const signature = get().signatures[rowId];
        console.log('🔍 [SIGNATURE STORE] Getting signature for:', rowId, 'found:', !!signature);
        return signature || null;
      },

      clearSignature: (rowId: string) => {
        console.log('🗑️ [SIGNATURE STORE] Clearing signature for:', rowId);
        
        set((state) => {
          const { [rowId]: _, ...remaining } = state.signatures;
          return { signatures: remaining };
        });
      },

      clearAllSignatures: () => {
        console.log('🗑️ [SIGNATURE STORE] Clearing all signatures');
        set({ signatures: {} });
      },

      hasSignature: (rowId: string) => {
        const hasSignature = !!get().signatures[rowId]?.encoded;
        console.log('❓ [SIGNATURE STORE] Has signature for:', rowId, '→', hasSignature);
        return hasSignature;
      },

      getSignaturesForSection: (sectionId: number) => {
        const allSignatures = get().signatures;
        const sectionSignatures = Object.entries(allSignatures)
          .filter(([_, data]) => data.sectionId === sectionId)
          .reduce((acc, [rowId, data]) => {
            acc[rowId] = data;
            return acc;
          }, {} as { [rowId: string]: SignatureData });
        
        console.log('📋 [SIGNATURE STORE] Getting signatures for section:', sectionId, 'found:', Object.keys(sectionSignatures).length);
        return sectionSignatures;
      },

      clearSignaturesForDocument: (documentId: string | number) => {
        console.log('🗑️ [SIGNATURE STORE] Clearing signatures for document:', documentId);
        
        set((state) => {
          const filteredSignatures = Object.entries(state.signatures)
            .filter(([_, data]) => data.documentId !== documentId)
            .reduce((acc, [rowId, data]) => {
              acc[rowId] = data;
              return acc;
            }, {} as { [rowId: string]: SignatureData });
          
          return { signatures: filteredSignatures };
        });
      },
    }));