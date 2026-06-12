import { IconArrowNarrowLeft } from "@tabler/icons-react"
import { ICON_PROPS_ACTION } from "@/config/constants"
import { useNavigateRoutes } from "@/hooks/useNavigateRoutes"
import "./BackBtn.scss"

export default function BackBtn() {
    const { navigateBack } = useNavigateRoutes()

    return (
        <button className="BackBtn" onClick={navigateBack}>
            <IconArrowNarrowLeft {...ICON_PROPS_ACTION} />
            return
        </button>
    )
}
