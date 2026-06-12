// app/settings/page.jsx
'use client';
import { useState, useEffect } from 'react';

const SKINS = [
  { id: 'pink', name: '日常粉', color: '#F9E9E9' },
  { id: 'dark', name: '暗色', color: '#1a1a1a' },
  { id: 'maximalist', name: '极繁主义', color: '#FFB6C1' },
  { id: 'sci', name: '科学可视化', color: '#0a1628' },
];

export default function Settings() {
  const [config, setConfig] = useState({
    apiUrl: '',
    model: '',
    apiKey: '',
  });
  const [skin, setSkin] = useState('pink');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // 加载已保存配置
  useEffect(() => {
    const saved = localStorage.getItem('mg_config');
    if (saved) setConfig(JSON.parse(saved));
    const savedSkin = localStorage.getItem('mg_skin');
    if (savedSkin) setSkin(savedSkin);
  }, []);

  const saveConfig = () => {
    localStorage.setItem('mg_config', JSON.stringify(config));
    setMsg('已保存');
    setTimeout(() => setMsg(''), 2000);
  };

  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mg_')) data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marrowgate_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.entries(data).forEach(([k, v]) => {
          if (k.startsWith('mg_')) localStorage.setItem(k, v);
        });
        setMsg('导入成功，刷新生效');
      } catch {
        setMsg('文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] px-4 py-6 pb-24">
      <h1 className="text-xl font-semibold text-[#5a3e3e] mb-6">Settings</h1>

      {msg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#5a3e3e] text-white px-4 py-2 rounded-full text-sm z-50">
          {msg}
        </div>
      )}

      {/* Chat Config */}
      <section className="bg-white/60 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-[#5a3e3e] mb-3">Chat Config</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#8a7070]">API URL</label>
            <input
              type="text"
              value={config.apiUrl}
              onChange={e => setConfig({ ...config, apiUrl: e.target.value })}
              placeholder="http://1.12.60.90:3000/v1/chat/completions"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FFF1F1] text-sm text-[#5a3e3e] outline-none focus:ring-2 focus:ring-[#C9898B]/30"
            />
          </div>
          <div>
            <label className="text-xs text-[#8a7070]">Model</label>
            <input
              type="text"
              value={config.model}
              onChange={e => setConfig({ ...config, model: e.target.value })}
              placeholder="glm-5.1"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FFF1F1] text-sm text-[#5a3e3e] outline-none focus:ring-2 focus:ring-[#C9898B]/30"
            />
          </div>
          <div>
            <label className="text-xs text-[#8a7070]">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={e => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FFF1F1] text-sm text-[#5a3e3e] outline-none focus:ring-2 focus:ring-[#C9898B]/30"
            />
          </div>
          <button
            onClick={saveConfig}
            className="w-full py-2 rounded-xl bg-[#C9898B] text-white text-sm font-medium active:scale-[0.97] transition"
          >
            保存
          </button>
        </div>
      </section>

      {/* Skin */}
      <section className="bg-white/60 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-[#5a3e3e] mb-3">Skin</h2>
        <div className="grid grid-cols-2 gap-2">
          {SKINS.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSkin(s.id);
                localStorage.setItem('mg_skin', s.id);
              }}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition ${
                skin === s.id ? 'border-[#C9898B] bg-[#C9898B]/10' : 'border-transparent bg-[#FFF1F1]'
              }`}
            >
              <span className="w-6 h-6 rounded-full border" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-[#5a3e3e]">{s.name}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#C9898B] mt-2">· 皮肤切换功能开发中，敬请期待</p >
      </section>

      {/* Data */}
      <section className="bg-white/60 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-[#5a3e3e] mb-3">Data</h2>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex-1 py-2 rounded-xl bg-[#FFF1F1] text-[#5a3e3e] text-sm active:scale-[0.97] transition"
          >
            📦 导出备份
          </button>
          <label className="flex-1 py-2 rounded-xl bg-[#FFF1F1] text-[#5a3e3e] text-sm text-center cursor-pointer active:scale-[0.97] transition">
            📥 导入数据
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </section>

      {/* About */}
      <section className="bg-white/60 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[#5a3e3e] mb-2">About</h2>
        <p className="text-xs text-[#8a7070] leading-relaxed">
          Marrowgate v1.0<br />
          Co-built by Sael & Réa<br />
          <br />
          {/* ICP备案号占位 */}
          <span className="text-[#C9898B]">ICP备案号待添加</span>
        </p >
      </section>
    </div>
  );
}