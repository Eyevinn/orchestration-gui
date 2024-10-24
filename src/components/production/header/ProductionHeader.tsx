import { KeyboardEvent, useContext } from 'react';
import HeaderNavigation from '../../headerNavigation/HeaderNavigation';
import { ConfigureMultiviewButton } from '../../modal/configureMultiviewModal/ConfigureMultiviewButton';
import { ConfigureOutputButton } from '../../startProduction/ConfigureOutputButton';
import { StartProductionButton } from '../../startProduction/StartProductionButton';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { Production } from '../../../interfaces/production';
import { Preset } from '../../../interfaces/preset';
import toast from 'react-hot-toast';
import { MultiviewSettings } from '../../../interfaces/multiview';
import {
  useAddMultiviewersOnRunningProduction,
  useRemoveMultiviewersOnRunningProduction,
  useUpdateMultiviewersOnRunningProduction
} from '../../../hooks/workflow';
import { useTranslate } from '../../../i18n/useTranslate';
import { useGetMultiviewLayout } from '../../../hooks/multiviewLayout';
import { useGetPresets } from '../../../hooks/presets';

interface ProductionHeaderProps {
  productionSetup?: Production;
  setProductionSetup: any;
  putProduction: any;
  selectedPreset: any;
  presets: any;
  memoizedProduction: any;
  refreshProduction: any;
  setPresets: any;
  setSelectedPreset: any;
  configurationName: any;
  setConfigurationName: any;
}

