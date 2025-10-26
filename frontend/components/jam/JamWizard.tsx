'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  canSkip?: boolean;
}

interface JamWizardProps {
  steps: WizardStep[];
  onComplete?: () => void;
  className?: string;
}

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

/**
 * JamWizard - Progressive reveal wizard flow component
 * Cards fade in/out as user moves through steps
 */
export function JamWizard({ steps, onComplete, className }: JamWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToNext = () => {
    if (!isLastStep) {
      setDirection(1);
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const goToPrevious = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex !== currentStep && stepIndex >= 0 && stepIndex < steps.length) {
      setDirection(stepIndex > currentStep ? 1 : -1);
      setCurrentStep(stepIndex);
    }
  };

  if (!step) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, index) => (
          <button
            key={s.id}
            onClick={() => goToStep(index)}
            className={cn(
              'group relative flex items-center justify-center',
              'transition-all duration-200',
              index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            )}
            disabled={index > currentStep}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                'transition-all duration-200',
                index === currentStep && 'border-primary bg-primary text-primary-foreground scale-110',
                index < currentStep && 'border-primary bg-primary text-primary-foreground',
                index > currentStep && 'border-muted-foreground/30 bg-background'
              )}
            >
              {completedSteps.has(index) || index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 ml-1',
                  index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <Card className="border-2">
              <CardContent className="p-6 md:p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{step.title}</h2>
                  {step.description && (
                    <p className="text-muted-foreground">{step.description}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {step.component}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={goToPrevious}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {step.canSkip && !isLastStep && (
            <Button variant="ghost" size="lg" onClick={goToNext}>
              Skip
            </Button>
          )}
          <Button size="lg" onClick={goToNext} className="gap-2 min-w-32">
            {isLastStep ? (
              <>
                <Check className="w-4 h-4" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
