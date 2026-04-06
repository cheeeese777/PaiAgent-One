interface HeaderProps {
  flowName: string;
  onFlowNameChange: (name: string) => void;
  onNew: () => void;
  onLoad: () => void;
  onSave: () => void;
  onDebug: () => void;
  saving: boolean;
  username: string;
  onLogout: () => void;
}

export default function Header({
  flowName, onFlowNameChange, onNew, onLoad, onSave, onDebug,
  saving, username, onLogout,
}: HeaderProps) {
  return (
    <div className="h-14 bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500 flex items-center px-4 gap-4 flex-shrink-0 shadow-sm">
      {/* Logo */}
      <span className="text-white font-bold text-xl tracking-wide">PaiAgent</span>

      {/* Flow Name */}
      <input
        type="text"
        value={flowName}
        onChange={(e) => onFlowNameChange(e.target.value)}
        className="bg-white/20 text-white placeholder-white/60 px-3 py-1 rounded-lg text-sm border border-white/30 focus:outline-none focus:bg-white/30 w-40"
        placeholder="工作流名称"
      />

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNew}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors border border-white/30"
        >
          + 新建
        </button>
        <button
          onClick={onLoad}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors border border-white/30"
        >
          加载
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          onClick={onDebug}
          className="px-3 py-1.5 bg-white text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
        >
          调试
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-white/90 text-sm">{username}</span>
        <button
          onClick={onLogout}
          className="text-white/70 hover:text-white text-sm transition-colors"
        >
          登出
        </button>
      </div>
    </div>
  );
}
