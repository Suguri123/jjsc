import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Student, DecisionTreeNode } from '../types';
import { buildDecisionTree } from '../utils/decisionTree';
import { 
  GitFork, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  Move
} from 'lucide-react';

interface TreeVisualizerViewProps {
  students: Student[];
  onGoToGame: () => void;
}

export default function TreeVisualizerView({ students, onGoToGame }: TreeVisualizerViewProps) {
  const [maxDepth, setMaxDepth] = useState<number>(4);
  // Default zoom level tailored to depth 4
  const [zoomLevel, setZoomLevel] = useState<number>(45);

  // References for mouse drag-to-pan & auto fit
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // Build the tree dynamically
  const tree = useMemo(() => {
    return buildDecisionTree(students, 0, maxDepth);
  }, [students, maxDepth]);

  // When changing depth, set a recommended zoom level so tree fits cleanly without clipping
  const handleDepthChange = (newDepth: number) => {
    setMaxDepth(newDepth);
    if (newDepth === 2) setZoomLevel(100);
    else if (newDepth === 3) setZoomLevel(75);
    else if (newDepth === 4) setZoomLevel(45);
    else if (newDepth === 5) setZoomLevel(30);
  };

  // Zoom controls - allow down to 20% for deep trees (depth 4-5) without cutting off
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 20));
  const handleZoomReset = () => setZoomLevel(100);

  // Auto-fit function: calculate optimal zoom percentage so entire tree fits in container width
  const handleFitToScreen = () => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      // Get unscaled width of content
      const contentWidth = contentRef.current.scrollWidth;
      if (contentWidth > 0 && containerWidth > 0) {
        // Calculate fit ratio
        const currentZoom = zoomLevel / 100;
        const naturalWidth = contentWidth / (currentZoom || 1);
        const ratio = Math.floor((containerWidth / naturalWidth) * 100);
        // Clamp between 20% and 120%
        const fitted = Math.min(Math.max(ratio, 20), 120);
        setZoomLevel(fitted);
      }
    }
  };

  // Auto-center scroll on load or when depth changes
  useEffect(() => {
    if (containerRef.current) {
      const scrollTimer = setTimeout(() => {
        if (containerRef.current) {
          const scrollableWidth = containerRef.current.scrollWidth - containerRef.current.clientWidth;
          if (scrollableWidth > 0) {
            containerRef.current.scrollLeft = scrollableWidth / 2;
          }
        }
      }, 50);
      return () => clearTimeout(scrollTimer);
    }
  }, [maxDepth, zoomLevel]);

  // Mouse pan / drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    containerRef.current.scrollLeft = dragStart.scrollLeft - dx;
    containerRef.current.scrollTop = dragStart.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {/* Educational Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-3xl p-6 border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>3단계: 인공지능이 완성한 결정트리(Decision Tree) 탐구하기</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              우리 반 데이터로 만든 지능형 결정트리 지도
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              스무고개에서 컴퓨터가 던진 질문들은 우연이 아닙니다! 
              나무(Tree)가 가지를 뻗어나가듯, <strong>가장 많은 정보를 주는 질문부터 차례대로 질문 가지</strong>를 뻗어 친구들을 1명씩 찾아냅니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <span>트리 깊이:</span>
              <select
                value={maxDepth}
                onChange={(e) => handleDepthChange(Number(e.target.value))}
                className="bg-slate-100 rounded-lg px-2 py-1 font-bold text-indigo-600 focus:outline-none cursor-pointer"
                aria-label="트리 최대 깊이 조절"
              >
                <option value={2}>2단계 (간단히 - 100%)</option>
                <option value={3}>3단계 (적정 - 75%)</option>
                <option value={4}>4단계 (상세 - 45%)</option>
                <option value={5}>5단계 (전체 - 30%)</option>
              </select>
            </div>
            <button
              onClick={onGoToGame}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1"
            >
              <span>스무고개 직접 해보기</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* 4 Core Concepts Bar for 6th Graders */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-emerald-200/50 text-xs">
          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2.5 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
              1
            </div>
            <div>
              <strong className="text-slate-800 block font-black">뿌리 노드 (Root)</strong>
              <span className="text-[11px] text-slate-500">맨 처음 전체 데이터를 둘로 나누는 핵심 질문</span>
            </div>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2.5 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs shrink-0">
              2
            </div>
            <div>
              <strong className="text-slate-800 block font-black">가지 (Branch)</strong>
              <span className="text-[11px] text-slate-500">질문에 대한 [예] 또는 [아니오] 갈림길</span>
            </div>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2.5 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
              3
            </div>
            <div>
              <strong className="text-slate-800 block font-black">중간 노드 (Internal)</strong>
              <span className="text-[11px] text-slate-500">후보를 더 좁히기 위한 연속적인 질문</span>
            </div>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2.5 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">
              4
            </div>
            <div>
              <strong className="text-slate-800 block font-black">잎 노드 (Leaf)</strong>
              <span className="text-[11px] text-slate-500">더 이상 나눌 필요 없이 최종 친구를 찾은 결과</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Interactive Decision Tree Visualization */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-4">
        {/* Title & Zoom Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                인터랙티브 결정트리 시각화 구조도
              </h3>
              <p className="text-xs text-slate-400">
                마우스로 화면을 드래그하여 이동하거나 돋보기로 축소·확대해 트리 전체 구조를 살펴보세요.
              </p>
            </div>
          </div>

          {/* Zoom & Screen Fit Tool Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick preset chips */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/80 text-[11px] font-bold">
              <button
                onClick={() => setZoomLevel(30)}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  zoomLevel === 30 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
                title="5단계 한눈에 보기"
              >
                30% (5단계)
              </button>
              <button
                onClick={() => setZoomLevel(45)}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  zoomLevel === 45 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
                title="4단계 한눈에 보기"
              >
                45% (4단계)
              </button>
              <button
                onClick={() => setZoomLevel(75)}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  zoomLevel === 75 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
                title="3단계 보기"
              >
                75%
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${
                  zoomLevel === 100 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
                title="100% 원본"
              >
                100%
              </button>
            </div>

            {/* Fine-grain Zoom and Fit */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="더 축소하기 (최소 20%)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-indigo-700 px-1.5 min-w-[46px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="확대하기 (최대 160%)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 mx-0.5" />
              <button
                onClick={handleFitToScreen}
                className="p-1.5 rounded-xl hover:bg-white text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold px-2"
                title="화면 너비에 맞춰 자동 축소"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">화면 맞춤</span>
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="100% 원래 크기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tree Interactive Display Window */}
        <div className="relative">
          {/* Helpful drag tip badge */}
          <div className="absolute top-3 left-4 z-20 pointer-events-none flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-slate-500 border border-slate-200 shadow-2xs">
            <Move className="w-3 h-3 text-indigo-500" />
            <span>마우스 드래그로 화면 이동 가능</span>
          </div>

          {/* Tree Scroll/Pan Container */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full overflow-auto py-12 px-6 bg-slate-50/70 rounded-2xl border border-slate-200 min-h-[520px] max-h-[760px] select-none transition-colors ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* 
              Inner tree layout:
              Uses zoom property (with fallback) and mx-auto without flexbox justify-center overflow bugs.
              This guarantees that when the tree is very wide (at depth 4 or 5), the left side NEVER gets clipped!
            */}
            <div 
              ref={contentRef}
              style={{ 
                zoom: `${zoomLevel}%`,
                minWidth: 'fit-content',
                margin: '0 auto',
                display: 'table'
              }}
              className="p-4"
            >
              <TreeNodeView node={tree} isRoot={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Recursive Tree Node Component
 */
function TreeNodeView({
  node,
  isRoot = false,
}: {
  node: DecisionTreeNode;
  isRoot?: boolean;
}) {
  if (node.type === 'leaf') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-[160px] sm:w-[180px] px-3.5 py-3 rounded-2xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-50 to-emerald-100/70 text-emerald-950 text-center shadow-xs">
          <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-0.5">
            잎 노드 (Leaf)
          </div>
          <div className="font-black text-sm text-slate-900 truncate">
            {node.leafStudent ? `👤 ${node.leafStudent.name || node.leafStudent.nickname}` : `${node.studentCount}명`}
          </div>
          {node.leafStudent && (
            <div className="text-[10px] text-emerald-900 font-bold mt-1 flex flex-col items-center gap-0.5">
              {node.leafStudent.nickname && node.leafStudent.nickname !== node.leafStudent.name && (
                <span className="text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded text-[10px] font-extrabold max-w-[150px] truncate">
                  별명: {node.leafStudent.nickname}
                </span>
              )}
              <span className="text-[10px] text-emerald-700 font-semibold">
                {node.leafStudent.gender} · {node.leafStudent.glasses}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Current Question Node */}
      <div
        className={`w-[190px] sm:w-[210px] px-3.5 py-3 rounded-2xl border-2 text-center shadow-xs transition-all ${
          isRoot
            ? 'bg-indigo-600 text-white border-indigo-800 shadow-md ring-4 ring-indigo-100'
            : 'bg-white text-slate-800 border-indigo-200 hover:border-indigo-400'
        }`}
      >
        <div
          className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
            isRoot ? 'text-amber-300' : 'text-indigo-600'
          }`}
        >
          {isRoot ? '🌱 뿌리 노드 (Root)' : `질문 (깊이 ${node.depth})`}
        </div>
        <div className="font-black text-xs sm:text-sm leading-snug break-keep">
          "{node.question}"
        </div>
        <div
          className={`text-[10px] font-bold mt-1 ${
            isRoot ? 'text-indigo-100' : 'text-slate-400'
          }`}
        >
          도달 인원: {node.studentCount}명
        </div>
      </div>

      {/* Branches to Children */}
      {(node.yesChild || node.noChild) && (
        <div className="w-full flex flex-col items-center mt-1.5">
          {/* Vertical stem from parent question */}
          <div className="w-0.5 h-4 bg-slate-300"></div>

          {/* Horizontal split bar */}
          <div className="w-full flex items-start justify-center">
            {/* YES Branch (Left) */}
            {node.yesChild && (
              <div className="flex-1 flex flex-col items-center px-2 sm:px-3">
                <div className="w-full border-t-2 border-emerald-500 relative flex justify-center">
                  <span className="absolute -top-3 px-2 py-0.5 bg-emerald-100 text-emerald-900 font-black text-[10px] rounded-full border border-emerald-300 shadow-2xs whitespace-nowrap z-10">
                    O 예
                  </span>
                </div>
                <div className="w-0.5 h-4 bg-emerald-500"></div>
                <TreeNodeView node={node.yesChild} />
              </div>
            )}

            {/* NO Branch (Right) */}
            {node.noChild && (
              <div className="flex-1 flex flex-col items-center px-2 sm:px-3">
                <div className="w-full border-t-2 border-rose-500 relative flex justify-center">
                  <span className="absolute -top-3 px-2 py-0.5 bg-rose-100 text-rose-900 font-black text-[10px] rounded-full border border-rose-300 shadow-2xs whitespace-nowrap z-10">
                    X 아니오
                  </span>
                </div>
                <div className="w-0.5 h-4 bg-rose-500"></div>
                <TreeNodeView node={node.noChild} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
