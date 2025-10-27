'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Download, Upload, FileText, Check, X, AlertTriangle } from 'lucide-react';

interface SettingsImportExportProps {
  className?: string;
}

export const SettingsImportExport: React.FC<SettingsImportExportProps> = ({
  className = ''
}) => {
  const { exportSettings, importSettings, resetAllSettings } = useSettingsStore();
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const settingsJson = exportSettings();
    
    // Create and download file
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caminho-assombrado-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const success = importSettings(importText);
    setImportStatus(success ? 'success' : 'error');
    
    if (success) {
      setImportText('');
      setShowImportArea(false);
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    resetAllSettings();
    setShowResetConfirm(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Gestão de Configurações
      </h3>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="space-y-4">
          {/* Export Settings */}
          <div>
            <h4 className="text-white font-medium mb-2">Exportar Configurações</h4>
            <p className="text-gray-400 text-sm mb-3">
              Guarde as suas configurações num ficheiro para backup ou partilha
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Configurações
            </button>
          </div>

          {/* Import Settings */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-white font-medium mb-2">Importar Configurações</h4>
            <p className="text-gray-400 text-sm mb-3">
              Carregue configurações de um ficheiro ou cole o conteúdo JSON
            </p>
            
            {!showImportArea ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportArea(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Importar Configurações
                </button>
                
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Carregar Ficheiro
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Cole aqui o conteúdo JSON das configurações..."
                  className="w-full h-32 p-3 bg-gray-700 text-white rounded-lg resize-none text-sm font-mono"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleImport}
                    disabled={!importText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Importar
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowImportArea(false);
                      setImportText('');
                      setImportStatus('idle');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Import Status */}
            {importStatus === 'success' && (
              <div className="mt-3 p-3 bg-green-900/30 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-300">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Configurações importadas com sucesso!</span>
                </div>
              </div>
            )}
            
            {importStatus === 'error' && (
              <div className="mt-3 p-3 bg-red-900/30 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-300">
                  <X className="w-4 h-4" />
                  <span className="text-sm">Erro ao importar configurações. Verifique o formato JSON.</span>
                </div>
              </div>
            )}
          </div>

          {/* Reset Settings */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-white font-medium mb-2">Restaurar Configurações</h4>
            <p className="text-gray-400 text-sm mb-3">
              Restaura todas as configurações para os valores padrão
            </p>
            
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Restaurar Tudo
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-yellow-900/30 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-300 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Confirmação Necessária</span>
                  </div>
                  <p className="text-yellow-200 text-xs">
                    Esta ação irá restaurar todas as configurações (áudio, controlos, exibição e jogo) 
                    para os valores padrão. Esta ação não pode ser desfeita.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar Restauro
                  </button>
                  
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600/20">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Informações:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• As configurações exportadas incluem áudio, controlos, exibição e jogo</li>
          <li>• Os ficheiros exportados são compatíveis entre diferentes dispositivos</li>
          <li>• Use o backup das configurações antes de fazer alterações importantes</li>
        </ul>
      </div>
    </div>
  );
};