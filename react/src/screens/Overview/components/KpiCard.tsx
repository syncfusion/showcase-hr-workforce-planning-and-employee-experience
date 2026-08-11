import React, { useEffect, useMemo, useRef } from 'react';
import { SparklineComponent, Inject, SparklineTooltip } from '@syncfusion/ej2-react-charts';
import { ChipDirective, ChipListComponent, ChipsDirective } from '@syncfusion/ej2-react-buttons';

/** Single trend data point for the Sparkline */
interface TrendPoint {
  x: number;
  yval: number;
}

export interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  trendData: TrendPoint[];
  context: string;
  /** Show a progress bar under the value */
  showProgress?: boolean;
  progressValue?: number;
  target?: number;
  /** Sparkline/ProgressBar color */
  color?: string;
  /** Add highlight border for risk > threshold */
  riskThreshold?: number;
  riskValue?: number;
  /**
   * When true, an UPWARD change is treated as a NEGATIVE outcome
   * (e.g. Retention Risk, Open Requisitions, Defects).
   * The delta arrow, sign prefix, and chip color are all flipped.
   */
  invertTrend?: boolean;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  trendData,
  context,
  // showProgress, progressValue and target are part of the public prop shape
  // (parent Overview passes them; backend may populate them per card) but the
  // current visual treatment does not render a progress bar. We accept the
  // props so the contract stays stable while the rendering is deferred.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showProgress: _showProgress = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  progressValue: _progressValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  target: _target,
  color = '#3B8CDE',
  riskThreshold = 20,
  riskValue,
  invertTrend = false,
  onClick,
}) => {
  // invertTrend semantics:
  //   invertTrend=false (default, e.g. Headcount/Engagement):
  //     change >= 0 → good (green ▲), change < 0 → bad (red ▼)
  //   invertTrend=true  (e.g. Retention Risk):
  //     change >= 0 → bad  (red ▲), change < 0 → good (green ▼)
  const rawDirection = change >= 0 ? 'up' : 'down';
  const isGoodOutcome = invertTrend ? rawDirection === 'down' : rawDirection === 'up';
  const isPositive = isGoodOutcome; // controls chip color (green vs red)
  const arrow = rawDirection === 'up' ? '▲' : '▼';
  const sign = rawDirection === 'up' ? '+' : '−';
  const changeLabel = `${arrow} ${sign}${Math.abs(change)} since last month`;
  const isRiskHighlight =
    riskValue !== undefined && riskValue > riskThreshold;

  // Ref to the Sparkline instance + its wrapping div.
  // The container is observed with ResizeObserver; on every width change
  // we call refresh() so Syncfusion redraws the SVG at the new size.
  // This is required because the parent flex row can reflow as the
  // viewport / card width changes, and the SVG canvas would otherwise
  // stay at the size it was first painted at.
  const sparkRef = useRef<SparklineComponent | null>(null);
  const sparkContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sparkContainerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      // refresh() rerenders the SVG using the current container size;
      // when width/height are "100%" Syncfusion reads the container box.
      sparkRef.current?.refresh();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cardStyle: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = {
      background: 'var(--color-sf-surface)',
      borderRadius: 'var(--card-lg-radius)',
      border: '1px solid var(--color-sf-border-secondary)',
      boxShadow: 'var(--shadow-default)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
    };
    if (isRiskHighlight) {
      base.borderColor = 'var(--color-sf-error-300)';
      base.boxShadow = '0 0 0 1px var(--color-sf-error-100), var(--shadow-default)';
    }
    return base;
  }, [isRiskHighlight, onClick]);

  return (
    <div
      className="e-card"
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isRiskHighlight
          ? '0 0 0 1px var(--color-sf-error-200), var(--shadow-md)'
          : 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isRiskHighlight
          ? '0 0 0 1px var(--color-sf-error-100), var(--shadow-default)'
          : 'var(--shadow-default)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      role="button"
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${title}: ${value}`}
    >
      {/* ── Header row: Title + badge ── */}
      <div className="e-card-header">
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--color-sf-fg-tertiary)',
          }}
        >
          {title}
        </div>

        {isRiskHighlight && (
          <ChipListComponent title="Risk exceeded threshold">
            <ChipsDirective>
              <ChipDirective text="HIGH RISK" cssClass="e-danger no-margin" />
            </ChipsDirective>
          </ChipListComponent>
        )}
      </div>

      {/* ── Body ── */}
      <div className="e-card-content">
        {/* Value + Context */}
        {/* min-width:0 on the row + the value cell is the key fix that
            keeps the sparkline inside the card: without it, the long
            "▲ +24 since last month" chip keeps its intrinsic width and
            shoves the sparkline wrapper off the right edge of the card. */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 auto', minWidth: 0 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: isRiskHighlight ? 'var(--color-sf-error-600)' : 'var(--color-sf-fg-primary)',
                lineHeight: 1.2,
                // Big number can also overflow on a 4-up row at 1280px;
                // ellipsize rather than push the sparkline out.
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {value}
            </div>
            <div
              title="Change since previous month"
              style={{
                // Wrapper sizes to the chip's natural width and refuses
                // to shrink so the full "▲ +24 since last month" label
                // is always visible inside the card.
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                marginLeft: 0
              }}
            >
              <ChipListComponent>
                <ChipsDirective>
                  <ChipDirective
                    text={changeLabel}
                    cssClass={isPositive ? 'e-success' : 'e-danger'}
                  />
                </ChipsDirective>
              </ChipListComponent>
            </div>
          </div>

          {/* Sparkline — last 6 months */}
          <div
            ref={sparkContainerRef}
            title="Last 6 months trend"
            style={{
              // Fixed flex-basis (no grow / no shrink) and a clamp()ed
              // width keeps the sparkline between 56px and 100px so
              // the value+chip cell has enough room to render the full
              // "▲ +24 since last month" label without truncation.
              flex: '0 0 clamp(56px, 22%, 100px)',
              minWidth: 0,
              height: 40,
            }}
          >
            <SparklineComponent
              ref={sparkRef}
              id={`spark-${title.replace(/\s+/g, '-').toLowerCase()}`}
              dataSource={trendData}
              xName="x"
              yName="yval"
              type="Line"
              // "100%" tells Sparkline to read the container box for
              // both axes — this is the documented responsive pattern.
              // Combined with the ResizeObserver above, the chart
              // repaints whenever the card is resized.
              width="100%"
              height="100%"
              fill={color}
              lineWidth={2}
              border={{ color, width: 2 }}
              // Zero padding so the line uses the full container width
              // (the default 8px side padding would otherwise eat a
              // meaningful slice of a 64–120px cell).
              padding={{ left: 0, right: 0, top: 0, bottom: 0 }}
              tooltipSettings={{
                visible: true,
                format: '${x}: ${yval}',
              }}
            >
              <Inject services={[SparklineTooltip]} />
            </SparklineComponent>
          </div>
        </div>

        {/* Contextual line */}
        <div style={{ fontSize: 12, color: 'var(--color-sf-fg-quaternary)', lineHeight: 1.5 }}>
          {context}
        </div>
      </div>
    </div>
  );
};
