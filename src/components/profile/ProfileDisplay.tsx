import { useEffect, useRef, useState } from "react";
import "./ProfileDisplay.css";

interface ProfileDisplayProps {
    displayProfile: boolean;
    setDisplayProfile: React.Dispatch<React.SetStateAction<boolean>>;
    setDisplayMinigame: React.Dispatch<React.SetStateAction<boolean>>;
}

function ProfileDisplay({ displayProfile, setDisplayProfile, setDisplayMinigame }: ProfileDisplayProps) {
    const profileRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (displayProfile && profileRef.current) {
            profileRef.current.scrollTop = 0;
        }
    }, [displayProfile]);
    function openMinigame() {
        setDisplayMinigame(true);
        setDisplayProfile(false);
    }
    return (
        <>
            <div id="profileScreen" ref={profileRef} className={displayProfile ? "profileOpen" : "profileClosed"}>
                <div id="profileDisplayWrapper">
                    <div id="greetingImage">
                        <img src={"/profile/Greeting-Image.jpg"} />
                    </div>
                    <div id="msgSpacing">
                        <p id="greetingMsg">HELLO!</p>
                        <p>Thanks for checking out my website! Hopefully as you continue to to use it, you'll be amazed at what Singapore has to offer HAHA!</p>
                        <p>As you may or may not know, I absolutely <b>LOVE</b> to walk, not just for the cardio, but also to explore different places in Singapore, cause I'm just adventurous like that.</p>
                        <p>How did this website idea come to life? One day, a voice inside my head said: <i>"Hey, you have some coding skills — why not build a website to showcase your adventures?"</i> And here we are :)...</p>
                        <p>Every photo and review are all from my own POVs and experience, so do be patient as I'll take some time to provide an honest review about each place!</p>
                        <p><i><b>Why are you still reading? Go spin a random location and start exploring!</b></i></p>
                        <p style={{ textAlign: "right" }}>- Esmond :))</p>
                        {displayProfile && (
                            <div className="buttons">
                                <button onClick={openMinigame} disabled={!displayProfile}>Play Minigame</button>
                                <button onClick={() => setDisplayProfile(false)} disabled={!displayProfile}>Close</button>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </>
    )
}

export default ProfileDisplay