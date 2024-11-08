import { KeyboardEvent } from 'react';
import { useTranslate } from '../../../i18n/useTranslate';
import {
  PipelineOutput,
  PipelineOutputEncoderSettings,
  PipelineOutputWithoutEncoderSettings
} from '../../../interfaces/pipeline';
import Input from '../../modal/configureOutputModal/Input';
import Options from '../../modal/configureOutputModal/Options';
import StreamAccordion from '../../modal/configureOutputModal/StreamAccordion';
import cloneDeep from 'lodash.clonedeep';
import { useContext } from 'react';
import { GlobalContext } from '../../../contexts/GlobalContext';

const createNewStream = () => {
  return {
    audio_format: 'ADTS',
    audio_kilobit_rate: 128,
    format: 'MPEG-TS-SRT',
    local_ip: '0.0.0.0',
    local_port: 9000,
    remote_ip: '0.0.0.0',
    remote_port: 9000,
    srt_latency_ms: 120,
    srt_mode: 'listener',
    srt_passphrase: '',
    video_gop_length: 50,
    srt_stream_id: ''
  };
};

interface ProductionOutputEditProps {
  output: PipelineOutput;
  onOutputChange: (output: PipelineOutput) => void;
}

export interface OutputStream {
  name: string;
  pipelineIndex: number;
  ip: string;
  srtMode: string;
  srtPassphrase: string;
  port: number;
  srt_stream_id: string;
}

const ProductionOutputEdit: React.FC<ProductionOutputEditProps> = (props) => {
  const { output, onOutputChange } = props;

  const t = useTranslate();
  const { locked } = useContext(GlobalContext);

  const preventCharacters = (evt: KeyboardEvent) => {
    ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault();
  };

  const handleUpdateOutputSetting = (
    key: keyof PipelineOutputEncoderSettings,
    value: string | number
  ) => {
    const newOutput: PipelineOutput = cloneDeep(output);
    // Simple workaround to set these values as numbers
    if (['video_bit_depth', 'video_kilobit_rate'].includes(key)) {
      newOutput.settings[key] = Number(value) as never;
    } else {
      newOutput.settings[key] = value as never;
    }
    onOutputChange(newOutput);
  };

  const getOutputFields = (output: PipelineOutput) => {
    return (
      <div className="flex flex-col gap-3" key={`${output.uuid}-options`}>
        <Options
          disabled={locked}
          label={t('preset.video_format')}
          options={[
            { id: 'AVC', label: 'AVC' },
            { id: 'HEVC', label: 'HEVC' }
          ]}
          value={output.settings.video_format}
          update={(value) => handleUpdateOutputSetting('video_format', value)}
        />
        <Options
          disabled={locked}
          options={[
            {
              id: '8',
              label: '8'
            },
            {
              id: '10',
              label: '10'
            }
          ]}
          label={t('preset.video_bit_depth')}
          value={output.settings.video_bit_depth.toString()}
          update={(value) =>
            handleUpdateOutputSetting('video_bit_depth', value)
          }
        />

        <Input
          onKeyDown={preventCharacters}
          type="number"
          label={t('preset.video_kilobit_rate')}
          value={output.settings.video_kilobit_rate}
          update={(value) =>
            handleUpdateOutputSetting('video_kilobit_rate', value)
          }
          disabled={locked}
        />
      </div>
    );
  };

  const handleAddStream = (output: PipelineOutput) => {
    const newOutput: PipelineOutput = cloneDeep(output);
    const newStream = createNewStream();
    newOutput.streams.push(newStream);
    onOutputChange(newOutput);
  };

  const handleUpdateStream = (index: number, field: string, value: string) => {
    const getInt = (val: string) => {
      if (Number.isNaN(parseInt(value))) {
        return 0;
      }
      return parseInt(val);
    };
    const newOutput: PipelineOutput = cloneDeep(output);
    const newStream = newOutput.streams[index];
    switch (field) {
      default:
      case 'port':
        newStream.local_port = getInt(value);
        newStream.remote_port = getInt(value);
        break;
      case 'srtMode':
        newStream.srt_mode = value;
        break;
      case 'ip':
        newStream.local_ip = value;
        newStream.remote_ip = value;
        break;
      case 'srtPassphrase':
        newStream.srt_passphrase = value;
        break;
      case 'srt_stream_id':
        newStream.srt_stream_id = value;
        break;
    }
    onOutputChange(newOutput);
  };

  const handleDeleteStream = (index: number) => {
    const newOutput = cloneDeep(output);
    newOutput.streams.splice(index, 1);
    onOutputChange(newOutput);
  };

  const getOutputStreams = (output: PipelineOutput) => {
    if (!output.streams.length) return;

    const convertStream = (
      stream: PipelineOutputWithoutEncoderSettings,
      index: number
    ): OutputStream => {
      return {
        name: `Stream ${index + 1}`,
        pipelineIndex: 0,
        ip: stream.local_ip,
        srtMode: stream.srt_mode,
        srtPassphrase: stream.srt_passphrase,
        port: stream.local_port,
        srt_stream_id: stream.srt_stream_id
      };
    };
    return output.streams.map((stream, index) => {
      return (
        <StreamAccordion
          disabled={locked}
          isOnlyStream={false}
          key={'output-streams-' + index}
          stream={convertStream(stream, index)}
          update={(field, value) => handleUpdateStream(index, field, value)}
          onDelete={() => {
            handleDeleteStream(index);
          }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col gap-2 rounded p-4 max-w-1/8">
      <h1 className="font-bold text-center">{output.uuid}</h1>
      {getOutputFields(output)}
      <div className="flex flex-col gap-3">{getOutputStreams(output)}</div>
      <button
        disabled={locked}
        onClick={() => handleAddStream(output)}
        className={`${
          locked
            ? 'bg-gray-500/50 text-p/50'
            : 'hover:border-gray-500 bg-gray-500'
        } rounded-xl border border-gray-600 focus:border-gray-400 focus:outline-none p-3`}
      >
        {t('preset.add_stream')}
      </button>
    </div>
  );
};

export default ProductionOutputEdit;
