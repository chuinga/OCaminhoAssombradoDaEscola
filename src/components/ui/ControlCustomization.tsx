'use client';

import React, { useState } from 'react';
import { useSettingsStore, ControlMapping, KEY_DISPLAY_NAMES } from '../../store/settingsStore';
import { Keyboard, RotateCcw, Edit3, Check, X } from 'lucide-react';

interface ControlCustomizationProps {
  className?: string;
}

export const ControlCustomization: React.FC<ControlCustomizationProps> = ({
  className = ''
}) => {
  const { controls, setControlMapping, resetControlsToDefault } = useSettingsStore();
  const [editingAction, setEditingAction] = useState<keyof ControlMapping | null>(null);
  const [listeningForKey, setListeningForKey] = useState(false);
  const [tempKeys, setTempKeys] = useState<string[]>([]);

  const actionLabels: Record<keyof ControlMapping, string> = {
    moveLeft: 'Mover Esquerda',
    moveRight: 'Mover Direita',
    jump: 'Saltar',
    crouch: 'Agachar',
    attack: 'Atacar',
    pause: 'Pausar'
  };

  const handleEditAction = (action: keyof ControlMapping) => {
    setEditingAction(action);
    setTempKeys([...controls[action]]);
    setListeningForKey(false);
  };

  const handleKeyCapture = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const key = event.code;
    if (key && !tempKeys.includes(key)) {
      setTempKeys(prev => [...prev, key]);
    }
    setListeningForKey(false);
  };

  const startListening = () => {
    setListeningForKey(true);
    
    const handleKey = (event: KeyboardEvent) => {
      handleKeyCapture(event);
      document.removeEventListener('keydown', handleKey);
    };
    
    document.addEventListener('keydown', handleKey);
  };

  const removeKey = (keyToRemove: string) => {
    setTempKeys(prev => prev.filter(key => key !== keyToRemove));
  };

  const saveChanges = () => {
    if (editingAction && tempKeys.length > 0) {
      setControlMapping(editingAction, tempKeys);
    }
    setEditingAction(null);
    setTempKeys([]);
  };

  const cancelChanges = () => {
    setEditingAction(null);
    setTempKeys([]);
    setListeningForKey(false);
  };

  const formatKeyName = (key: string): string => {
    return KEY_DISPLAY_NAMES[key] || key;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Personalização de Controlos
        </h3>
        <button
          onClick={resetControlsToDefault}
          className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Restaurar
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(actionLabels).map(([action, label]) => {
          const actionKey = action as keyof ControlMapping;
          const isEditing = editingAction === actionKey;
          const currentKeys = isEditing ? tempKeys : controls[actionKey];

          return (
            <div key={action} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white font-medium">{label}</label>
                {!isEditing ? (
                  <button
                    onClick={() => handleEditAction(actionKey)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Editar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveChanges}
                      className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors"
                      disabled={tempKeys.length === 0}
                    >
                      <Check className="w-3 h-3" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelChanges}
                      className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {currentKeys.map((key, index) => (
                  <div
                    key={`${key}-${index}`}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-lg text-sm text-white"
                  >
                    <span>{formatKeyName(key)}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeKey(key)}
                        className="ml-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    onClick={startListening}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      listeningForKey
                        ? 'bg-yellow-600 text-white animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                    disabled={listeningForKey}
                  >
                    {listeningForKey ? 'Pressione uma tecla...' : '+ Adicionar Tecla'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Dicas:</h4>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• Pode atribuir múltiplas teclas à mesma ação</li>
          <li>• As alterações são guardadas automaticamente</li>
          <li>• Use "Restaurar" para voltar aos controlos padrão</li>
        </ul>
      </div>
    </div>
  );
};