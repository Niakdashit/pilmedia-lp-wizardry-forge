// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics, Text, Ticker } from 'pixi.js';

interface InstantWinConfig {
  mode: 'instant_winner';
  winProbability: number;
  maxWinners?: number;
  winnersCount?: number;
}

interface PixiJackpotProps {
  config?: InstantWinConfig;
  onStart?: () => void;
  onFinish?: (result: 'win' | 'lose') => void;
  disabled?: boolean;
  buttonLabel?: string;
  buttonColor?: string;
  borderStyle?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const SYMBOLS = ['🍒', '🍋', '🍊', '🍀', '7', '💎', '⭐'];

const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);

const createSymbol = (char: string, size: number) => {
  const t = new Text({
    text: char,
    style: {
      fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Inter, Arial',
      fontSize: size,
      fontWeight: '700',
      fill: 0x222222,
      align: 'center'
    }
  });
  // Center baseline adjustment
  t.anchor.set(0.5, 0.5);
  return t;
};

const PixiJackpot: React.FC<PixiJackpotProps> = ({
  config,
  onStart,
  onFinish,
  disabled = false,
  buttonLabel = 'Lancer le Jackpot',
  buttonColor = '#ec4899',
  borderStyle,
  previewDevice = 'desktop'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const stageRef = useRef<Container | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<'win' | 'lose' | null>(null);

  // Responsive sizing
  const getCanvasSize = () => {
    const parent = mountRef.current;
    const parentW = parent?.clientWidth || 480;
    // Target aspect ~ 16:9 area for the machine
    const width = Math.min(560, Math.max(320, parentW));
    const height = Math.floor(width * 0.65);
    return { width, height };
  };

  useEffect(() => {
    if (!mountRef.current) return;

    let destroyed = false;

    const setup = async () => {
      const { width, height } = getCanvasSize();
      const app = new Application();
      await (app as any).init({
        backgroundAlpha: 0,
        antialias: true,
        width,
        height
      });
      if (destroyed) return;
      appRef.current = app;
      stageRef.current = app.stage;
      mountRef.current!.appendChild(app.canvas);

    // Build machine layout
    const padding = 16;
    const borderRadius = 16;

    // Outer frame
    const frame = new Graphics();
    frame.roundRect(0, 0, width, height, borderRadius);
    frame.fill(0x1f2937); // gray-800-like

    // Fancy border effect (simple glow/gradient imitation)
    const border = new Graphics();
    border.roundRect(0, 0, width, height, borderRadius);
    border.stroke({ width: 8, color: 0xffffff, alpha: 0.12 });

    // Inner window for reels
    const windowW = width - padding * 2;
    const windowH = Math.floor(height * 0.48);
    const windowX = padding;
    const windowY = padding * 1.25;

    const windowG = new Graphics();
    windowG.roundRect(windowX, windowY, windowW, windowH, 12);
    windowG.fill(0xf3f4f6); // gray-100
    windowG.stroke({ width: 2, color: 0xffffff, alpha: 0.6 });

    // Reel containers
    const reels = [] as Container[];
    const reelCount = 3;
    const gap = Math.floor(windowW * 0.04);
    const reelWidth = Math.floor((windowW - gap * (reelCount - 1)) / reelCount);
    const symbolSize = Math.floor(reelWidth * 0.72);
    const symbolSpacing = Math.floor(symbolSize * 1.12);
    const visibleRows = 1; // focus a single row window (center)

    for (let i = 0; i < reelCount; i++) {
      const reel = new Container();
      const x = windowX + i * (reelWidth + gap) + reelWidth / 2; // center of reel
      const y = windowY + windowH / 2; // center line
      reel.position.set(x, y);

      // Build a vertical list of symbols cycling
      const list = new Container();
      reel.addChild(list);

      // Add enough symbols to spin convincingly (N loops + set)
      const cycles = 24; // total symbols in the column
      for (let j = 0; j < cycles; j++) {
        const sIdx = j % SYMBOLS.length;
        const sym = createSymbol(SYMBOLS[sIdx], symbolSize);
        sym.y = (j - cycles / 2) * symbolSpacing; // centered list
        list.addChild(sym);
      }

      (reel as any).list = list;
      (reel as any).pos = 0; // scrolling position in pixels
      (reel as any).symbolSpacing = symbolSpacing;
      (reel as any).cycles = cycles;
      reels.push(reel);
    }

    // Add all to stage
    stageRef.current!.addChild(frame);
    stageRef.current!.addChild(border);
    stageRef.current!.addChild(windowG);
    reels.forEach(r => stageRef.current!.addChild(r));

      // Resize observer
      const ro = new ResizeObserver(() => {
        const { width: w, height: h } = getCanvasSize();
        try {
          (app.renderer as any).resize(w, h);
        } catch {}
      });
      if (mountRef.current) ro.observe(mountRef.current);

      (app as any).__ro = ro;
    };

    setup();

    return () => {
      destroyed = true;
      const app = appRef.current as any;
      if (app && app.__ro) {
        try { app.__ro.disconnect(); } catch {}
      }
      if (appRef.current) {
        try { appRef.current.destroy(true, { children: true } as any); } catch {}
      }
      appRef.current = null;
      stageRef.current = null;
    };
  }, []);

  const spin = async () => {
    if (isSpinning || disabled) return;
    onStart?.();
    setIsSpinning(true);
    setLastResult(null);

    const shouldWin = (() => {
      if (config?.mode !== 'instant_winner') return false;
      const max = config?.maxWinners ?? Infinity;
      const count = config?.winnersCount ?? 0;
      if (count >= max) return false;
      const p = Math.max(0, Math.min(1, config?.winProbability ?? 0.1));
      return Math.random() < p;
    })();

    const reels = stageRef.current?.children.filter(c => (c as any).list) as Container[];
    if (!reels?.length) {
      setIsSpinning(false);
      onFinish?.('lose');
      return;
    }

    // Pick a target symbol index
    const targetIndex = Math.floor(Math.random() * SYMBOLS.length);
    const targets = shouldWin
      ? [targetIndex, targetIndex, targetIndex]
      : [
          targetIndex,
          (targetIndex + 2 + Math.floor(Math.random() * 3)) % SYMBOLS.length,
          (targetIndex + 4 + Math.floor(Math.random() * 3)) % SYMBOLS.length,
        ];

    // Animate each reel with a small offset delay
    const ticker = new Ticker();

    const spinReel = (reel: Container, delayMs: number, loops: number, targetSymbol: number) => new Promise<void>((resolve) => {
      const list = (reel as any).list as Container;
      const spacing = (reel as any).symbolSpacing as number;
      const cycles = (reel as any).cycles as number;

      const start = performance.now() + delayMs;
      const duration = 1400 + loops * 300; // ms

      const totalDistance = loops * SYMBOLS.length * spacing + targetSymbol * spacing;
      const startY = list.y;

      const update = (time: number) => {
        if (time < start) return; // wait delay
        const t = Math.min(1, (time - start) / duration);
        const eased = EASE_OUT_CUBIC(t);
        list.y = startY - totalDistance * eased;

        // wrap-around to keep numbers small
        if (list.y < -cycles * spacing) list.y += cycles * spacing;

        if (t >= 1) {
          ticker.remove(update);
          resolve();
        }
      };
      ticker.add(update);
    });

    ticker.start();

    await Promise.all([
      spinReel(reels[0], 0, 4, targets[0]),
      spinReel(reels[1], 180, 5, targets[1]),
      spinReel(reels[2], 360, 6, targets[2])
    ]);

    ticker.stop();

    const result = (targets[0] === targets[1] && targets[1] === targets[2]) ? 'win' : 'lose';
    setLastResult(result);
    setIsSpinning(false);
    onFinish?.(result);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        ref={mountRef}
        style={{
          width: '100%',
          maxWidth: 560,
          aspectRatio: '16 / 10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}
      />

      <div className="flex flex-col items-center">
        <button
          onClick={spin}
          disabled={disabled || isSpinning}
          className="px-5 py-2 rounded-md text-white font-medium shadow"
          style={{ background: disabled || isSpinning ? '#a3a3a3' : (buttonColor || '#ec4899') }}
        >
          {isSpinning ? 'En cours...' : (buttonLabel || 'Lancer le Jackpot')}
        </button>
        {lastResult && (
          <div className="mt-2 text-sm font-medium" style={{ color: lastResult === 'win' ? '#16a34a' : '#dc2626' }}>
            {lastResult === 'win' ? 'Gagné !' : 'Perdu'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PixiJackpot;
