import { mrtLines } from "./MrtMinigame.ts";
import "./MrtMinigame.css";
import { useEffect, useRef, useState } from "react";
import HintDropdown from "./hintComponent/HintDropdown.tsx";

interface MrtMinigameProps {
    displayMinigame: boolean;
    setDisplayMinigame: React.Dispatch<React.SetStateAction<boolean>>;
}

function MrtMinigame({ displayMinigame, setDisplayMinigame }: MrtMinigameProps) {
    const divRef = useRef<HTMLDivElement | null>(null);
    const guessMsg = useRef<HTMLParagraphElement | null>(null);
    const fadeTimeout = useRef<number | null>(null);
    const hideTimeout = useRef<number | null>(null);
    const mrtArray = useRef<Array<string>>([]);
    const [attempts, setAttempts] = useState(0);
    const [userGuess, setUserGuess] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [showGiveUp, setShowGiveUp] = useState(false);
    const [revealAnswer, setRevealAnswer] = useState(false);
    const [hintVisibility, setHintVisibility] = useState([false, false, false, false]);
    const [mrt, setMrt] = useState(() => getMrt());
    useEffect(() => {
        if ((displayMinigame || !mrt) && divRef.current) {
            divRef.current.scrollTop = 0;
        }
    }, [displayMinigame, mrt]);
    function getMrt() {
        const arr = [...mrtLines];
        const availableMrt = arr.filter(line => !mrtArray.current.includes(line.station));
        if (availableMrt.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * availableMrt.length);
        const selectedMrt = availableMrt[randomIndex];
        const hint4 = generateHint4(selectedMrt.station);
        return {
            mrtUrl: selectedMrt.url,
            station: selectedMrt.station,
            imgWidth: selectedMrt.width,
            hint1: selectedMrt.hint1,
            hint2: selectedMrt.hint2,
            hint3: selectedMrt.hint3,
            hint4: hint4
        };
    };
    function generateHint4(mrt: string): string {
        const chars = mrt.split("");
        return chars.map(char => {
            if (char === " ") return " ";
            return Math.random() < 0.6 ? "_" : char;
        }).join(" ");
    }
    function exitMinigame() {
        setDisplayMinigame(false);
        setTimeout(() => {
            mrtArray.current = [];
            resetRound();
        }, 400)
    };
    function guessMRT() {
        if (guessMsg.current) {
            if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
            guessMsg.current.style.display = "block";
            guessMsg.current.classList.add("show");
            if (userGuess.trim() === "") {
                setMessage("Guess Cannot Be Empty!");
                setMessageColor("#E1251B");
                fadeTimeout.current = window.setTimeout(() => {
                    guessMsg.current!.classList.remove("show");
                }, 1000);
                hideTimeout.current = window.setTimeout(() => {
                    guessMsg.current!.style.display = "none";
                }, 3000);
            } else if (userGuess.toLowerCase() !== mrt!.station.toLowerCase()) {
                setMessage("Incorrect Guess!");
                setMessageColor("#E1251B");
                if (attempts < 2) {
                    fadeTimeout.current = window.setTimeout(() => {
                        guessMsg.current!.classList.remove("show");
                    }, 1000);
                    hideTimeout.current = window.setTimeout(() => {
                        guessMsg.current!.style.display = "none";
                    }, 3000);
                } else {
                    setShowGiveUp(true);
                }
            } else if (userGuess.toLowerCase() === mrt!.station.toLowerCase()) {
                setMessage(`Correct Guess! Answer: `);
                setMessageColor("#00953B");
                setRevealAnswer(true);
                setShowGiveUp(false);
                mrtArray.current.push(mrt!.station);
            }
        }
        setAttempts(prev => prev + 1);
    };
    function giveUp() {
        setMessage(`Correct Answer: `);
        setShowGiveUp(false);
        setRevealAnswer(true);
        mrtArray.current.push(mrt!.station);
    };
    function resetRound() {
        const nextMrt = getMrt();
        setMrt(nextMrt);
        setHintVisibility([false, false, false, false]);
        setAttempts(0);
        setUserGuess("");
        setRevealAnswer(false);
        setShowGiveUp(false);
        setMessage("");
        setMessageColor("");
        if (guessMsg.current) {
            guessMsg.current.style.display = "none";
        }
    };
    function toggleHint(index: number) {
        setHintVisibility(prev => {
            const newVisiblity = [...prev];
            newVisiblity[index] = !newVisiblity[index];
            return newVisiblity;
        });
    };
    return (
        <>
            <div id="minigameScreen" ref={divRef} style={{ opacity: displayMinigame ? 1 : 0, zIndex: displayMinigame ? 20 : 0, transform: displayMinigame ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.95)" }}>
                <div id="minigameWrapper">
                    <div id="minigameContent">
                        {mrt && <img src={mrt.mrtUrl} style={{ width: mrt.imgWidth ? mrt.imgWidth : "100%", aspectRatio: "auto" }} />}
                        {!revealAnswer && mrt && <input type="text" id="mrtInput" placeholder="Enter Your Guess..." value={userGuess} onChange={(e) => { setUserGuess(e.target.value) }} onKeyDown={(e) => { if (e.key === "Enter") guessMRT(); }} disabled={!displayMinigame} />}
                        {mrt && <p style={{ color: messageColor }} ref={guessMsg} id="guessMsg">{message}{revealAnswer && <span id="mrtStation">{mrt.station}</span>} {showGiveUp && <span onClick={giveUp} id='giveUpText'>Don't Know Ah?</span>}</p>}
                        {mrt && <div className="buttons" id="actionBtns">
                            {revealAnswer ? (
                                <button onClick={resetRound} disabled={!displayMinigame}>Play Again</button>
                            ) : (
                                <>
                                    <button onClick={guessMRT} disabled={!displayMinigame}>Guess MRT!</button>
                                    <button onClick={resetRound} disabled={!displayMinigame}>Refresh MRT</button>
                                </>
                            )}
                        </div>}
                        {mrt &&
                            <div id="allHintsWrapper" className="textColor">
                                <HintDropdown label="Hint 1 - MRT Location?" content={mrt.hint1} hintType="location" opened={hintVisibility[0]} onToggle={() => toggleHint(0)} displayMinigame={displayMinigame} />
                                <HintDropdown label="Hint 2 - Estimated Cardinal Direction?" content={mrt.hint2} hintType="direction" opened={hintVisibility[1]} onToggle={() => toggleHint(1)} displayMinigame={displayMinigame} />
                                <HintDropdown label="Hint 3 - Bus Interchange?" content={mrt.hint3} hintType="interchange" opened={hintVisibility[2]} onToggle={() => toggleHint(2)} displayMinigame={displayMinigame} />
                                <HintDropdown label="Hint 4 - MRT Name?" content={mrt.hint4} hintType="name" opened={hintVisibility[3]} onToggle={() => toggleHint(3)} displayMinigame={displayMinigame} />
                            </div>}
                        {!mrt &&
                            <div className="textColor" id="mrtCompletionDisplay">
                                <div id="headingDisplay">
                                    <img src={"/Mrtgame.jpg"} />
                                    <span id="headerText">YOU ARE AMAZING! :D</span>
                                </div>
                                <div id="completionText">
                                    <span>Wow, I can't believe you managed to guess all MRTs provided in the game!</span>
                                    <span>Thanks for playing, and if you still have some more time to spare, please help me complete a feedback form about ExploreSG:</span>
                                    <a style={{ color: "blue", opacity: 0.8 }}
                                        href="https://forms.gle/yn66jgd7xAipMxiT8"
                                        target="_blank" rel="noopener noreferrer">
                                        <b>https://forms.gle/yn66jgd7xAipMxiT8</b>
                                    </a>
                                    <span style={{ fontStyle: "italic" }}>(Also if you want to flex, you can send me the screenshot of this screen to show me you have finished the game :v)</span>
                                </div>
                            </div>}
                        <div className="buttons">
                            <button onClick={exitMinigame} disabled={!displayMinigame}>Exit Minigame</button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default MrtMinigame