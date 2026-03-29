import { useState, useCallback } from 'react';

const DEFAULT_SLIDES = [
  { src: '/1.png', label: 'Invite & approvals' },
  { src: '/2.png', label: 'Tasks & activities' },
  { src: '/3.png', label: 'Track & split expenses' },
  { src: '/4.png', label: 'Shared itinerary' },
];

/** One fixed frame for every slide (landing column is max ~640px wide). */
const FRAME_ASPECT = '16 / 10';

export function LandingScreenshotCarousel({ colors, slides = DEFAULT_SLIDES }) {
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const go = useCallback(
    (delta) => {
      setIndex((i) => (i + delta + n) % n);
    },
    [n]
  );

  const current = slides[index];

  return (
    <div
      className="animate-fadeIn"
      style={{
        marginTop: '20px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.cardBg,
        boxShadow: `0 8px 32px ${colors.shadow}`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: FRAME_ASPECT,
          backgroundColor: colors.backgroundTertiary,
        }}
      >
        <img
          src={current.src}
          alt={current.label}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
        <button
          type="button"
          aria-label="Previous screenshot"
          onClick={() => go(-1)}
          style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `1px solid ${colors.border}`,
            backgroundColor: `${colors.cardBg}ee`,
            color: colors.text,
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${colors.shadow}`,
          }}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next screenshot"
          onClick={() => go(1)}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `1px solid ${colors.border}`,
            backgroundColor: `${colors.cardBg}ee`,
            color: colors.text,
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${colors.shadow}`,
          }}
        >
          ›
        </button>
      </div>
      <div
        style={{
          padding: '12px 14px 16px',
          textAlign: 'center',
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>
          {current.label}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Show ${s.label}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? '22px' : '8px',
                height: '8px',
                padding: 0,
                border: 'none',
                borderRadius: '4px',
                backgroundColor: i === index ? colors.primary : colors.border,
                cursor: 'pointer',
                transition: 'width 0.2s ease, background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
