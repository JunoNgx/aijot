import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import "./index.scss"
import BackBtn from "@/components/BackBtn"

export default function Help() {
    useDocumentTitle("Help")
    return (
        <div className="Help">
            <BackBtn />
            <h2 className="Help__Title">Help</h2>

            <section className="Help__Section">
                <h3>Creating items</h3>
                <p>
                    Type into the main input and press Enter to create an item.
                    The item type is detected automatically, or you can use a
                    prefix to force it.
                </p>
                <ul>
                    <li>
                        <strong>Text</strong>: enter anything
                    </li>
                    <li>
                        <strong>Todo</strong>: <code>:td: Buy eggs</code>
                    </li>
                    <li>
                        <strong>Link</strong>: enter a URL-like text; e.g.{" "}
                        <code>mozilla.org</code>
                    </li>
                    <li>
                        <strong>Long text</strong>:{" "}
                        <code>:t: My novel draft</code>
                    </li>
                </ul>

                <p>
                    Append flags when creating an item to assign tags or
                    collections.
                </p>
                <ul>
                    <li>
                        <code>::tg design colour</code> - adds tags
                    </li>
                    <li>
                        <code>::col project</code> - adds to collection (which
                        is actually tags associated with the collection)
                    </li>
                </ul>
            </section>

            <section className="Help__Section">
                <h3>Searching</h3>
                <p>
                    Type in the main input without pressing Enter to filter
                    items.
                </p>
                <ul>
                    <li>Regular text - search from title and content</li>
                    <li>
                        <code>##work</code> - filter by tag
                    </li>
                    <li>
                        <code>::td::</code> - show only todos
                    </li>
                    <li>
                        <code>::link::</code> - show only links
                    </li>
                    <li>
                        <code>::itd::</code> / <code>::ctd::</code> - incomplete
                        / completed todos
                    </li>
                </ul>
            </section>

            <section className="Help__Section">
                <h3>Keyboard shortcuts</h3>
                <p>
                    Press <kbd>Ctrl/Cmd + /</kbd> to see the full list of
                    shortcuts. Common ones include navigation with arrow keys,
                    editing selected items, and opening the command palette.
                </p>
            </section>

            <section className="Help__Section">
                <h3>Collections</h3>
                <p>
                    Collections group items by tag and/or type. The three{" "}
                    <strong>core collections</strong> are always present, but
                    configureable:
                </p>
                <ul>
                    <li>
                        <strong>Everything</strong> - all items
                    </li>
                    <li>
                        <strong>Untagged</strong> - items with no tags
                    </li>
                    <li>
                        <strong>Trash</strong> - deleted items, purged after 7
                        days
                    </li>
                </ul>

                <p>
                    In addition to these, you can create your own collections
                    from:
                </p>
                <ul>
                    <li>CmdPalette</li>
                    <li>Collection dropdown</li>
                    <li>Collection list menu</li>
                </ul>
            </section>

            <section className="Help__Section">
                <h3>Deletion and trash</h3>
                <p>
                    Trashing an item moves it to the Trash collection, where it
                    can be restored at any time. Items in Trash are permanently
                    deleted after 7 days. Soft-deleted records are cleaned up
                    after 60 days.
                </p>
                <p>
                    To prevent out of sync across devices, sync to Google Drive
                    frequently, especially after making important changes.
                </p>
            </section>

            <section className="Help__Section">
                <h3>Sync and backup</h3>
                <p>
                    Connect Google Drive in Settings to back up your data. You
                    can also export everything as a JSON file, import from an
                    aijot or JustJot backup, or clear all local data from the
                    Settings page.
                </p>
            </section>
        </div>
    )
}
