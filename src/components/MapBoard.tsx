import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getMapNodeDifficultyHint,
  getMapNodeSizeTier,
  getNodeState,
  isDangerousMapNodeType,
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
  /** Pan map toward this node (e.g. after Council unlock). */
  focusNodeId?: string | null
}

function MapNodeButton({
  node,
  state,
  isFrontier,
  onClick,
}: {
  node: MapNode
  state: NodeVisitState
  isFrontier: boolean
  onClick: () => void
}) {
  const [iconFailed, setIconFailed] = useState(false)
  const gymPortrait = getGymPortraitUrlForMapNode(node)
  const iconSrc = gymPortrait ?? nodeTypeToIconPath(node.type)
  const disabled = state !== 'available'
  const typeClass = nodeTypeToCssClass(node.type)
  const dramatic = isDramaticNodeType(node.type)
  const sizeTier = getMapNodeSizeTier(node.type)
  const dangerous = isDangerousMapNodeType(node.type)
  const difficultyHint = getMapNodeDifficultyHint(node.type)
  const useLegacy = iconFailed
  const isGymPortrait = Boolean(gymPortrait) && !iconFailed

  return (
    <button
      type="button"
      className={`map-node map-node--${typeClass} map-node--${state} map-node--tier-${sizeTier}${
        state === 'available' ? ' map-node--available' : ''
      }${isFrontier ? ' map-node--frontier' : ''}${dangerous ? ' map-node--dangerous' : ''}${
        useLegacy ? ' map-node--legacy' : ' map-node--icon'
      }${isGymPortrait ? ' map-node--gym-portrait' : ''}${
        dramatic ? ' map-node--dramatic' : ''
      }${node.type === 'monolithCouncil' ? ' map-node--council-final' : ''}`}
      style={{ gridColumn: node.column + 1 }}
      disabled={disabled}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label={`${node.label} — ${NODE_TYPE_LABELS[node.type]} — ${state}`}
      title={node.mapTooltip ?? undefined}
    >
      {useLegacy ? (
        <>
          <span className="map-node__type">{NODE_TYPE_LABELS[node.type]}</span>
          <span className="map-node__label">{node.label}</span>
        </>
      ) : (
        <>
          <span className="map-node__icon-ring" aria-hidden="true">
            <span className="map-node__icon-wrap">
              <img
                className="map-node__icon map-node__icon--high-res"
                src={iconSrc}
                alt=""
                draggable={false}
                onError={() => setIconFailed(true)}
              />
              {state === 'completed' ? (
                <span className="map-node__completed-mark" aria-hidden="true">
                  ✓
                </span>
              ) : state === 'locked' ? (
                <span className="map-node__lock-mark" aria-hidden="true">
                  🔒
                </span>
              ) : null}
            </span>
          </span>
          <span className="map-node__meta">
            <span className="map-node__type">{NODE_TYPE_LABELS[node.type]}</span>
            {difficultyHint ? (
              <span className="map-node__difficulty">{difficultyHint}</span>
            ) : null}
          </span>
          <span className="map-node__label">{node.label}</span>
          {node.mapSubtitle ? (
            <span className="map-node__subtitle">{node.mapSubtitle}</span>
          ) : null}
        </>
      )}
    </button>
  )
}

export function MapBoard({ mapNodes, nodeStates, onNodeClick, focusNodeId }: MapBoardProps) {
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

  const frontierLayer = (() => {
    const available = mapNodes.filter(
      (n) => getNodeState(nodeStates, n.id) === 'available',
    )
    if (available.length === 0) return maxLayer
    return Math.min(...available.map((n) => n.layer))
  })()

  const alignToRoute = useCallback(() => {
    const viewport = viewportRef.current
    const canvas = canvasRef.current
    if (!viewport || !canvas) return

    const focusRow = canvas.querySelector<HTMLElement>(
      `[data-map-layer="${frontierLayer}"]`,
    )
    const x = Math.round((viewport.clientWidth - canvas.offsetWidth) / 2)

    let y: number
    if (focusRow) {
      const rowTop = focusRow.offsetTop
      const rowHeight = focusRow.offsetHeight
      const targetY = viewport.clientHeight * 0.42 - rowTop - rowHeight / 2
      y = Math.round(
        Math.min(
          48,
          Math.max(
            viewport.clientHeight - canvas.offsetHeight - 16,
            targetY,
          ),
        ),
      )
    } else {
      y = Math.round((viewport.clientHeight - canvas.offsetHeight) * 0.35)
    }

    setPan({ x, y })
  }, [frontierLayer, maxLayer])

  const centerOnNode = useCallback(
    (nodeId: string) => {
      const viewport = viewportRef.current
      const canvas = canvasRef.current
      const node = mapNodes.find((n) => n.id === nodeId)
      if (!viewport || !canvas || !node) return

      const focusRow = canvas.querySelector<HTMLElement>(
        `[data-map-layer="${node.layer}"]`,
      )
      const x = Math.round((viewport.clientWidth - canvas.offsetWidth) / 2)
      let y: number
      if (focusRow) {
        const rowTop = focusRow.offsetTop
        const rowHeight = focusRow.offsetHeight
        const targetY = viewport.clientHeight * 0.28 - rowTop - rowHeight / 2
        y = Math.round(
          Math.min(
            48,
            Math.max(
              viewport.clientHeight - canvas.offsetHeight - 16,
              targetY,
            ),
          ),
        )
      } else {
        y = Math.round((viewport.clientHeight - canvas.offsetHeight) * 0.2)
      }
      setPan({ x, y })
    },
    [mapNodes],
  )

  useEffect(() => {
    alignToRoute()
  }, [alignToRoute, mapNodes.length, maxLayer, frontierLayer])

  useEffect(() => {
    if (!focusNodeId) return
    centerOnNode(focusNodeId)
  }, [focusNodeId, centerOnNode])

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
      <div className="map-board__toolbar">
        <button
          type="button"
          className="btn btn--small map-board__reset-view"
          onClick={alignToRoute}
        >
          Reset view
        </button>
        <span className="map-board__pan-hint">Drag map · Scroll if needed</span>
      </div>
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
            gridTemplateRows: `repeat(${maxLayer + 1}, minmax(7.5rem, auto))`,
          }}
        >
          {layers.map((layer) => (
            <div
              key={layer}
              className="map-board__layer"
              data-map-layer={layer}
            >
              {mapNodes
                .filter((n) => n.layer === layer)
                .sort((a, b) => a.column - b.column)
                .map((node) => (
                  <MapNodeButton
                    key={node.id}
                    node={node}
                    state={getNodeState(nodeStates, node.id)}
                    isFrontier={
                      layer === frontierLayer &&
                      getNodeState(nodeStates, node.id) === 'available'
                    }
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
