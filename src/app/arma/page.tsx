'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, Weapon } from '@/store/gameStore';

interface WeaponInfo {
  id: Weapon;
  name: string;
  emoji: string;
  description: string;
  characteristics: string[];
  stats: {
    range?: string;
    cooldown: string;
    special?: string;
  };
}

const weapons: WeaponInfo[] = [
  {
    id: 'katana',
    name: 'Katana',
    emoji: '⚔️',
    description: 'Uma espada tradicional japonesa afiada e rápida',
    characteristics: [
      'Ataque corpo a corpo',
      'Velocidade alta',
      'Alcance médio'
    ],
    stats: {
      range: '40px',
      cooldown: '300ms'
    }
  },
  {
    id: 'laser',
    name: 'Pistola de Laser',
    emoji: '🔫',
    description: 'Arma futurística que dispara projéteis de energia',
    characteristics: [
      'Ataque à distância',
      'Projéteis rápidos',
      'Cadência alta'
    ],
    stats: {
      cooldown: '200ms',
      special: 'Velocidade: 500px/s'
    }
  },
  {
    id: 'baseball',
    name: 'Taco de Basebol',
    emoji: '⚾',
    description: 'Taco resistente que empurra os inimigos para longe',
    characteristics: [
      'Ataque corpo a corpo',
      'Efeito knockback',
      'Alcance maior'
    ],
    stats: {
      range: '55px',
      cooldown: '450ms',
      special: 'Knockback'
    }
  },
  {
    id: 'bazooka',
    name: 'Bazuca',
    emoji: '🚀',
    description: 'Lança-foguetes com dano em área mas munição limitada',
    characteristics: [
      'Dano em área',
      'Muito poderosa',
      'Munição limitada'
    ],
    stats: {
      cooldown: '900ms',
      special: '6 munições'
    }
  }
];

export default function ArmaPage() {
  const router = useRouter();
  const { firstName, lastName, character, weapon, setWeapon } = useGameStore();

  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(weapon);

  // Validate that user has completed previous steps before accessing this page
  useEffect(() => {
    if (!firstName || !lastName) {
      router.push('/nome');
      return;
    }
    if (!character) {
      router.push('/personagem');
      return;
    }
  }, [firstName, lastName, character, router]);

  const handleWeaponSelect = (weaponType: Weapon) => {
    setSelectedWeapon(weaponType);
  };

  const handleContinue = () => {
    if (selectedWeapon) {
      // Save weapon choice to Zustand state
      setWeapon(selectedWeapon);

      // Navigate to difficulty selection page
      router.push('/dificuldade');
    }
  };

  // Don't render if validation fails
  if (!firstName || !lastName || !character) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Escolha a sua Arma
          </h1>
          <p className="text-gray-300">
            Selecione a arma que deseja usar na sua jornada
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {weapons.map((weaponInfo) => (
            <div
              key={weaponInfo.id}
              onClick={() => handleWeaponSelect(weaponInfo.id)}
              className={`cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 hover:scale-105 ${selectedWeapon === weaponInfo.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 bg-white/10 hover:border-purple-400'
                }`}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                  {weaponInfo.emoji}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {weaponInfo.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {weaponInfo.description}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">
                    Características:
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {weaponInfo.characteristics.map((char, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">
                    Estatísticas:
                  </h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    {weaponInfo.stats.range && (
                      <div className="flex justify-between">
                        <span>Alcance:</span>
                        <span className="text-white">{weaponInfo.stats.range}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Cadência:</span>
                      <span className="text-white">{weaponInfo.stats.cooldown}</span>
                    </div>
                    {weaponInfo.stats.special && (
                      <div className="flex justify-between">
                        <span>Especial:</span>
                        <span className="text-yellow-400">{weaponInfo.stats.special}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleContinue}
            disabled={!selectedWeapon}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent ${selectedWeapon
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
          >
            {selectedWeapon ? 'Continuar' : 'Selecione uma arma'}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push('/personagem')}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-gray-400">
        <p>© 2025 - O Caminho Assombrado da Escola - Feito com ❤️ pela Sofia para o Halloween</p>
      </footer>
    </div>
  );
}