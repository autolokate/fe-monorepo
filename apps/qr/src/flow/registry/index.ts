export {
  SHARED_PIPELINE_STEP_IDS,
  sharedPipelineStepConfig,
  type SharedPipelineStepId,
  type SharedStepCatalog,
} from './config/shared-pipeline.config';
export { flowsConfig, type FlowConfigId } from './config/flows.config';
export { flowSpecificStepConfig, stepsConfig } from './config/steps.config';
export type { FlowConfig, FlowConfigEntry } from './config/types';
export { buildFlowRegistry, flowRegistry, type FlowRegistry, type RegisteredFlowId } from './build-registry';

/** @deprecated Use SHARED_PIPELINE_STEP_IDS from config */
export { SHARED_PIPELINE_STEP_IDS as sharedPipeline } from './config/shared-pipeline.config';

export { sharedPipelineStepConfig as sharedStepCatalog } from './config/shared-pipeline.config';
