import { PipelineSettings } from '../../interfaces/pipeline';
import { Production } from '../../interfaces/production';
import { PipelineCard } from './PipelineCard';

type PipelinesProps = {
  isProductionActive: boolean;
  pipelines: PipelineSettings[];
};
export function Pipelines({ isProductionActive, pipelines }: PipelinesProps) {
  return (
    <div className="flex flex-col gap-2 max-w-max">
      {pipelines?.flatMap((pipeline) => {
        if (pipeline.pipeline_id) {
          return (
            <PipelineCard
              isActive={isProductionActive}
              key={pipeline.pipeline_id + pipeline.pipeline_readable_name}
              pipelineId={pipeline.pipeline_id}
            />
          );
        }
        return [];
      })}
    </div>
  );
}
