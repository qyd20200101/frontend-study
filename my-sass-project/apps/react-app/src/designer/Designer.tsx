import MaterialPanel from './MaterialPanel';
import CanvasPanel from './CanvasPanel';
import SettingsPanel from './SettingsPanel';

export default function Designer() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <MaterialPanel />
      <CanvasPanel />
      <SettingsPanel />
    </div>
  );
}
