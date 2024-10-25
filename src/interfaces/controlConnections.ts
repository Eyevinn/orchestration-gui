export interface ControlConnection {
  control_panel_ids?: string[];
  control_panel_endpoint: {
    port: number;
    toPipelineIdx: number;
  };
  pipeline_control_connections: {
    port: number;
    fromPipelineIdx: number;
    toPipelineIdx: number;
  }[];
}
