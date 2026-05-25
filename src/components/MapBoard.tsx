import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getNodeState,
  isDramaticNodeType,
  NODE_TYPE_LABELS,
  nodeTypeToCssClass,
  nodeTypeToIconPath,
  type MapNode,
  type NodeVisitState,
} from '../data/nodeMap'
import { getGymPortraitUrlForMapNode } from '../data/trainerPortraits'

type MapBoardProps = {
  mapNodes: MapNode[]
  nodeStates: Record<string, NodeVisitState>
  onNodeClick: (node: MapNode) => void
}

function MapNodeButton({
  node,
  state,
  onClick,
}: {
  node: MapNode
  state: NodeVisitState
  onClick: () => void
}) {
  const [iconFailed, setIconFailed] = useState(false)
  const gymPortrait = getGymPortraitUrlForMapNode(node)
  const iconSrc = gymPortrait ?? nodeTypeToIconPath(node.type)
  const disabled = state !== 'available'
  const typeClass = nodeTypeToCssClass(node.type)
  const dramatic = isDramaticNodeType(node.type)
  const useLegacy = iconFailed
  const isGymPortrait = Boolean(gymPortrait) && !iconFailed

  return (
    <button
      type="button"
      className={`map-node map-node--${typeClass} map-node--${state}${
        state === 'available' ? ' map-node--available' : ''
      }${useLegacy ? ' map-node--legacy' : ' map-node--icon'}${
        isGymPortrait ? ' map-node--gym-portrait' : ''
      }${dramatic ? ' map-node--dramatic' : ''}`}
      style={{ gridColumn: node.column + 1 }}
      disabled={disabled}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label={`${node.label} — ${NODE_TYPE_LABELS[node.type]} — ${state}`}
    >
      {useLegacy ? (
        <>
          <span className="map-node__type">{NODE_TYPE_LABELS[node.type]}</span>
          <span className="map-node__label">{node.label}</span>
        </>
      ) : (
        <>
          <span className="map-node__icon-wrap">
            <img
              className="map-node__icon"
              src={iconSrc}
              alt=""
              draggable={false}
              onError={() => setIconFailed(true)}
            />
            {state === 'completed' ? (
              <span className="map-node__completed-mark" aria-hidden="true">
                ✓
              </span>
            ) : null}
          </span>
          <span className="map-node__type">{NODE_TYPE_LABELS[node.type]}</span>
          <span className="map-node__label">{node.label}</span>
        </>
      )}
    </button>
  )
}

export function MapBoard({ mapNodes, nodeStates, onNodeClick }: MapBoardProps) {
  const viewportRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  })

  const maxLayer = Math.max(...mapNodes.map((n) => n.layer), 0)
  const layers = Array.from({ length: maxLayer + 1 }, (_, i) => maxLayer - i)

  const alignToStart = useCallback(() => {
    const viewport = viewportRef.current
    const canvas = canvasRef.current
    if (!viewport || !canvas) return

    const x = Math.round((viewport.clientWidth - canvas.offsetWidth) / 2)
    const y = Math.round(viewport.clientHeight - canvas.offsetHeight - 24)
    setPan({ x, y })
  }, [])

  useEffect(() => {
    alignToStart()
  }, [alignToStart, mapNodes.length, maxLayer])

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('.map-node')) return

    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    }
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) {
      return
    }

    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY

    setPan({
      x: dragRef.current.originX + dx,
      y: dragRef.current.originY + dy,
    })
  }

  const endCanvasDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) {
      return
    }

    dragRef.current.active = false
    setIsDragging(false)

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <section
      ref={viewportRef}
      className="map-board map-board--pan"
      aria-label="Run map"
    >
      <div
        ref={canvasRef}
        className={`map-board__canvas${isDragging ? ' map-board__canvas--dragging' : ''}`}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={endCanvasDrag}
        onPointerCancel={endCanvasDrag}
      >
        <div
          className="map-board__layers"
          style={{
            gridTemplateRows: `repeat(${maxLayer + 1}, minmax(6.5rem, auto))`,
          }}
        >
          {layers.map((layer) => (
            <div key={layer} className="map-board__layer">
              {mapNodes
                .filter((n) => n.layer === layer)
                .sort((a, b) => a.column - b.column)
                .map((node) => (
                  <MapNodeButton
                    key={node.id}
                    node={node}
                    state={getNodeState(nodeStates, node.id)}
                    onClick={() => onNodeClick(node)}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
