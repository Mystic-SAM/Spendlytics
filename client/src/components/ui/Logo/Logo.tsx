import { Link } from "react-router-dom"
import { SpendlyticsIcon } from "@/assets/Icons/SpendlyticsIcon"

const Logo = (props: { url?: string }) => {
  return (
    <Link to={props.url || "/"} className="flex items-center gap-2">
      <SpendlyticsIcon className="h-6.5 w-6.5" />
      <span className="font-semibold text-lg">Spendlytics</span>
    </Link>
  )
}

export default Logo;