const ProductionHeader: React.FC<ProductionHeaderProps> = (props) => {
  const {
    productionSetup,
    putProduction,
    setProductionSetup,
    selectedPreset,
    presets,
    memoizedProduction,
    refreshProduction,
    setSelectedPreset,
    setPresets,
    configurationName,
    setConfigurationName
  } = props;
  const { locked } = useContext(GlobalContext);
  const [addMultiviewersOnRunningProduction] =
    useAddMultiviewersOnRunningProduction();
  const [updateMultiviewersOnRunningProduction] =
    useUpdateMultiviewersOnRunningProduction();
  const [removeMultiviewersOnRunningProduction] =
    useRemoveMultiviewersOnRunningProduction();

  const t = useTranslate();
  const getPresets = useGetPresets();

  const getMultiviewLayout = useGetMultiviewLayout();

  const updateConfigName = (nameChange: string) => {
    if (productionSetup?.name === nameChange) {
      return;
    }
    setConfigurationName(nameChange);
    const updatedSetup = {
      ...productionSetup,
      name: nameChange
    } as Production;
    setProductionSetup(updatedSetup);
    putProduction(updatedSetup._id.toString(), updatedSetup);
  };

  const hasSelectedPipelines = () => {
    if (!productionSetup?.production_settings?.pipelines?.length) return false;
    let allPipesHaveName = true;
    productionSetup.production_settings.pipelines.forEach((p) => {
      if (!p.pipeline_name) allPipesHaveName = false;
    });
    return allPipesHaveName;
  };

  async function updateSelectedPreset(preset?: Preset) {
    if (!preset && productionSetup?._id) {
      getPresets().then((presets: any) => {
        setPresets(presets);
      });
      setSelectedPreset(undefined);
      return;
    }
    if (!preset?.default_multiview_reference) {
      toast.error(t('production.missing_multiview'));
      return;
    }
    const defaultMultiview = await getMultiviewLayout(
      preset?.default_multiview_reference
    );
    setSelectedPreset(preset);

    const multiview = {
      layout: defaultMultiview.layout,
      output: defaultMultiview.output,
      name: defaultMultiview.name,
      for_pipeline_idx: 0
    };
    let controlPanelName: string[] = [];
    if (
      productionSetup?.production_settings &&
      productionSetup?.production_settings.control_connection.control_panel_name
    ) {
      // Keep the control panels name array from the current production setup
      controlPanelName =
        productionSetup.production_settings.control_connection
          .control_panel_name!;
    }

    const updatedSetup = {
      ...productionSetup,
      production_settings: {
        _id: preset._id,
        name: preset.name,
        control_connection: {
          control_panel_endpoint:
            preset.control_connection.control_panel_endpoint,
          pipeline_control_connections:
            preset.control_connection.pipeline_control_connections,
          control_panel_name: controlPanelName
        },
        pipelines: preset.pipelines
      }
    } as Production;
    updatedSetup.production_settings.pipelines[0].multiviews = [multiview];
    setProductionSetup(updatedSetup);
  }

  const updatePreset = (preset: Preset) => {
    if (!productionSetup?._id) return;

    const presetMultiviews = preset.pipelines[0].multiviews;
    const productionMultiviews =
      productionSetup.production_settings.pipelines[0].multiviews;

    const updatedPreset = {
      ...productionSetup,
      production_settings: {
        ...preset,
        control_connection: {
          ...preset.control_connection,
          control_panel_name:
            productionSetup.production_settings.control_connection
              .control_panel_name
        },
        pipelines: preset.pipelines.map((p, i) => {
          return {
            ...p,
            pipeline_name:
              productionSetup.production_settings.pipelines[i].pipeline_name
          };
        })
      }
    };

    if (productionSetup.isActive && presetMultiviews && productionMultiviews) {
      const productionMultiviewsMap = new Map(
        productionMultiviews.map((item: any) => [item.multiview_id, item])
      );
      const presetMultiviewsMap = new Map(
        presetMultiviews.map((item) => [item.multiview_id, item])
      );

      const additions: MultiviewSettings[] = [];
      const updates: MultiviewSettings[] = [];

      presetMultiviews.forEach((newItem) => {
        const oldItem = productionMultiviewsMap.get(newItem.multiview_id);

        if (!oldItem) {
          additions.push(newItem);
        } else if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          updates.push(newItem);
        }
      });

      const removals = productionMultiviews.filter(
        (oldItem: any) => !presetMultiviewsMap.has(oldItem.multiview_id)
      );

      if (additions.length > 0) {
        addMultiviewersOnRunningProduction(
          (productionSetup?._id.toString(), updatedPreset),
          additions
        );
      }

      if (updates.length > 0) {
        updateMultiviewersOnRunningProduction(
          (productionSetup?._id.toString(), updatedPreset),
          updates
        );
      }

      if (removals.length > 0) {
        removeMultiviewersOnRunningProduction(
          (productionSetup?._id.toString(), updatedPreset),
          removals
        );
      }
    }

    putProduction(productionSetup?._id.toString(), updatedPreset).then(() => {
      refreshProduction();
    });
  };

  return (
    <HeaderNavigation>
      <input
        className="m-2 text-4xl text-p bg-transparent grow text-start"
        type="text"
        value={configurationName}
        onChange={(e) => {
          setConfigurationName(e.target.value);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key.includes('Enter')) {
            e.currentTarget.blur();
          }
        }}
        onBlur={() => updateConfigName(configurationName)}
        disabled={locked}
      />
      <div
        className="flex mr-2 w-fit rounded justify-end items-center gap-3"
        key={'StartProductionButtonKey'}
        id="presetDropdownDefaultCheckbox"
      >
        <ConfigureOutputButton
          disabled={
            productionSetup?.isActive || locked || !hasSelectedPipelines()
          }
          preset={selectedPreset}
          updatePreset={updatePreset}
        />
        <ConfigureMultiviewButton
          disabled={locked || !hasSelectedPipelines()}
          preset={selectedPreset}
          updatePreset={updatePreset}
          production={memoizedProduction}
        />
        <StartProductionButton
          refreshProduction={refreshProduction}
          production={productionSetup}
          disabled={
            (!selectedPreset ? true : false) ||
            locked ||
            !hasSelectedPipelines()
          }
        />
      </div>
    </HeaderNavigation>
  );
};

export default ProductionHeader;
