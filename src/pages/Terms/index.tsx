import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import "./index.scss"
import BackBtn from "@/components/BackBtn"

export default function Terms() {
    useDocumentTitle("Terms of Service")
    return (
        <div className="Terms">
            <BackBtn />
            <h2 className="Terms__Title">Terms of Service</h2>
            <p className="Terms__Date">Effective April 23, 2026</p>

            <section className="Terms__Section">
                <h3>Acceptance of terms</h3>
                <p>
                    By using aijot, you agree to these terms. If you do not
                    agree, please do not use the app.
                </p>
            </section>

            <section className="Terms__Section">
                <h3>Data and sync</h3>
                <p>
                    The availability of Google Drive sync is not guaranteed
                    indefinitely, as it depends on Google&apos;s APIs and
                    policies. You are responsible for maintaining backups of
                    your data. Periodic use of the export feature is
                    recommended.
                </p>
            </section>

            <section className="Terms__Section">
                <h3>Termination</h3>
                <p>
                    You can stop using aijot and delete your data at any time.
                    Use the Clear all data or Reset app options in Settings. If
                    you have Google Drive backups, you can delete those directly
                    from your Google Drive.
                </p>
            </section>

            <section className="Terms__Section">
                <h3>Disclaimer</h3>
                <p>
                    Aijot is provided as is, without warranties of any kind. No
                    liability is assumed for data loss or damages arising from
                    your use of the app. Because your data lives primarily on
                    your device, you are responsible for keeping it safe.
                </p>
            </section>

            <section className="Terms__Section">
                <h3>Changes to these terms</h3>
                <p>
                    These terms may be updated from time to time. Changes will
                    be reflected by updating the effective date above. Continued
                    use of the app after changes means you accept the updated
                    terms.
                </p>
            </section>
        </div>
    )
}
