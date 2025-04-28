import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CreationStep } from '../types/did';

// Define the shape of the DID context state
interface DIDContextState {
  currentStep: CreationStep;
  didData: Record<string, any>;
  isStepCompleted: boolean;
}

// Define the context interface with state and actions
interface DIDContextType {
  state: DIDContextState;
  setCurrentStep: (step: CreationStep) => void;
  updateDIDData: (data: Record<string, any>) => void;
  markStepAsCompleted: (completed: boolean) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
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
    currentStep: CreationStep.IMAGE_SELECTION,
    didData: {},
    isStepCompleted: false,
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
      setState(prevState => ({
        ...prevState,
        currentStep: prevState.currentStep + 1,
        isStepCompleted: false,
      }));
    }
  }, [state.currentStep, state.isStepCompleted]);

  // Go to previous step - memoized to prevent unnecessary re-renders
  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > CreationStep.WALLET_CONNECTION) {
      setState(prevState => ({
        ...prevState,
        currentStep: prevState.currentStep - 1,
        isStepCompleted: true, // Previous steps are considered completed
      }));
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
  }), [
    state,
    setCurrentStep,
    updateDIDData,
    markStepAsCompleted,
    goToNextStep,
    goToPreviousStep
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