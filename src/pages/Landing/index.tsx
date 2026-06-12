import { Link } from "react-router-dom"
import "./index.scss"
import {
    DEVELOPER_WEBSITE_URL,
    GITHUB_REPO_URL,
    ROUTE_JOT,
    ROUTE_PRIVACY,
    ROUTE_TERMS,
} from "@/config/constants"
import { useThemeActions } from "@/hooks/useThemeActions"
import { useCommandPaletteStore } from "@/store/commandPaletteStore"
import AijotLogo from "@/components/AijotLogo"

export default function Landing() {
    const { randomiseTheme } = useThemeActions()

    return (
        <div className="Landing">
            <section className="Landing__Hero">
                <div className="Landing__Logo">
                    <AijotLogo />
                </div>
                <h1 className="Landing__Title">ai*jot</h1>
                <p className="Landing__Tagline">*sloth, not LLM</p>
                {/* <p className="Landing__Definition">
                    ai&nbsp;&nbsp;/ˈɑ.i/&nbsp;&nbsp;noun
                    <br />
                    three-toed sloth
                </p> */}
                <p className="Landing__Description">
                    A minimalist keyboard-first note app.
                </p>
            </section>

            <p className="Landing__MainContent">
                Tailored for keyboard use. Handle notes, bookmarks, and todos. Organised by
                tags. Bunch of tastful themes (
                <button
                    type="button"
                    className="Landing__InlineAction"
                    onClick={randomiseTheme}
                >
                    randomise
                </button>{" "}
                or{" "}
                <button
                    type="button"
                    className="Landing__InlineAction"
                    onClick={() => {
                        useCommandPaletteStore.getState().open("theme")
                    }}
                >
                    pick one
                </button>
                ). Offline-first and privacy-first. Optionally sync to Dropbox
                or GDrive. Open source and free forever.
            </p>

            <Link to={ROUTE_JOT} className="Landing__Btn">
                Get started
            </Link>
            <p className="Landing__BtnHint">(no account or signup needed)</p>

            <footer className="Landing__Footer">
                <p className="Landing__FooterCredit">
                    made by{" "}
                    <a
                        href={DEVELOPER_WEBSITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Juno Nguyen
                    </a>
                </p>
                <div className="Landing__FooterLinks">
                    <a
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Source code
                    </a>
                    <span className="Landing__FooterDivider">·</span>
                    <Link to={ROUTE_PRIVACY}>Privacy Policy</Link>
                    <span className="Landing__FooterDivider">·</span>
                    <Link to={ROUTE_TERMS}>Terms of Service</Link>
                </div>
            </footer>
        </div>
    )
}
