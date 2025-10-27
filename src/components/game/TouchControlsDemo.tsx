'use client';

import { useState } from 'react';
import { TouchControls } from './TouchControls';

export function TouchControlsDemo() {
  const [activeControls, setActiveControls] = useState<string[]>([]);
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);

  const handleControlPress = (control: string) => (pressed: boolean) => {
    if (pressed) {
      setActiveControls(prev => [...prev, control]);
      setGestureHistory(prev => [...prev.slice(-4), `${control} pressed`]);
    } else {
      setActiveControls(prev => prev.filter(c => c !== control));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Demo Info */}
      <div className="absolute top-4 left-4 right-4 z-30">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white">
          <h2 className="text-lg font-bold mb-2">Enhanced Touch Controls Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Features:</h3>
              <ul className="space-y-1 text-xs">
                <li>• Haptic feedback on touch</li>
                <li>• Gesture controls (swipe)</li>
                <li>• Visual press feedback</li>
                <li>• Optimized positioning</li>
                <li>• Safe area support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Active Controls:</h3>
              <div className="text-xs">
                {activeControls.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {activeControls.map((control, index) => (
                      <span key={`${control}-${index}`} className="bg-green-600 px-2 py-1 rounded">
                        {control}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Gesture History */}
          {gestureHistory.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <h3 className="font-semibold mb-1 text-xs">Recent Actions:</h3>
              <div className="text-xs space-y-1">
                {gestureHistory.slice(-3).map((action, index) => (
                  <div key={index} className="text-gray-300">
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game-like background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold mb-2">Touch Controls Test</h1>
          <p className="text-sm">Try the touch controls or swipe gestures</p>
          <p className="text-xs mt-2">On mobile: Feel the haptic feedback!</p>
        </div>
      </div>

      {/* Enhanced Touch Controls */}
      <TouchControls
        onMoveLeft={handleControlPress('moveLeft')}
        onMoveRight={handleControlPress('moveRight')}
        onJump={handleControlPress('jump')}
        onCrouch={handleControlPress('crouch')}
        onAttack={handleControlPress('attack')}
      />
    </div>
  );
}