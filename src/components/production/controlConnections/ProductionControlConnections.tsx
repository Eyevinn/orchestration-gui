import cloneDeep from 'lodash.clonedeep';
import { useControlPanels } from '../../../hooks/controlPanels';
import { ProductionControlConnection } from '../../../interfaces/production';
import ControlPanelDropDown from '../../dropDown/ControlPanelDropDown';
import Section from '../../section/Section';

interface ProductionControlConnectionsProps {
  controlConnection: ProductionControlConnection;
  onChange: (cc: any) => void;
}

const ProductionControlConnections: React.FC<
  ProductionControlConnectionsProps
> = (props) => {
  const { controlConnection, onChange } = props;

  const [controlPanels] = useControlPanels();

  const onControlConnectionChange = (ids: string[]) => {
    const newCC = cloneDeep(controlConnection);
    newCC.control_panel_ids = ids;
    onChange(newCC);
  };

  return (
    <Section title="Control Connections" startOpen>
      <div id="card-wrapper" className="mb-4">
        <div className="rounded-t-xl bg-zinc-700 p-4">
          {!!controlPanels?.length && (
            <ControlPanelDropDown
              options={controlPanels.map((controlPanel) => ({
                option: controlPanel.name,
                available: controlPanel.outgoing_connections?.length === 0,
                id: controlPanel.uuid
              }))}
              initial={controlConnection.control_panel_ids}
              setSelectedControlPanel={onControlConnectionChange}
            />
          )}
        </div>
        <div
          id="card-body"
          className="rounded-b-xl bg-zinc-600 text-white w-full flex flex-row flex-wrap"
        >
          <div className="p-4 w-1/5">
            <div className="border-b-2 font-bold">Control Panel Endpoint</div>
            <div className="flex flex-row py-2">
              <div className="mr-4">{'Port:'}</div>
              <div className="italic text-gray-300">
                {controlConnection.control_panel_endpoint.port}
              </div>
            </div>
            <div className="flex flex-row py-2">
              <div className="mr-4">{'To Pipeline:'}</div>
              <div className="italic text-gray-300">
                {controlConnection.control_panel_endpoint.toPipelineIdx}
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="border-b-2 font-bold">
              Pipeline Control Connections
            </div>
            <div className="flex flex-row">
              {controlConnection.pipeline_control_connections.map(
                (pcc, index) => (
                  <div className="mr-8" key={'pcc-' + index}>
                    <div className="flex flex-row py-2">
                      <div className="mr-4">{'Port:'}</div>
                      <div className="italic text-gray-300">{pcc.port}</div>
                    </div>
                    <div className="flex flex-row py-2">
                      <div className="mr-4">{'From Pipeline:'}</div>
                      <div className="italic text-gray-300">
                        {pcc.fromPipelineIdx}
                      </div>
                    </div>
                    <div className="flex flex-row py-2">
                      <div className="mr-4">{'To Pipeline:'}</div>
                      <div className="italic text-gray-300">
                        {pcc.toPipelineIdx}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ProductionControlConnections;