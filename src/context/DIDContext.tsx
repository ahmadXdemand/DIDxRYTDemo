import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CreationStep } from '../types/did';

// Define the shape of the DID context state
interface DIDContextState {
  currentStep: CreationStep;
  didData: Record<string, any>;
  isStepCompleted: boolean;
  didVerificationScore: number;
  skippedIDVerification: boolean;
}

// Define the context interface with state and actions
interface DIDContextType {
  state: DIDContextState;
  setCurrentStep: (step: CreationStep) => void;
  updateDIDData: (data: Record<string, any>) => void;
  markStepAsCompleted: (completed: boolean) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateVerificationScore: (score: number) => void;
  skipIDVerification: () => void;
}

// Create the context with a default value
const DIDContext = createContext<DIDContextType | undefined>(undefined);

// Provider props
interface DIDProviderProps {
  children: ReactNode;
}

// Create a provider component
export const DIDProvider: React.FC<DIDProviderProps> = ({ children }) => {
  const [state, setState] = useState<DIDContextState>({
    currentStep: CreationStep.RECAPTCHA, //don't change this
    didData: {
      captchaCompleted: false
    },
    isStepCompleted: false,
    didVerificationScore: 10,
    skippedIDVerification: false
  });

  // Set the current step - memoized to prevent unnecessary re-renders
  const setCurrentStep = useCallback((step: CreationStep) => {
    setState(prevState => ({
      ...prevState,
      currentStep: step,
    }));
  }, []);

  // Update DID data - memoized to prevent unnecessary re-renders
  const updateDIDData = useCallback((data: Record<string, any>) => {
    setState(prevState => {
      // Check if we're actually adding new data that doesn't already exist
      let hasNewData = false;
      for (const key in data) {
        if (prevState.didData[key] !== data[key]) {
          hasNewData = true;
          break;
        }
      }

      // Only update if there's new data
      if (hasNewData) {
        const newData = {
          ...prevState.didData,
          ...data,
        };
        console.log('DID Data updated:', newData);
        return {
          ...prevState,
          didData: newData,
        };
      }
      return prevState;
    });
  }, []);

  // Update verification score - memoized to prevent unnecessary re-renders
  const updateVerificationScore = useCallback((score: number) => {
    setState(prevState => ({
      ...prevState,
      didVerificationScore: score
    }));
  }, []);

  // Skip ID verification and jump to VERIFICATION step
  const skipIDVerification = useCallback(() => {
    setState(prevState => {
      // Set demo data for skipped verification
      const newData = {
        ...prevState.didData,
        isDemo: true,
        demoData: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          nationality: 'International',
          documentType: 'None',
          documentNumber: 'DEMO-12345'
        }
      };
      
      //so for your understanding what i did here is if the user skiped the id selection he will not get the points for the id verification. 
      // if he is on liveness step and doen't take his/her selfie then the i will check if the user have not done the id selection too he will get the 15 points
      //the third check is if the user is skiping the image only but has done his id he should be give 40 scores on the score point. 
      if(prevState.currentStep === CreationStep.IMAGE_SELECTION){
        return {
          ...prevState,
          currentStep: CreationStep.LIVENESS_VERIFICATION,  // Skip to liveness verification step
          didData: newData,
          isStepCompleted: true,  // Mark as completed so we can proceed
          didVerificationScore: 25,  // Reduced score for skipped verification
          skippedIDVerification: true
        };
      } else if(prevState.currentStep === CreationStep.LIVENESS_VERIFICATION && prevState.skippedIDVerification){
        return {
          ...prevState,
          currentStep: CreationStep.VERIFICATION,  // Skip to verification step
          didData: newData,
          isStepCompleted: true,  // Mark as completed so we can proceed
          didVerificationScore: 25,  // Reduced score for skipped verification
          skippedIDVerification: true
        };
      } else if(prevState.currentStep === CreationStep.LIVENESS_VERIFICATION && !prevState.skippedIDVerification){
        return {
          ...prevState,
          currentStep: CreationStep.EXTRACTION,  // Skip to extraction step
          didData: newData,
          isStepCompleted: true,  // Mark as completed so we can proceed
          didVerificationScore: 40,  // Reduced score for skipped verification
          skippedIDVerification: true
        };
      }

      // Default return for any other case
      return {
        ...prevState,
        currentStep: CreationStep.VERIFICATION,  // Default to verification step
        didData: newData,
        isStepCompleted: true,
        didVerificationScore: 25,
        skippedIDVerification: true
      };
    });
  }, []);

  // Mark the current step as completed - memoized to prevent unnecessary re-renders
  const markStepAsCompleted = useCallback((completed: boolean) => {
    setState(prevState => {
      // Only update if the value is changing
      if (prevState.isStepCompleted !== completed) {
        return {
          ...prevState,
          isStepCompleted: completed,
        };
      }
      return prevState;
    });
  }, []);

  // Go to next step - memoized to prevent unnecessary re-renders
  const goToNextStep = useCallback(() => {
    if (state.currentStep < CreationStep.COMPLETED && state.isStepCompleted) {
      setState(prevState => {
        // Update verification score based on the next step
        let score = prevState.didVerificationScore;
        let nextStep = prevState.currentStep + 1;
        
        // If we've skipped ID verification and we're currently at IMAGE_SELECTION,
        // skip to VERIFICATION step
        if (prevState.skippedIDVerification && 
            (nextStep === CreationStep.LIVENESS_VERIFICATION || 
             nextStep === CreationStep.EXTRACTION)) {
          nextStep = CreationStep.VERIFICATION;
        }
        
        switch (nextStep) {
          case CreationStep.WALLET_CONNECTION:
            score = 10;
            break;
          case CreationStep.RECAPTCHA:
            score = 15;
            break;
          case CreationStep.IMAGE_SELECTION:
            score = 25;
            break;
          case CreationStep.LIVENESS_VERIFICATION:
            score = 35;
            break;
          case CreationStep.EXTRACTION:
            score = 60;
            break;
          case CreationStep.VERIFICATION:
            score = prevState.skippedIDVerification ? 40 : 75;
            break;
          case CreationStep.MINTING:
            score = prevState.skippedIDVerification ? 60 : 92;
            break;
          case CreationStep.COMPLETED:
            score = 100;
            break;
        }
        
        return {
          ...prevState,
          currentStep: nextStep,
          isStepCompleted: false,
          didVerificationScore: score
        };
      });
    }
  }, [state.currentStep, state.isStepCompleted]);

  // Go to previous step - memoized to prevent unnecessary re-renders
  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > CreationStep.RECAPTCHA) {
      setState(prevState => {
        // If going back to the RECAPTCHA step, reset captcha status
        const newDidData = { ...prevState.didData };
        if (prevState.currentStep === CreationStep.IMAGE_SELECTION) {
          newDidData.captchaCompleted = false;
        }
        
        // Calculate previous step, accounting for skipped steps
        let prevStep = prevState.currentStep - 1;
        
        // If we're at VERIFICATION and we skipped the ID verification steps,
        // go back to IMAGE_SELECTION
        if (prevState.skippedIDVerification && 
            prevState.currentStep === CreationStep.VERIFICATION) {
          prevStep = CreationStep.IMAGE_SELECTION;
        }
        
        // Update verification score based on the previous step
        let score = prevState.didVerificationScore;
        
        switch (prevStep) {
          case CreationStep.WALLET_CONNECTION:
            score = 10;
            break;
          case CreationStep.RECAPTCHA:
            score = 15;
            break;
          case CreationStep.IMAGE_SELECTION:
            score = 25;
            break;
          case CreationStep.LIVENESS_VERIFICATION:
            score = 35;
            break;
          case CreationStep.EXTRACTION:
            score = 60;
            break;
          case CreationStep.VERIFICATION:
            score = prevState.skippedIDVerification ? 40 : 75;
            break;
          case CreationStep.MINTING:
            score = prevState.skippedIDVerification ? 60 : 92;
            break;
        }
        
        return {
          ...prevState,
          currentStep: prevStep,
          didData: newDidData,
          isStepCompleted: prevStep === CreationStep.RECAPTCHA && prevState.currentStep === CreationStep.IMAGE_SELECTION ? false : true,
          didVerificationScore: score
        };
      });
    }
  }, [state.currentStep]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    state,
    setCurrentStep,
    updateDIDData,
    markStepAsCompleted,
    goToNextStep,
    goToPreviousStep,
    updateVerificationScore,
    skipIDVerification
  }), [
    state,
    setCurrentStep,
    updateDIDData,
    markStepAsCompleted,
    goToNextStep,
    goToPreviousStep,
    updateVerificationScore,
    skipIDVerification
  ]);

  return <DIDContext.Provider value={value}>{children}</DIDContext.Provider>;
};

// Create a hook to use the DID context
export const useDIDContext = () => {
  const context = useContext(DIDContext);
  if (context === undefined) {
    throw new Error('useDIDContext must be used within a DIDProvider');
  }
  return context;
}; 