import { useNavigate } from "react-router-dom"
import { IconArrowNarrowLeft } from "@tabler/icons-react"
import { ICON_PROPS_ACTION } from "@/config/constants"

export default function BackBtn() {
    const navigate = useNavigate()

    return (
        <button className="BackBtn" onClick={() => navigate(-1)}>
            <IconArrowNarrowLeft {...ICON_PROPS_ACTION} />
            return
        </button>
    )
}
