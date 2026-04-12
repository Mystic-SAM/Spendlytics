import React from "react"

export function SpendlyticsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <defs>
        <linearGradient id="spendlytics-grad" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0080ff"/>
          <stop offset="50%" stopColor="#00dc97"/>
          <stop offset="100%" stopColor="#3aff00"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#12151b"/>
      <rect x="16" y="52" width="12" height="40" rx="6" fill="url(#spendlytics-grad)"/>
      <rect x="32" y="41" width="12" height="51" rx="6" fill="url(#spendlytics-grad)"/>
      <rect x="48" y="54" width="12" height="38" rx="6" fill="url(#spendlytics-grad)"/>
      <rect x="64" y="34" width="12" height="58" rx="6" fill="url(#spendlytics-grad)"/>
      <g stroke="#12151b" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 20 54 L 38 36 L 54 49 L 70 33" fill="none" strokeWidth="18" />
        <path d="M 64 27 L 84 19 L 76 39 Z" fill="#12151b" strokeWidth="8" />
      </g>
      <path d="M 20 54 L 38 36 L 54 49 L 70 33" fill="none" stroke="url(#spendlytics-grad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 64 27 L 84 19 L 76 39 Z" fill="url(#spendlytics-grad)" stroke="url(#spendlytics-grad)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
