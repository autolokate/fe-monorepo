export {
  SHARED_PIPELINE_STEP_IDS,
  sharedPipelineStepConfig,
  type SharedPipelineStepId,
  type SharedStepCatalog,
} from './config/shared-pipeline.config.js';
export { flowsConfig, type FlowConfigId } from './config/flows.config.js';
export { flowSpecificStepConfig, stepsConfig } from './config/steps.config.js';
export type { FlowConfig, FlowConfigEntry } from './config/types.js';
export { buildFlowRegistry, flowRegistry, type FlowRegistry, type RegisteredFlowId } from './build-registry.js';

/** @deprecated Use SHARED_PIPELINE_STEP_IDS from config */
export { SHARED_PIPELINE_STEP_IDS as sharedPipeline } from './config/shared-pipeline.config.js';

export { sharedPipelineStepConfig as sharedStepCatalog } from './config/shared-pipeline.config.js';
