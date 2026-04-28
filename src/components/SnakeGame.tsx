import React, { useState, useEffect, useCallback, useRef } from 'react';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIR: Point = { x: 0, y: -1 };
const SPEED = 100; // ms per tick

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const isOnSnake = snake.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y
    );
    if (!isOnSnake) break;
  }
  return newFood;
};

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  isPlaying: boolean;
}

export function SnakeGame({ onScoreChange, isPlaying }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIR);
  const directionRef = useRef(INITIAL_DIR);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(false);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIR);
    directionRef.current = INITIAL_DIR;
    setFood(generateFood(INITIAL_SNAKE));
    setIsGameOver(false);
    setScore(0);
    onScoreChange(0);
    setGlitchTrigger(true);
    setTimeout(() => setGlitchTrigger(false), 200);
  }, [onScoreChange]);

  useEffect(() => {
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isPlaying || isGameOver) {
        if (e.key === ' ' && isGameOver) {
          resetGame();
        }
        return;
      }

      const { x, y } = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, resetGame]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    directionRef.current = direction;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (
          prevSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood(newSnake));
          
          // Random tiny visual glitch on eat
          if (Math.random() > 0.5) {
             setGlitchTrigger(true);
             setTimeout(() => setGlitchTrigger(false), 50);
          }
        } else {
          newSnake.pop(); 
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, SPEED);
    return () => clearInterval(intervalId);
  }, [direction, food, isPlaying, isGameOver, score, onScoreChange]);

  return (
    <div className={`relative w-full max-w-[500px] aspect-square bg-black border-4 border-[#0ff] overflow-hidden ${glitchTrigger ? 'screen-tear mix-blend-difference' : ''}`}>
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(#f0f 1px, transparent 1px), linear-gradient(90deg, #f0f 1px, transparent 1px)`,
          backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`,
        }}
      />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute inset-0 crt pointer-events-none" />

      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center font-mono">
            <p className="text-xl mb-4 text-[#f0f] uppercase glitch-text" data-text="SYSTEM.AWAIT.AUDIO">SYSTEM.AWAIT.AUDIO</p>
            <p className="text-xs text-[#0ff] opacity-70">INPUT: [W A S D]</p>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center font-mono">
            <h2 className="text-3xl text-[#f0f] mb-4 bg-black px-2 py-1 glitch-text" data-text="FATAL_ERROR">FATAL_ERROR</h2>
            <p className="text-sm text-[#0ff] mb-6 border border-[#0ff] p-2 bg-black/50">MEM_DUMP: {score.toString().padStart(4, '0')}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-transparent border-2 border-[#f0f] text-[#f0f] hover:bg-[#f0f] hover:text-black transition-colors uppercase text-xs tracking-widest cursor-pointer"
            >
              [REBOOT:SPACE]
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full h-full z-10">
        {/* Food */}
        <div
          className="absolute bg-[#f0f] shadow-[0_0_8px_#f0f]"
          style={{
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' // Diamond shape
          }}
        />

        {/* Snake Segments */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`absolute border border-black ${
                isHead 
                  ? 'bg-[#0ff] z-10 shadow-[0_0_10px_#0ff]' 
                  : 'bg-[#f0f] opacity-80'
              }`}
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                transform: isHead ? 'scale(1.1)' : 'scale(0.9)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
