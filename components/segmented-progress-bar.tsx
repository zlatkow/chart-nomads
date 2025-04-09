/* eslint-disable */
interface SegmentedProgressBarProps {
  value?: number
  segments?: number
  className?: string
  showPercentage?: boolean
}

export const SegmentedProgressBar = ({
  value = 0,
  segments = 5,
  className = "",
  showPercentage = false,
}: SegmentedProgressBarProps) => {
  // Calculate how many segments should be filled based on the percentage
  const segmentSize = 100 / segments
  const filledSegments = Math.ceil(value / segmentSize)

  // Define segment colors from darker to lighter yellow
  const segmentColors = [
    "#9f7c00", // 20%
    "#b28b00", // 40%
    "#c69a00", // 60%
    "#d9aa00", // 80%
    "#edb900", // 100%
  ]

  return (
    <div className={`flex items-center ${className}`}>
      {showPercentage && <span className="mr-2 text-xs font-medium">{value}%</span>}
      <div className="relative flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden border border-[#333]">
        <div className="flex w-full h-full">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i > 0 ? "border-l border-[#333]" : ""}`}
              style={{
                backgroundColor:
                  i < filledSegments ? segmentColors[Math.min(i, segmentColors.length - 1)] : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
