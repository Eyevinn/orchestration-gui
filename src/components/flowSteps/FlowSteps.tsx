import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import { FlowStep } from '../../interfaces/production';
import StatusTooltip from '../tooltip/StatusTooltip';

interface FlowStepsProps {
  steps: FlowStep[];
}

const FlowSteps: React.FC<FlowStepsProps> = (props) => {
  const { steps } = props;

  return (
    <div className="flex flex-col mb-4 w-96">
      {steps.map((step, i) => {
        return (
          <div key={i} className="flex flex-col items-center justify-center">
            {!step.success ? (
              <div className="flex gap-1 justify-start w-1/2">
                <div className="flex flex-col items-start">
                  <div
                    className={`h-6 w-6 p-1 flex justify-center items-center rounded-full ${
                      step.success ? 'bg-button-bg' : 'bg-button-delete'
                    }`}
                  >
                    {step.success ? <IconCheck /> : <IconX />}
                  </div>
                  {i + 1 < steps.length && (
                    <div className="self-center mt-1 mb-1 border-l border-gray-500 h-4"></div>
                  )}
                </div>
                <p className="whitespace-nowrap">{step.step}</p>

                <StatusTooltip
                  key={i}
                  description={step.message || 'Missing error message'}
                >
                  <IconInfoCircle color="#6b7280" />
                </StatusTooltip>
              </div>
            ) : (
              <div className="flex gap-1 justify-start w-1/2">
                <div className="flex flex-col items-start">
                  <div
                    className={`h-6 w-6 p-1 flex justify-center items-center rounded-full ${
                      step.success ? 'bg-button-bg' : 'bg-button-delete'
                    }`}
                  >
                    {step.success ? <IconCheck /> : <IconX />}
                  </div>
                  {i + 1 < steps.length && (
                    <div className="self-center mt-1 mb-1 border-l border-gray-500 h-4"></div>
                  )}
                </div>
                <p className="whitespace-nowrap">{step.step}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FlowSteps;
