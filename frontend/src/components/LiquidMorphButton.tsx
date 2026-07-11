import React, { useMemo, useId } from "react";

interface LiquidMorphButtonProps {
  label: string;
  link?: string;
  openInNewTab?: boolean;
  padding?: string;
  radius?: string;
  backgroundColor?: string;
  textColor?: string;
  blobColor?: string;
  hoverTextColor?: string;
  className?: string;
  onClick?: () => void;
}

export default function LiquidMorphButton({
  label,
  link,
  openInNewTab = false,
  padding = "16px 40px",
  radius = "999px",
  backgroundColor = "transparent",
  textColor = "#102221",
  blobColor = "#2C6C73",
  hoverTextColor = "#FAF9F6",
  className = "",
  onClick
}: LiquidMorphButtonProps) {
  const instanceId = useId().replace(/:/g, "");
  const rootClass = `lmb_${instanceId}`;
  const filterId = `goo_${instanceId}`;

  const cssText = useMemo(() => {
    const duration = 500;
    const blobDuration = 700;
    const risePct = 200;
    const scale = 3.5;
    const blobSpacing = 56;
    const blobSize = 24;
    const blobBottomOffset = 32;
    const hoverDelayStep = 50;

    const b1Left = `calc(50% - ${blobSpacing}px)`;
    const b2Left = "50%";
    const b3Left = `calc(50% + ${blobSpacing}px)`;
    const delay0 = 0;
    const delay1 = hoverDelayStep;
    const delay2 = hoverDelayStep * 2;

    return `
      .${rootClass} {
        -webkit-font-smoothing: antialiased;
        text-decoration: none;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: ${padding};
        border-radius: ${radius};
        overflow: hidden;
        isolation: isolate;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        background: ${backgroundColor};
        color: ${textColor};
        transition: color ${duration}ms cubic-bezier(0.23, 1, 0.32, 1);
        outline: none;
        border: 2px solid ${textColor};
        font-weight: 600;
      }
      .${rootClass}:focus-visible {
        box-shadow: 0 0 0 3px rgba(0,0,0,0.18);
      }
      .${rootClass} .lmb_label {
        position: relative;
        z-index: 2;
        transition: color ${duration}ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .${rootClass} .lmb_bg {
        position: absolute;
        inset: 0;
        z-index: 1;
        filter: url(#${filterId});
        pointer-events: none;
      }
      .${rootClass} .lmb_blob {
        position: absolute;
        width: ${blobSize}px;
        height: ${blobSize}px;
        border-radius: 999px;
        background: ${blobColor};
        bottom: ${-Math.abs(blobBottomOffset)}px;
        transform: translateY(0) scale(0);
        transition: transform ${blobDuration}ms cubic-bezier(0.23, 1, 0.32, 1);
        will-change: transform;
      }
      .${rootClass} .lmb_blob:nth-child(1) { left: ${b1Left}; transition-delay: ${delay0}ms; transform: translateX(-50%) translateY(0) scale(0); }
      .${rootClass} .lmb_blob:nth-child(2) { left: ${b2Left}; transition-delay: ${delay1}ms; transform: translateX(-50%) translateY(0) scale(0); }
      .${rootClass} .lmb_blob:nth-child(3) { left: ${b3Left}; transition-delay: ${delay2}ms; transform: translateX(-50%) translateY(0) scale(0); }
      
      .${rootClass}:hover { 
        color: ${hoverTextColor}; 
        border-color: ${blobColor};
      }
      .${rootClass}:hover .lmb_blob {
        transform: translateX(-50%) translateY(-${risePct}%) scale(${scale});
      }
      
      @media (prefers-reduced-motion: reduce) {
        .${rootClass}, .${rootClass} .lmb_label, .${rootClass} .lmb_blob {
          transition: none !important;
        }
      }
    `;
  }, [rootClass, filterId, padding, radius, backgroundColor, textColor, blobColor, hoverTextColor]);

  const content = (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span className="lmb_bg" aria-hidden="true">
        <span className="lmb_blob" />
        <span className="lmb_blob" />
        <span className="lmb_blob" />
      </span>
      <span className="lmb_label">{label}</span>
    </>
  );

  const commonProps = {
    className: `${rootClass} ${className}`,
    role: "button",
    onClick
  };

  const href = link?.trim();
  if (href) {
    return (
      <a {...commonProps} href={href} target={openInNewTab ? "_blank" : undefined} rel={openInNewTab ? "noreferrer noopener" : undefined}>
        {content}
      </a>
    );
  }

  return (
    <button {...commonProps} type="button">
      {content}
    </button>
  );
}
