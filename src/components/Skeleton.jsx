import { useTheme } from '../contexts/ThemeContext';

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) {
  const { colors } = useTheme();

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${colors.skeleton} 25%, ${colors.skeletonShine} 50%, ${colors.skeleton} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ style = {} }) {
  const { colors } = useTheme();

  return (
    <div
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: `0 2px 8px ${colors.shadow}`,
        ...style,
      }}
    >
      <Skeleton height="24px" width="70%" style={{ marginBottom: '12px' }} />
      <Skeleton height="16px" width="100%" style={{ marginBottom: '8px' }} />
      <Skeleton height="16px" width="85%" style={{ marginBottom: '16px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <Skeleton height="28px" width="80px" borderRadius="14px" />
        <Skeleton height="28px" width="100px" borderRadius="14px" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, style = {} }) {
  const widths = ['100%', '90%', '75%', '85%', '60%'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="16px" width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40, style = {} }) {
  return (
    <Skeleton
      width={`${size}px`}
      height={`${size}px`}
      borderRadius="50%"
      style={style}
    />
  );
}

export function SkeletonButton({ width = '120px', height = '40px', style = {} }) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius="8px"
      style={style}
    />
  );
}
