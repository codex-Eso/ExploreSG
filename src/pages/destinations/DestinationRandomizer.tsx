import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { allLocations } from "./locations.ts";
import { shuffleLogic } from "../../components/shuffleLogic.ts";
import { LocType } from "./locationType.ts";
import { bgImages } from "./bgImage.js";
import { messages } from "../../components/profile/shortMessage.js";
import "./DestinationRandomizer.css";
import ProfileDisplay from "../../components/profile/ProfileDisplay.tsx";
import MrtMinigame from "../../components/guessTheMrt/MrtMinigame.tsx";

function Destination() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [spin, setSpin] = useState(false);
    const [reviewCompletion, setReviewCompletion] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [resultDesc, setResultDesc] = useState<string | null>(null);
    const [accessRating, setAccessRating] = useState<{ rating: number; reason: string } | undefined>(undefined);
    const [sceneryRating, setSceneryRating] = useState<{ rating: number; reason: string } | undefined>(undefined);
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [remarks, setRemarks] = useState<string | undefined>(undefined);
    const [mapLoc, setMapLoc] = useState<string | undefined>(undefined);
    const [showResult, setShowResult] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lastInteraction, setLastInteraction] = useState(0);
    const [locations, setLocations] = useState<LocType[]>(() => shuffleLogic(allLocations).slice(0, 8));
    const [backgroundImages, setBackgroundImages] = useState(() => shuffleLogic(bgImages));
    const [shortMessages, setShortMessages] = useState(() => shuffleLogic(messages));
    const [backgroundIndex, setBackgroundIndex] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [spinDegree, setSpinDegree] = useState(0);
    const [showAccessReason, setShowAccessReason] = useState(false);
    const [showSceneryReason, setShowSceneryReason] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const selectedLocation = locations.find(l => l.name === result);
    const profileRef = useRef<HTMLDivElement | null>(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showMsg, setShowMsg] = useState(false);
    const [displayProfile, setDisplayProfile] = useState(false);
    const [displayMinigame, setDisplayMinigame] = useState(false);
    useEffect(() => {
        const img = new Image();
        img.src = backgroundImages[0].imageUrl;
    }, [backgroundImages]);
    function goToImage(newIndex: number, direction: 'left' | 'right') {
        setSlideDirection(direction);
        setCurrentImageIndex(newIndex);
        setLastInteraction(Date.now());
    };
    useLayoutEffect(() => {
        if (isMobile) {
            if (profileRef.current) {
                profileRef.current.style.top = "0";
                profileRef.current.style.bottom = "auto";
            }
        } else if (!isMobile) {
            if (profileRef.current) {
                profileRef.current.style.bottom = "0";
                profileRef.current.style.top = "auto";
            }
        }
    }, [isMobile]);
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setShowProfile(true);
        }, 3000);
        const timer2 = setTimeout(() => {
            setShowMsg(true);
        }, 4000);
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }
        window.addEventListener("resize", handleResize);
        const interval1 = setInterval(() => {
            setBackgroundIndex(prev => (prev + 1) % backgroundImages.length);
        }, 5000);
        const interval2 = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % shortMessages.length);
        }, 10000);
        return () => {
            clearInterval(interval1)
            clearInterval(interval2);
            clearTimeout(timer1)
            clearTimeout(timer2);
            window.removeEventListener("resize", handleResize);
        }
    }, [])
    useEffect(() => {
        if (!showResult || !result) return;
        const images = selectedLocation?.images;
        if (!images) return;
        let interval: ReturnType<typeof setInterval>;
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                setSlideDirection('right');
                setCurrentImageIndex(prev => (prev + 1) % images.length);
            }, 4000);
        }, 2000);
        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [showResult, result, lastInteraction]);
    function handleTouchStart(e: React.TouchEvent) {
        setTouchStart(e.targetTouches[0].clientX);
    };
    function handleTouchMove(e: React.TouchEvent) {
        setTouchEnd(e.targetTouches[0].clientX);
    };
    function handleTouchEnd(imagesLength: number) {
        const distance = touchStart - touchEnd;
        if (distance > 50) {
            goToImage((currentImageIndex + 1) % imagesLength, 'right');
        }
        if (distance < -50) {
            goToImage((currentImageIndex - 1 + imagesLength) % imagesLength, 'left');
        }
    };
    const compassRef = useRef<HTMLImageElement | null>(null);
    const needleRef = useRef<HTMLImageElement | null>(null);
    function spinLogic() {
        if (spin) return;
        const segmentCount = 8;
        const segmentAngle = 360 / segmentCount;
        setSpin(true);
        const spinAmount = Math.ceil(Math.random() * 1000) + 1000;
        if (needleRef.current && compassRef.current) {
            needleRef.current.style.transform = `rotate(${spinDegree + spinAmount}deg)`;
            compassRef.current.style.transform = `rotate(${(0 - (spinDegree + spinAmount)) * 0.5}deg)`;
        }
        setSpinDegree(spinDegree + spinAmount);
        setTimeout(() => {
            const finalRotation = (spinDegree + spinAmount) % 360;
            const pointerAngle = (360 - finalRotation) % 360;
            const index = Math.floor((pointerAngle + segmentAngle / 2) / segmentAngle) % segmentCount;
            const selectedPlace = locations[index];
            setSpin(false);
            setReviewCompletion(selectedPlace.reviewStatus);
            setResult(selectedPlace.name);
            setResultDesc(selectedPlace.description);
            setAccessRating(selectedPlace.accessibility);
            setSceneryRating(selectedPlace.scenery);
            setRating(selectedPlace.rating);
            setRemarks(selectedPlace.remarks);
            setMapLoc(selectedPlace.mapLocation);
            setShowResult(true);
            setCurrentImageIndex(0);
        }, 3100);
    }
    const resultScreen = useRef<HTMLDivElement | null>(null);
    const textSpacing = useRef<HTMLDivElement | null>(null);
    function respin() {
        setTimeout(() => {
            isMobile ? resultScreen.current!.scrollTop = 0 : textSpacing.current!.scrollTop = 0;
            spinLogic();
        }, 100);
        setShowResult(false);
        setShowAccessReason(false);
        setShowSceneryReason(false);
    }
    function refreshOptions() {
        alert("New locations allocated to the spinner!");
        window.location.reload();
    }
    function closeResult() {
        setShowResult(false);
        setResult(null);
        setResultDesc(null);
        setAccessRating(undefined);
        setSceneryRating(undefined);
        setRating(undefined);
        setRemarks(undefined);
        setMapLoc(undefined);
        setReviewCompletion(null);
        setCurrentImageIndex(0);
        setSlideDirection(null);
        setShowAccessReason(false);
        setShowSceneryReason(false);
        setLastInteraction(0);
        setSpin(false);
        setTimeout(() => {
            isMobile ? resultScreen.current!.scrollTop = 0 : textSpacing.current!.scrollTop = 0;
        }, 100);
    }
    function mapsLink() {
        if (mapLoc || result) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLoc ?? result ?? "")}`;
        }
    }
    function starRatings(rating: number) {
        if (!rating) return null;
        const stars = [];
        const starRating = rating;
        for (let i = 1; i <= 5; i++) {
            if (starRating >= i) {
                stars.push(
                    <div className="star-wrapper" key={i}>
                        <div className="base"></div>
                        <div className="fill full"></div>
                    </div>
                );
            } else if (starRating >= i - 0.5) {
                stars.push(
                    <div className="star-wrapper" key={i}>
                        <div className="base"></div>
                        <div className="fill half"></div>
                    </div>
                );
            } else {
                stars.push(
                    <div className="star-wrapper" key={i}>
                        <div className="star base"></div>
                    </div>
                );
            }
        }
        return stars;
    }
    function openProfile() {
        if (!showProfile) return;
        setDisplayProfile(true);
    }
    return (
        <div className="wrapper" style={{ background: `url("${backgroundImages[backgroundIndex].imageUrl}") center/cover no-repeat` }}>
            <div id="randomizer" style={{ opacity: showResult || displayProfile || displayMinigame ? 0.25 : 1 }}>
                <div className="header">
                    <h2>ExploreSG</h2>
                    <p>Destination Randomizer</p>
                </div>
                <div className="randomizerWrapper">
                    <button id="spin" onClick={spinLogic} disabled={spin}></button>
                    <img className='compass' src="/Compass.png" ref={compassRef}></img>
                    <img className="needle" src="/Needle.png" ref={needleRef}></img>
                </div>
            </div>
            <div className="bgText" style={{ opacity: showResult || displayProfile || displayMinigame ? 0.25 : 1 }}>
                <i><h4 id="bgText">{backgroundImages[backgroundIndex].bgName}</h4></i>
            </div>
            <div id="profileWrapper" ref={profileRef}>
                <span id="profileMsg" style={{ opacity: showMsg && !spin ? (showResult || displayProfile || displayMinigame ? 0.25 : 1) : 0 }}>{shortMessages[messageIndex]}</span>
                <button id="profileBtn" style={{ opacity: showProfile ? (showResult || displayProfile || displayMinigame ? 0.25 : 1) : 0, cursor: showProfile ? (spin ? "not-allowed" : (showResult || displayProfile || displayMinigame ? "default" : "pointer")) : "default" }} onClick={openProfile} disabled={spin || showResult || displayProfile || displayMinigame}>
                </button>
            </div>
            <div ref={resultScreen} id="resultScreen" style={{ opacity: showResult ? 1 : 0, zIndex: showResult ? 20 : 0, transform: showResult ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.95)" }}>
                <div id="resultWrapper">
                    <div id="imageColumn">
                        {result && selectedLocation?.images ? (
                            <div className="imageBox">
                                <div
                                    className="custom-carousel"
                                    onTouchStart={isMobile ? handleTouchStart : undefined}
                                    onTouchMove={isMobile ? handleTouchMove : undefined}
                                    onTouchEnd={isMobile ? () => selectedLocation.images && handleTouchEnd(selectedLocation.images?.length) : undefined}
                                >
                                    {(() => {
                                        const images = selectedLocation.images;
                                        const current = images[currentImageIndex];
                                        return (
                                            <>
                                                <img
                                                    key={currentImageIndex}
                                                    src={current.imageUrl}
                                                    alt={current.caption}
                                                    className={`carousel-img slide-${slideDirection}`}
                                                />
                                                <div key={`overlay-${currentImageIndex}`} className={`carousel-overlay slide-${slideDirection}`}>
                                                    <p>{current.caption}</p>
                                                </div>
                                                <button
                                                    className="carousel-btn left"
                                                    onClick={() => goToImage((currentImageIndex - 1 + images.length) % images.length, 'left')}
                                                >
                                                    ‹
                                                </button>
                                                <button
                                                    className="carousel-btn right"
                                                    onClick={() => goToImage((currentImageIndex + 1) % images.length, 'right')}
                                                >
                                                    ›
                                                </button>
                                                <div className="carousel-dots">
                                                    {images.map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`dot ${i === currentImageIndex ? "active" : ""}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div id="noImage" className="imageBox" style={{ display: "grid", placeContent: "center", background: "#ddd" }}><span>No Image</span></div>
                        )}
                        {reviewCompletion === "incompleted" && (
                            <div className="incompleteReview">
                                🚧 Review still ongoing — stay tuned! 🚧
                            </div>
                        )}
                    </div>
                    <div id="textSpacing" ref={textSpacing}>
                        <p id="result">{result}</p>
                        {result && (
                            <p id="mapsBtn">
                                📍
                                <a style={{ color: "blue", opacity: 0.65 }}
                                    href={mapsLink()}
                                    target="_blank" rel="noopener noreferrer">
                                    <b>Open in Google Maps</b>
                                </a>
                            </p>
                        )}
                        <p id="description">{resultDesc}</p>
                        {accessRating && (
                            <div id="ratingContent">
                                <div id="starContent">
                                    <div id="Rating">Accessibility:</div>
                                    <div className="starRatings">{starRatings(accessRating.rating)}</div>
                                </div>
                                <p style={{ color: "blue", textDecoration: "underline", cursor: "pointer", textAlign: "center", width: "fit-content", opacity: 0.8 }} onClick={() => setShowAccessReason(prev => !prev)} id="showText">{showAccessReason ? "Show Less" : "Show More"}</p>
                                {showAccessReason && <p style={{ color: "#1B3A57", marginTop: 10 }} id="Reason">Reason: {accessRating.reason}</p>}
                            </div>
                        )}
                        {sceneryRating && (
                            <div id="ratingContent">
                                <div id="starContent">
                                    <div id="Rating">Scenery:</div>
                                    <div className="starRatings">{starRatings(sceneryRating.rating)}</div>
                                </div>
                                <p style={{ color: "blue", textDecoration: "underline", cursor: "pointer", textAlign: "center", width: "fit-content", opacity: 0.8 }} onClick={() => setShowSceneryReason(prev => !prev)} id="showText">{showSceneryReason ? "Show Less" : "Show More"}</p>
                                {showSceneryReason && <p style={{ color: "#1B3A57", marginTop: 10 }} id="Reason">Reason: {sceneryRating.reason}</p>}
                            </div>
                        )}
                        <div id="starContent">
                            <div id="rating">Overall Rating:</div>
                            {rating ? <div className="starRatings">{starRatings(rating)}</div> : <p style={{ marginLeft: "5px", fontWeight: "bold", textDecoration: "underline", fontSize: "clamp(17px, 6vw, 20px)" }}>???</p>}
                        </div>
                        {remarks && (
                            <div>
                                <p id="remarks">Additional Remarks:</p>
                                <p id="remarks">{remarks}</p>
                            </div>
                        )}
                        <div className="buttons">
                            <button id="respinBtn" onClick={respin} disabled={!showResult || displayProfile || displayMinigame}>Explore Again</button>
                            <button id="refreshBtn" onClick={refreshOptions} disabled={!showResult || displayProfile || displayMinigame}>Refresh Locations</button>
                            <button id="closeBtn" onClick={closeResult} disabled={!showResult || displayProfile || displayMinigame}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <ProfileDisplay displayProfile={displayProfile} setDisplayProfile={setDisplayProfile} setDisplayMinigame={setDisplayMinigame} />
            <MrtMinigame displayMinigame={displayMinigame} setDisplayMinigame={setDisplayMinigame} />
        </div >
    )
}

export default Destination