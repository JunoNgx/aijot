import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import "./index.scss"
import BackBtn from "@/components/BackBtn"

export default function Privacy() {
    useDocumentTitle("Privacy Policy")
    return (
        <div className="Privacy">
            <BackBtn />
            <h2 className="Privacy__Title">Privacy Policy</h2>
            <p className="Privacy__Date">Effective April 23, 2026</p>

            <section className="Privacy__Section">
                <h3>The short version</h3>
                <p>
                    Aijot is designed to keep your data in your hands. Your
                    notes, collections, and settings are stored locally in your
                    browser. No server is run that holds your data, and no
                    analytics or trackers are used. If you choose to enable
                    sync, your data is backed up to your own Google Drive
                    account.
                </p>
            </section>

            <section className="Privacy__Section">
                <h3>What data is collected</h3>
                <p>
                    Aijot stores the content you create: notes, todos, links,
                    collections, tags, and your app preferences. If you sign in
                    with Google for sync, an access token is stored locally so
                    you can back up and restore your data. No name, email, or
                    other personal information is collected beyond what you type
                    into the app.
                </p>
            </section>

            <section className="Privacy__Section">
                <h3>Where your data lives</h3>
                <p>
                    By default, everything stays on your device in your
                    browser&apos;s IndexedDB database. Data is not transmitted
                    anywhere unless you explicitly enable Google Drive sync.
                </p>
            </section>

            <section className="Privacy__Section">
                <h3>Google Drive sync</h3>
                <p>
                    Syncing to Google Drive is entirely optional. When enabled,
                    your data is sent over HTTPS to your own Google Drive
                    account. There is no access to your Google Drive files from
                    outside your account. You can disconnect sync at any time in
                    the Settings page, which removes the local access token
                    without deleting your Drive data.
                </p>
            </section>

            <section className="Privacy__Section">
                <h3>Security</h3>
                <p>
                    Data synced to Google Drive is encrypted in transit using
                    HTTPS. Local data is protected by your browser&apos;s
                    standard sandbox. No backend server is operated, so there is
                    no central database to breach.
                </p>
            </section>

            <section className="Privacy__Section">
                <h3>Your rights</h3>
                <p>
                    You own your data. Everything can be exported as a JSON file
                    at any time from Settings. All local data can also be
                    cleared or the app fully reset. If you have used Google
                    Drive sync, your backup remains in your Drive and is under
                    your full control.
                </p>
            </section>

            <section className="Privacy__Section">
                <h3>Changes to this policy</h3>
                <p>
                    If this policy is updated, the effective date at the top of
                    this page will be changed. Occasional review is encouraged.
                </p>
            </section>

            <section className="Privacy__Section">
                <h3>Contact</h3>
                <p>
                    If you have questions about this privacy policy, please
                    reach out through the contact information provided in the
                    app.
                </p>
            </section>
        </div>
    )
}
