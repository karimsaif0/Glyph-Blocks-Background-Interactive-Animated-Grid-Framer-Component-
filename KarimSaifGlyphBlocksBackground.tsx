
/**
 * Made with 💛 by Karim Saif
 * @framerIntrinsicWidth 1000
 * @framerIntrinsicHeight 650
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

"use client"

import * as React from "react"
import {
    addPropertyControls,
    ControlType,
    useIsStaticRenderer,
} from "framer"

type Preset =
    | "acid"
    | "matrix"
    | "cyan"
    | "amber"
    | "mono"
    | "custom"

interface Props {
    preset: Preset
    color: string
    backgroundColor: string
    size: number
    blocks: number
    speed: number
    paused: boolean
    glyphDensity: number
    blockScale: number
    strokeWeight: number
    opacity: number
    cursorEnabled: boolean
    cursorRadius: number
    cursorStrength: number
    style?: React.CSSProperties
}

type Block = {
    x: number
    y: number
    w: number
    h: number
}

type Glyph = {
    dx: number
    dy: number
    vx: number
    vy: number
}

type Grid = {
    width: number
    height: number
    cell: number
    columns: number
    rows: number
}

type GlyphShape = {
    kind: number
    roll: number
}

const PRESETS: Record<
    Exclude<Preset, "custom">,
    { color: string; background: string }
> = {
    acid: {
        color: "#C6FF00",
        background: "#000000",
    },
    matrix: {
        color: "#00FF88",
        background: "#030D08",
    },
    cyan: {
        color: "#00E5FF",
        background: "#020A10",
    },
    amber: {
        color: "#FFB800",
        background: "#100900",
    },
    mono: {
        color: "#FFFFFF",
        background: "#080808",
    },
}

const clamp = (
    value: number,
    minimum: number,
    maximum: number
) => Math.min(maximum, Math.max(minimum, value))

function hash(x: number, y: number): number {
    const value =
        Math.sin(x * 127.1 + y * 311.7) *
        43758.5453123

    return value - Math.floor(value)
}

function noise(x: number, y: number): number {
    const xi = Math.floor(x)
    const yi = Math.floor(y)

    const xf = x - xi
    const yf = y - yi

    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)

    const a = hash(xi, yi)
    const b = hash(xi + 1, yi)
    const c = hash(xi, yi + 1)
    const d = hash(xi + 1, yi + 1)

    return (
        a +
        (b - a) * u +
        (c - a) * v +
        (a - b - c + d) * u * v
    )
}

function createGrid(
    width: number,
    height: number,
    requestedCell: number
): Grid {
    const maxCells = 6500

    let cell = Math.max(1, requestedCell)

    let columns = Math.max(
        1,
        Math.ceil(width / cell)
    )

    let rows = Math.max(
        1,
        Math.ceil(height / cell)
    )

    if (columns * rows > maxCells) {
        cell = Math.max(
            cell,
            Math.sqrt(
                (width * height) / maxCells
            )
        )

        columns = Math.max(
            1,
            Math.ceil(width / cell)
        )

        rows = Math.max(
            1,
            Math.ceil(height / cell)
        )

        while (
            columns * rows > maxCells
        ) {
            cell *= 1.01

            columns = Math.max(
                1,
                Math.ceil(width / cell)
            )

            rows = Math.max(
                1,
                Math.ceil(height / cell)
            )
        }
    }

    return {
        width,
        height,
        cell,
        columns,
        rows,
    }
}

function makeBlock(
    seed: number,
    columns: number,
    rows: number,
    scale: number
): Block {
    const minW = Math.max(
        1,
        Math.round(3 * scale)
    )

    const minH = Math.max(
        1,
        Math.round(2 * scale)
    )

    const maxW = Math.max(
        minW,
        Math.round(
            columns * 0.2 * scale
        )
    )

    const maxH = Math.max(
        minH,
        Math.round(
            rows * 0.3 * scale
        )
    )

    const w = Math.min(
        columns,
        minW +
            Math.floor(
                hash(seed, 1) *
                    (maxW - minW + 1)
            )
    )

    const h = Math.min(
        rows,
        minH +
            Math.floor(
                hash(seed, 2) *
                    (maxH - minH + 1)
            )
    )

    return {
        x: Math.floor(
            hash(seed, 3) *
                Math.max(
                    1,
                    columns - w + 1
                )
        ),
        y: Math.floor(
            hash(seed, 4) *
                Math.max(
                    1,
                    rows - h + 1
                )
        ),
        w,
        h,
    }
}

function getGlyphShape(
    i: number,
    j: number,
    step: number,
    density: number
): GlyphShape {
    const drift = step * 0.035

    const zone =
        noise(
            i * 0.09 + drift,
            j * 0.09 - drift * 0.4
        ) *
            0.75 +
        noise(
            i * 0.23 - drift,
            j * 0.23 + 5
        ) *
            0.25

    const seed = hash(i, j)

    const threshold = clamp(
        0.52 / density,
        0.12,
        0.9
    )

    if (zone < threshold) {
        return {
            kind: seed < 0.08 ? 1 : 0,
            roll: seed,
        }
    }

    if (zone < threshold + 0.04) {
        return {
            kind: 1,
            roll: seed,
        }
    }

    const roll = hash(
        seed * 97,
        Math.floor(
            step / 6 + seed * 6
        )
    )

    if (zone < threshold + 0.1) {
        return {
            kind: roll < 0.5 ? 2 : 3,
            roll,
        }
    }

    if (roll < 0.4) {
        return {
            kind: 4,
            roll,
        }
    }

    if (roll < 0.62) {
        return {
            kind: 5,
            roll,
        }
    }

    if (roll < 0.82) {
        return {
            kind: 6,
            roll,
        }
    }

    return {
        kind: 7,
        roll,
    }
}

function drawGlyph(
    ctx: CanvasRenderingContext2D,
    kind: number,
    x: number,
    y: number,
    cell: number,
    weight: number
) {
    if (kind === 0) return

    if (kind === 1) {
        const d = cell * 0.12

        ctx.fillRect(
            x - d / 2,
            y - d / 2,
            d,
            d
        )

        return
    }

    const a = cell * 0.22

    ctx.lineWidth =
        Math.max(1, cell * 0.09) *
        weight

    if (kind === 2) {
        ctx.beginPath()

        ctx.moveTo(x - a, y)
        ctx.lineTo(x + a, y)

        ctx.moveTo(x, y - a)
        ctx.lineTo(x, y + a)

        ctx.stroke()
        return
    }

    if (kind === 3) {
        ctx.beginPath()

        ctx.moveTo(x - a, y - a)
        ctx.lineTo(x + a, y + a)

        ctx.moveTo(x + a, y - a)
        ctx.lineTo(x - a, y + a)

        ctx.stroke()
        return
    }

    if (kind === 4) {
        ctx.beginPath()

        ctx.arc(
            x,
            y,
            cell * 0.36,
            0,
            Math.PI * 2
        )

        ctx.moveTo(
            x + cell * 0.16,
            y
        )

        ctx.arc(
            x,
            y,
            cell * 0.16,
            0,
            Math.PI * 2
        )

        ctx.stroke()
        return
    }

    if (kind === 5) {
        const q = cell * 0.33
        const r = cell * 0.14

        ctx.beginPath()

        ctx.moveTo(
            x - q + r,
            y - q
        )

        ctx.lineTo(
            x + q - r,
            y - q
        )

        ctx.quadraticCurveTo(
            x + q,
            y - q,
            x + q,
            y - q + r
        )

        ctx.lineTo(
            x + q,
            y + q - r
        )

        ctx.quadraticCurveTo(
            x + q,
            y + q,
            x + q - r,
            y + q
        )

        ctx.lineTo(
            x - q + r,
            y + q
        )

        ctx.quadraticCurveTo(
            x - q,
            y + q,
            x - q,
            y + q - r
        )

        ctx.lineTo(
            x - q,
            y - q + r
        )

        ctx.quadraticCurveTo(
            x - q,
            y - q,
            x - q + r,
            y - q
        )

        ctx.closePath()
        ctx.stroke()

        const d = cell * 0.16

        ctx.fillRect(
            x - d / 2,
            y - d / 2,
            d,
            d
        )

        return
    }

    if (kind === 6) {
        const b = cell * 0.27

        ctx.lineWidth =
            Math.max(
                2,
                cell * 0.17
            ) * weight

        ctx.beginPath()

        ctx.moveTo(
            x - b,
            y - b
        )

        ctx.lineTo(
            x + b,
            y + b
        )

        ctx.moveTo(
            x + b,
            y - b
        )

        ctx.lineTo(
            x - b,
            y + b
        )

        ctx.stroke()
        return
    }

    const o = cell * 0.19
    const r = cell * 0.13

    for (let k = 0; k < 4; k++) {
        const dx =
            k === 0 || k === 3
                ? -1
                : 1

        const dy = k < 2 ? -1 : 1

        ctx.beginPath()

        ctx.arc(
            x + dx * o,
            y + dy * o,
            r,
            0,
            Math.PI * 2
        )

        ctx.fill()
    }
}

function StaticGlyphPreview({
    color,
    size,
    density,
    weight,
    alpha,
    blockCount,
    blockScale,
}: {
    color: string
    size: number
    density: number
    weight: number
    alpha: number
    blockCount: number
    blockScale: number
}) {
    const width = 1000
    const height = 650

    const grid = createGrid(
        width,
        height,
        size
    )

    const symbols: React.ReactNode[] = []

    for (
        let j = 0;
        j < grid.rows;
        j++
    ) {
        for (
            let i = 0;
            i < grid.columns;
            i++
        ) {
            const shape = getGlyphShape(
                i,
                j,
                0,
                density
            )

            if (shape.kind === 0) {
                continue
            }

            const x =
                i * grid.cell +
                grid.cell / 2

            const y =
                j * grid.cell +
                grid.cell / 2

            const c = grid.cell

            let element: React.ReactNode = null

            if (shape.kind === 1) {
                element = (
                    <rect
                        x={x - c * 0.06}
                        y={y - c * 0.06}
                        width={c * 0.12}
                        height={c * 0.12}
                        fill={color}
                    />
                )
            } else if (
                shape.kind === 2 ||
                shape.kind === 3
            ) {
                const a = c * 0.22

                const d =
                    shape.kind === 2
                        ? `M ${x - a} ${y} H ${x + a} M ${x} ${y - a} V ${y + a}`
                        : `M ${x - a} ${y - a} L ${x + a} ${y + a} M ${x + a} ${y - a} L ${x - a} ${y + a}`

                element = (
                    <path
                        d={d}
                        fill="none"
                        stroke={color}
                        strokeWidth={
                            Math.max(
                                1,
                                c * 0.09
                            ) * weight
                        }
                        strokeLinecap="round"
                    />
                )
            } else if (
                shape.kind === 4
            ) {
                element = (
                    <g
                        fill="none"
                        stroke={color}
                        strokeWidth={
                            Math.max(
                                1,
                                c * 0.09
                            ) * weight
                        }
                    >
                        <circle
                            cx={x}
                            cy={y}
                            r={c * 0.36}
                        />
                        <circle
                            cx={x}
                            cy={y}
                            r={c * 0.16}
                        />
                    </g>
                )
            } else if (
                shape.kind === 5
            ) {
                element = (
                    <g>
                        <rect
                            x={x - c * 0.33}
                            y={y - c * 0.33}
                            width={c * 0.66}
                            height={c * 0.66}
                            rx={c * 0.14}
                            fill="none"
                            stroke={color}
                            strokeWidth={
                                Math.max(
                                    1,
                                    c * 0.09
                                ) * weight
                            }
                        />
                        <rect
                            x={x - c * 0.08}
                            y={y - c * 0.08}
                            width={c * 0.16}
                            height={c * 0.16}
                            fill={color}
                        />
                    </g>
                )
            } else if (
                shape.kind === 6
            ) {
                const b = c * 0.27

                element = (
                    <path
                        d={`M ${x - b} ${y - b} L ${x + b} ${y + b} M ${x + b} ${y - b} L ${x - b} ${y + b}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={
                            Math.max(
                                2,
                                c * 0.17
                            ) * weight
                        }
                        strokeLinecap="round"
                    />
                )
            } else {
                const o = c * 0.19
                const r = c * 0.13

                element = (
                    <g fill={color}>
                        <circle
                            cx={x - o}
                            cy={y - o}
                            r={r}
                        />
                        <circle
                            cx={x + o}
                            cy={y - o}
                            r={r}
                        />
                        <circle
                            cx={x + o}
                            cy={y + o}
                            r={r}
                        />
                        <circle
                            cx={x - o}
                            cy={y + o}
                            r={r}
                        />
                    </g>
                )
            }

            symbols.push(
                <g key={`${i}-${j}`}>
                    {element}
                </g>
            )
        }
    }

    const blocks = Array.from(
        { length: blockCount },
        (_, index) =>
            makeBlock(
                index * 13.7 + 0.5,
                grid.columns,
                grid.rows,
                blockScale
            )
    )

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            style={{
                display: "block",
                opacity: alpha,
            }}
        >
            {symbols}

            {blocks.map((block, index) => (
                <rect
                    key={`block-${index}`}
                    x={
                        block.x *
                        grid.cell
                    }
                    y={
                        block.y *
                        grid.cell
                    }
                    width={
                        block.w *
                        grid.cell
                    }
                    height={
                        block.h *
                        grid.cell
                    }
                    fill={color}
                />
            ))}
        </svg>
    )
}

export default function KarimSaifGlyphBlocksBackground(
    props: Props
) {
    const {
        preset = "acid",
        color = "#C6FF00",
        backgroundColor = "#000000",
        size = 18,
        blocks = 3,
        speed = 1,
        paused = false,
        glyphDensity = 1,
        blockScale = 1,
        strokeWeight = 1,
        opacity = 1,
        cursorEnabled = true,
        cursorRadius = 160,
        cursorStrength = 0.65,
        style,
    } = props

    const staticRenderer =
        useIsStaticRenderer()

    const hostRef =
        React.useRef<HTMLDivElement>(null)

    const canvasRef =
        React.useRef<HTMLCanvasElement>(null)

    const palette =
        preset === "custom"
            ? null
            : PRESETS[preset] ||
              PRESETS.acid

    const activeColor = palette
        ? palette.color
        : color

    const activeBackground = palette
        ? palette.background
        : backgroundColor

    const cell = clamp(
        Number.isFinite(size)
            ? size
            : 18,
        10,
        80
    )

    const blockCount = Math.round(
        clamp(
            Number.isFinite(blocks)
                ? blocks
                : 3,
            0,
            30
        )
    )

    const rate = clamp(
        Number.isFinite(speed)
            ? speed
            : 1,
        0,
        5
    )

    const density = clamp(
        Number.isFinite(glyphDensity)
            ? glyphDensity
            : 1,
        0.2,
        2
    )

    const scale = clamp(
        Number.isFinite(blockScale)
            ? blockScale
            : 1,
        0.2,
        3
    )

    const weight = clamp(
        Number.isFinite(strokeWeight)
            ? strokeWeight
            : 1,
        0.5,
        3
    )

    const alpha = clamp(
        Number.isFinite(opacity)
            ? opacity
            : 1,
        0,
        1
    )

    const radius = clamp(
        Number.isFinite(cursorRadius)
            ? cursorRadius
            : 160,
        40,
        500
    )

    const strength = clamp(
        Number.isFinite(cursorStrength)
            ? cursorStrength
            : 0.65,
        0,
        2
    )

    React.useEffect(() => {
        if (staticRenderer) return

        const host = hostRef.current
        const canvas = canvasRef.current

        if (!host || !canvas) return

        const ctx = canvas.getContext("2d")

        if (!ctx) return

        const motionQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            )

        let reducedMotion =
            motionQuery.matches

        let disposed = false
        let visible = false

        let width = 0
        let height = 0

        let grid = createGrid(
            1,
            1,
            cell
        )

        let glyphs: Glyph[] = []
        let solids: Block[] = []

        let elapsed = 0
        let lastStep = -1
        let lastBeat = -1

        let pointerActive = false
        let pointerX = -10000
        let pointerY = -10000

        let activeTouchId:
            number | null = null

        let settling = false

        let frame = 0
        let timer:
            ReturnType<typeof setTimeout> | null =
                null

        let previousFrame = 0
        let lastDraw = 0
        let lastFieldTime = 0

        const canAnimate = () =>            !disposed &&
            visible &&
            !document.hidden &&
            !paused &&
            !reducedMotion &&
            width > 0 &&
            height > 0

        const fieldEnabled = () =>
            canAnimate() && rate > 0

        const cursorEnabledNow = () =>
            canAnimate() &&
            cursorEnabled &&
            strength > 0

        const draw = (step: number) => {
            if (
                disposed ||
                width <= 0 ||
                height <= 0
            ) {
                return
            }

            ctx.clearRect(
                0,
                0,
                width,
                height
            )

            ctx.fillStyle = activeColor
            ctx.strokeStyle = activeColor

            ctx.lineCap = "round"
            ctx.lineJoin = "round"

            ctx.globalAlpha = alpha

            const c = grid.cell

            for (
                let j = 0;
                j < grid.rows;
                j++
            ) {
                for (
                    let i = 0;
                    i < grid.columns;
                    i++
                ) {
                    const index =
                        j * grid.columns + i

                    const glyph =
                        glyphs[index]

                    if (!glyph) continue

                    const shape =
                        getGlyphShape(
                            i,
                            j,
                            step,
                            density
                        )

                    if (
                        shape.kind === 0
                    ) {
                        continue
                    }

                    const x =
                        i * c +
                        c / 2 +
                        glyph.dx

                    const y =
                        j * c +
                        c / 2 +
                        glyph.dy

                    drawGlyph(
                        ctx,
                        shape.kind,
                        x,
                        y,
                        c,
                        weight
                    )
                }
            }

            for (const block of solids) {
                ctx.fillRect(
                    block.x * c,
                    block.y * c,
                    block.w * c,
                    block.h * c
                )
            }

            ctx.globalAlpha = 1
        }

        const stop = () => {
            if (frame) {
                cancelAnimationFrame(frame)
                frame = 0
            }

            if (timer !== null) {
                clearTimeout(timer)
                timer = null
            }
        }

        const updateGlyphs = (
            delta: number
        ): boolean => {
            if (!cursorEnabledNow()) {
                return false
            }

            const c = grid.cell

            const factor = clamp(
                delta * 60,
                0.25,
                2
            )

            const damping =
                Math.pow(
                    0.78,
                    factor
                )

            const spring =
                0.045 * factor

            let moving = false

            const updateCell = (
                i: number,
                j: number
            ) => {
                const index =
                    j * grid.columns + i

                const glyph =
                    glyphs[index]

                if (!glyph) return

                const baseX =
                    i * c + c / 2

                const baseY =
                    j * c + c / 2

                let targetX = 0
                let targetY = 0

                if (pointerActive) {
                    const dx =
                        pointerX - baseX

                    const dy =
                        pointerY - baseY

                    const distance =
                        Math.hypot(dx, dy)

                    if (
                        distance < radius &&
                        distance > 0.001
                    ) {
                        const influence =
                            Math.pow(
                                1 -
                                    distance /
                                        radius,
                                2
                            )

                        const pull =
                            Math.min(
                                radius * 0.42,
                                distance * 0.7
                            ) *
                            influence *
                            strength

                        targetX =
                            (dx / distance) *
                            pull

                        targetY =
                            (dy / distance) *
                            pull
                    }
                }

                glyph.vx +=
                    (targetX - glyph.dx) *
                    spring

                glyph.vy +=
                    (targetY - glyph.dy) *
                    spring

                glyph.vx *= damping
                glyph.vy *= damping

                glyph.dx +=
                    glyph.vx * factor

                glyph.dy +=
                    glyph.vy * factor

                if (
                    Math.abs(glyph.dx) >
                        0.01 ||
                    Math.abs(glyph.dy) >
                        0.01 ||
                    Math.abs(glyph.vx) >
                        0.01 ||
                    Math.abs(glyph.vy) >
                        0.01
                ) {
                    moving = true
                } else {
                    glyph.dx = 0
                    glyph.dy = 0
                    glyph.vx = 0
                    glyph.vy = 0
                }
            }

            if (pointerActive) {
                const padding =
                    radius + c * 2

                const minI = clamp(
                    Math.floor(
                        (pointerX -
                            padding) /
                            c
                    ),
                    0,
                    grid.columns - 1
                )

                const maxI = clamp(
                    Math.ceil(
                        (pointerX +
                            padding) /
                            c
                    ),
                    0,
                    grid.columns - 1
                )

                const minJ = clamp(
                    Math.floor(
                        (pointerY -
                            padding) /
                            c
                    ),
                    0,
                    grid.rows - 1
                )

                const maxJ = clamp(
                    Math.ceil(
                        (pointerY +
                            padding) /
                            c
                    ),
                    0,
                    grid.rows - 1
                )

                for (
                    let j = minJ;
                    j <= maxJ;
                    j++
                ) {
                    for (
                        let i = minI;
                        i <= maxI;
                        i++
                    ) {
                        updateCell(i, j)
                    }
                }
            }

            for (
                let j = 0;
                j < grid.rows;
                j++
            ) {
                for (
                    let i = 0;
                    i < grid.columns;
                    i++
                ) {
                    const glyph =
                        glyphs[
                            j *
                                grid.columns +
                                i
                        ]

                    if (!glyph) continue

                    if (
                        Math.abs(glyph.dx) <
                            0.01 &&
                        Math.abs(glyph.dy) <
                            0.01 &&
                        Math.abs(glyph.vx) <
                            0.01 &&
                        Math.abs(glyph.vy) <
                            0.01
                    ) {
                        continue
                    }

                    if (pointerActive) {
                        const x =
                            i * c + c / 2

                        const y =
                            j * c + c / 2

                        if (
                            Math.abs(
                                x - pointerX
                            ) <=
                                radius + c * 2 &&
                            Math.abs(
                                y - pointerY
                            ) <=
                                radius + c * 2
                        ) {
                            continue
                        }
                    }

                    updateCell(i, j)
                }
            }

            return moving
        }

        const updateField = (
            now: number
        ) => {
            if (!fieldEnabled()) {
                lastFieldTime = now
                return false
            }

            if (!lastFieldTime) {
                lastFieldTime = now
                return false
            }

            const delta = Math.min(
                Math.max(
                    0,
                    (now - lastFieldTime) /
                        1000
                ),
                0.25
            )

            lastFieldTime = now

            elapsed += delta * rate

            const step = Math.floor(
                elapsed * 8
            )

            const beat = Math.floor(
                elapsed / 1.4
            )

            let changed = false

            if (beat !== lastBeat) {
                if (solids.length > 0) {
                    solids[
                        ((beat %
                            solids.length) +
                            solids.length) %
                            solids.length
                    ] = makeBlock(
                        beat * 7.31 + 1,
                        grid.columns,
                        grid.rows,
                        scale
                    )
                }

                lastBeat = beat
                changed = true
            }

            if (step !== lastStep) {
                lastStep = step
                changed = true
            }

            return changed
        }

        const scheduleField = () => {
            if (
                !fieldEnabled() ||
                frame ||
                timer !== null
            ) {
                return
            }

            const interval =
                1000 / (8 * rate)

            timer = setTimeout(() => {
                timer = null

                if (!canAnimate()) {
                    return
                }

                const now =
                    performance.now()

                updateField(now)

                draw(
                    Math.floor(
                        elapsed * 8
                    )
                )

                if (
                    pointerActive ||
                    settling
                ) {
                    startFrame()
                } else {
                    scheduleField()
                }
            }, Math.max(16, interval))
        }

        const tick = (now: number) => {
            frame = 0

            if (!canAnimate()) {
                return
            }

            const delta = Math.min(
                Math.max(
                    0,
                    (now - previousFrame) /
                        1000
                ),
                0.05
            )

            previousFrame = now

            const fieldChanged =
                updateField(now)

            settling = updateGlyphs(delta)

            if (
                fieldChanged ||
                settling ||
                pointerActive
            ) {
                if (
                    now - lastDraw >=
                    1000 / 60
                ) {
                    draw(
                        Math.floor(
                            elapsed * 8
                        )
                    )

                    lastDraw = now
                }
            }

            if (
                cursorEnabledNow() &&
                (pointerActive ||
                    settling)
            ) {
                frame =
                    requestAnimationFrame(tick)
            } else {
                scheduleField()
            }
        }

        const startFrame = () => {
            if (
                !canAnimate() ||
                !cursorEnabledNow()
            ) {
                return
            }

            if (timer !== null) {
                clearTimeout(timer)
                timer = null
            }

            if (frame) return

            previousFrame =
                performance.now()

            frame =
                requestAnimationFrame(tick)
        }

        const updatePlayback = () => {
            stop()

            if (!canAnimate()) {
                return
            }

            lastFieldTime =
                performance.now()

            if (
                cursorEnabledNow() &&
                (pointerActive ||
                    settling)
            ) {
                startFrame()
            } else {
                scheduleField()
            }
        }

        const resize = () => {
            if (disposed) return

            width = Math.max(
                0,
                host.clientWidth
            )

            height = Math.max(
                0,
                host.clientHeight
            )

            if (
                width <= 0 ||
                height <= 0
            ) {
                stop()
                return
            }

            const dpr = Math.min(
                Math.max(
                    1,
                    window.devicePixelRatio ||
                        1
                ),
                2
            )

            canvas.width = Math.max(
                1,
                Math.round(width * dpr)
            )

            canvas.height = Math.max(
                1,
                Math.round(height * dpr)
            )

            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            )

            grid = createGrid(
                width,
                height,
                cell
            )

            glyphs = Array.from(
                {
                    length:
                        grid.columns *
                        grid.rows,
                },
                () => ({
                    dx: 0,
                    dy: 0,
                    vx: 0,
                    vy: 0,
                })
            )

            solids = Array.from(
                {
                    length: blockCount,
                },
                (_, index) =>
                    makeBlock(
                        index * 13.7 +
                            0.5,
                        grid.columns,
                        grid.rows,
                        scale
                    )
            )

            settling = false

            lastStep =
                Math.floor(
                    elapsed * 8
                )

            lastBeat =
                Math.floor(
                    elapsed / 1.4
                )

            draw(lastStep)
            updatePlayback()
        }

        const updatePointer = (
            event: PointerEvent
        ) => {
            if (!cursorEnabledNow()) {
                return
            }

            if (
                event.pointerType ===
                    "touch" &&
                activeTouchId !== null &&
                event.pointerId !==
                    activeTouchId
            ) {
                return
            }

            const rect =
                host.getBoundingClientRect()

            const x =
                event.clientX -
                rect.left

            const y =
                event.clientY -
                rect.top

            if (
                x < 0 ||
                y < 0 ||
                x > rect.width ||
                y > rect.height
            ) {
                if (pointerActive) {
                    pointerActive = false
                    updatePlayback()
                }

                return
            }

            if (
                event.pointerType ===
                "touch"
            ) {
                if (
                    activeTouchId === null
                ) {
                    return
                }
            }

            pointerX = x
            pointerY = y
            pointerActive = true

            if (!frame) {
                startFrame()
            }
        }

        const pointerDown = (
            event: PointerEvent
        ) => {
            if (
                event.pointerType ===
                "touch"
            ) {
                activeTouchId =
                    event.pointerId
            }

            updatePointer(event)
        }

        const pointerUp = (
            event: PointerEvent
        ) => {
            if (
                event.pointerType ===
                    "touch" &&
                event.pointerId ===
                    activeTouchId
            ) {
                activeTouchId = null
                pointerActive = false
                updatePlayback()
            }
        }

        const pointerCancel = (
            event: PointerEvent
        ) => {
            if (
                event.pointerType ===
                    "touch" &&
                event.pointerId !==
                    activeTouchId
            ) {
                return
            }

            activeTouchId = null
            pointerActive = false
            updatePlayback()
        }

        const blur = () => {
            pointerActive = false
            activeTouchId = null
            updatePlayback()
        }

        const handleVisibility = () => {
            if (document.hidden) {
                pointerActive = false
                activeTouchId = null
            }

            updatePlayback()
        }

        const handleMotion = (
            event: MediaQueryListEvent
        ) => {
            reducedMotion =
                event.matches

            pointerActive = false
            settling = false

            for (const glyph of glyphs) {
                glyph.dx = 0
                glyph.dy = 0
                glyph.vx = 0
                glyph.vy = 0
            }

            draw(
                Math.floor(
                    elapsed * 8
                )
            )

            updatePlayback()
        }

        let resizeObserver:
            ResizeObserver | null = null

        let intersectionObserver:
            IntersectionObserver | null = null

        resize()

        if (
            typeof ResizeObserver !==
            "undefined"
        ) {
            resizeObserver =
                new ResizeObserver(resize)

            resizeObserver.observe(
                host
            )
        } else {
            window.addEventListener(
                "resize",
                resize
            )
        }

        if (
            typeof IntersectionObserver !==
            "undefined"
        ) {
            intersectionObserver =
                new IntersectionObserver(
                    ([entry]) => {
                        visible =
                            entry?.isIntersecting ??
                            false

                        if (!visible) {
                            pointerActive = false
                            activeTouchId = null
                        }

                        updatePlayback()
                    },
                    {
                        threshold: 0,
                    }
                )

            intersectionObserver.observe(
                host
            )
        } else {
            visible = true
            updatePlayback()
        }

        window.addEventListener(
            "pointermove",
            updatePointer,
            { passive: true }
        )

        window.addEventListener(
            "pointerdown",
            pointerDown,
            { passive: true }
        )

        window.addEventListener(
            "pointerup",
            pointerUp,
            { passive: true }
        )

        window.addEventListener(
            "pointercancel",
            pointerCancel,
            { passive: true }
        )

        window.addEventListener(
            "blur",
            blur
        )

        document.addEventListener(
            "visibilitychange",
            handleVisibility
        )

        if (
            typeof motionQuery.addEventListener ===
            "function"
        ) {
            motionQuery.addEventListener(
                "change",
                handleMotion
            )
        } else {
            motionQuery.addListener(
                handleMotion
            )
        }

        return () => {
            disposed = true

            stop()

            resizeObserver?.disconnect()
            intersectionObserver?.disconnect()

            window.removeEventListener(
                "resize",
                resize
            )

            window.removeEventListener(
                "pointermove",
                updatePointer
            )

            window.removeEventListener(
                "pointerdown",
                pointerDown
            )

            window.removeEventListener(
                "pointerup",
                pointerUp
            )

            window.removeEventListener(
                "pointercancel",
                pointerCancel
            )

            window.removeEventListener(
                "blur",
                blur
            )

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            )

            if (
                typeof motionQuery.removeEventListener ===
                "function"
            ) {
                motionQuery.removeEventListener(
                    "change",
                    handleMotion
                )
            } else {
                motionQuery.removeListener(
                    handleMotion
                )
            }
        }
    }, [
        staticRenderer,
        activeColor,
        cell,
        blockCount,
        rate,
        paused,
        density,
        scale,
        weight,
        alpha,
        cursorEnabled,
        radius,
        strength,
    ])

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                overflow: "hidden",
                backgroundColor:
                    activeBackground,                isolation: "isolate",
                pointerEvents: "none",
            }}
        >
            {staticRenderer ? (
                <StaticGlyphPreview
                    color={activeColor}
                    size={cell}
                    density={density}
                    weight={weight}
                    alpha={alpha}
                    blockCount={
                        blockCount
                    }
                    blockScale={scale}
                />
            ) : (
                <canvas
                    ref={canvasRef}
                    style={{
                        display: "block",
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents:
                            "none",
                    }}
                />
            )}
        </div>
    )
}

KarimSaifGlyphBlocksBackground.defaultProps = {
    preset: "acid",
    color: "#C6FF00",
    backgroundColor: "#000000",
    size: 18,
    blocks: 3,
    speed: 1,
    paused: false,
    glyphDensity: 1,
    blockScale: 1,
    strokeWeight: 1,
    opacity: 1,
    cursorEnabled: true,
    cursorRadius: 160,
    cursorStrength: 0.65,
}

addPropertyControls(
    KarimSaifGlyphBlocksBackground,
    {
        preset: {
            type: ControlType.Enum,
            title: "Preset",
            options: [
                "acid",
                "matrix",
                "cyan",
                "amber",
                "mono",
                "custom",
            ],
            optionTitles: [
                "Acid Green",
                "Matrix",
                "Cyber Cyan",
                "Amber",
                "Monochrome",
                "Custom",
            ],
            defaultValue: "acid",
            description:
                "Choose a ready-made color theme or select Custom to define your own glyph and background colors.",
        },

        color: {
            type: ControlType.Color,
            title: "Glyph Color",
            defaultValue: "#C6FF00",
            hidden: (props) =>
                props.preset !== "custom",
            description:
                "Sets the color of glyphs, geometric symbols, and solid blocks when using the Custom preset.",
        },

        backgroundColor: {
            type: ControlType.Color,
            title: "Background",
            defaultValue: "#000000",
            hidden: (props) =>
                props.preset !== "custom",
            description:
                "Sets the background color behind the glyph grid when using the Custom preset.",
        },

        size: {
            type: ControlType.Number,
            title: "Cell Size",
            min: 10,
            max: 80,
            step: 1,
            defaultValue: 18,
            unit: "px",
            displayStepper: true,
            description:
                "Controls the size of each grid cell. Smaller cells create finer patterns, while larger cells produce bolder geometric symbols.",
        },

        blocks: {
            type: ControlType.Number,
            title: "Blocks",
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 3,
            displayStepper: true,
            description:
                "Sets the number of solid rectangular blocks that periodically jump to new positions.",
        },

        speed: {
            type: ControlType.Number,
            title: "Speed",
            min: 0,
            max: 5,
            step: 0.1,
            defaultValue: 1,
            displayStepper: true,
            description:
                "Controls how quickly glyph zones drift, symbols refresh, and blocks jump. Zero stops automatic animation while keeping cursor interaction available.",
        },

        paused: {
            type: ControlType.Boolean,
            title: "Paused",
            defaultValue: false,
            enabledTitle: "Yes",
            disabledTitle: "No",
            description:
                "Pauses automatic animation and cursor interaction while keeping the current pattern visible.",
        },

        glyphDensity: {
            type: ControlType.Number,
            title: "Density",
            min: 0.2,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            displayStepper: true,
            description:
                "Controls the density of visible glyphs. Lower values create more empty space, while higher values fill more of the grid.",
        },

        blockScale: {
            type: ControlType.Number,
            title: "Block Scale",
            min: 0.2,
            max: 3,
            step: 0.1,
            defaultValue: 1,
            displayStepper: true,
            description:
                "Changes the width and height of the solid rectangular blocks without changing the grid cell size.",
        },

        strokeWeight: {
            type: ControlType.Number,
            title: "Stroke",
            min: 0.5,
            max: 3,
            step: 0.1,
            defaultValue: 1,
            displayStepper: true,
            description:
                "Controls the thickness of outlined glyphs, including targets, crosses, plus signs, and rounded squares.",
        },

        opacity: {
            type: ControlType.Number,
            title: "Opacity",
            min: 0,
            max: 1,
            step: 0.05,
            defaultValue: 1,
            displayStepper: true,
            description:
                "Controls glyph and block opacity while keeping the background fully opaque.",
        },

        cursorEnabled: {
            type: ControlType.Boolean,
            title: "Cursor",
            defaultValue: true,
            enabledTitle: "On",
            disabledTitle: "Off",
            description:
                "Enables smooth cursor attraction. Nearby glyphs move toward the pointer and spring back when it leaves.",
        },

        cursorRadius: {
            type: ControlType.Number,
            title: "Cursor Radius",
            min: 40,
            max: 500,
            step: 10,
            defaultValue: 160,
            unit: "px",
            displayStepper: true,
            hidden: (props) =>
                !props.cursorEnabled,
            description:
                "Sets the radius of cursor attraction. Larger values affect glyphs across a wider area.",
        },

        cursorStrength: {
            type: ControlType.Number,
            title: "Cursor Strength",
            min: 0,
            max: 2,
            step: 0.05,
            defaultValue: 0.65,
            displayStepper: true,
            hidden: (props) =>
                !props.cursorEnabled,
            description:
                "Controls how strongly nearby glyphs are attracted toward the pointer. Higher values create more dramatic movement.",
        },
    }
)