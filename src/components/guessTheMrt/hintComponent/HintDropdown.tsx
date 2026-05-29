interface HintDropdownProps {
    label: string;
    content: string | boolean;
    hintType: "location" | "direction" | "interchange" | "name";
    opened: boolean;
    onToggle: () => void;
    displayMinigame: boolean;
}

function HintDropdown({ label, content, hintType, opened, onToggle, displayMinigame }: HintDropdownProps) {
    return (
        <div className="hintWrapper">
            <button className="hintToggle textColor" onClick={onToggle} disabled={!displayMinigame}>
                <span>{label}</span><span>{opened ? "▲" : "▼"}</span>
            </button>
            {opened && (
                <div className="hintContent">
                    {hintType == "interchange"
                        ? content
                            ? "HAS a bus interchange"
                            : "DOES NOT have a bus interchange"
                        : (hintType == "direction" ? `Located at the ${content} side of Singapore` : content)}
                </div>
            )}
        </div>
    )
}

export default HintDropdown