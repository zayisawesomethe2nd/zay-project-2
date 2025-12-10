const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const BuildList = (props) => {
    const [builds, setBuilds] = useState(props.builds);

    // We also determine if we are on the public build view or personal build view here.
    useEffect(() => {
        const loadBuildsFromServer = async () => {
            let endpoint;
            if (props.publicViewer) {
                console.log("getting public builds")
                endpoint = '/getPublicBuilds';
            } else {
                console.log("getting personal builds")
                endpoint = '/getBuilds';
            }

            const response = await fetch(endpoint);
            const data = await response.json();
            setBuilds(data.builds);
        };
        loadBuildsFromServer();
    }, [props.reloadBuilds, props.publicViewer]);

    if (builds.length === 0) {
        return (
            <div className="buildList">
                <div className="empty-build-container">
                    <h3 className="empty-build">No Builds Yet!</h3>
                    <h2 className="empty-build-sub">Why not make one?</h2>
                </div>
            </div>
        );
    }

    const buildNodes = builds.map(build => (
        <div key={build._id} className="build">

            <div className="build-left">
                <img src={`https://ddragon.leagueoflegends.com/cdn/15.23.1/img/champion/${build.champion}.png`} alt={build.champion} className="build-face" />
                <h3 className="build-champion">{build.champion}</h3>
            </div>

            <div className="build-right">
                <h2 className="build-title">{build.name}</h2>
                <p className="build-description">{build.desc}</p>

                <div className="build-runes-items-skills">
                    <div className="rune-columns">

                        <div className="rune-column">
                            <div className="rune-row">
                                <div className="rune-block">
                                    {build.runes.primary?.path && (
                                        // Determines whether we use an empty slot icon, or an actual rune image
                                        <img
                                            className="rune-icon"
                                            src={`/assets/img/${build.runes.primary.path.toLowerCase()}.png`}
                                            alt={build.runes.primary.path}
                                        />
                                    )}
                                    {!build.runes.primary?.path && <div className="viewer-empty-rune-slot" />}
                                </div>

                                <div className="rune-block">
                                    {build.runes && build.runes.primary && build.runes.primary.keystone && (
                                        // same here, determining empty or not.
                                        <img
                                            className="rune-icon"
                                            src={`https://raw.communitydragon.org/latest/game/assets/perks/styles/${build.runes.primary.path.toLowerCase()}/${build.runes.primary.keystone.toLowerCase()}/${build.runes.primary.keystone.toLowerCase()}.png`}
                                            alt={build.runes.primary.keystone}
                                        />
                                    )}
                                    {(!build.runes || !build.runes.primary || !build.runes.primary.keystone) && (
                                        <div className="viewer-empty-rune-slot" />
                                    )}
                                </div>
                            </div>

                            <div className="rune-row">
                                {Array.from({ length: 3 }).map((_, i) => {
                                    const minor = build.runes?.primary?.minors?.[i] || null;
                                    return (
                                        <div key={i} className="rune-block">
                                            {(() => {
                                                if (minor) {
                                                    return (
                                                        <img
                                                            className="rune-icon"
                                                            src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${minor.icon.toLowerCase()}`}
                                                            alt={minor.key}
                                                        />
                                                    );
                                                } else {
                                                    return <div className="viewer-empty-rune-slot" />;
                                                }
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rune-column">
                            <div className="rune-row">
                                <div className="rune-block">
                                    {(() => {
                                        if (build.runes?.secondary?.path) {
                                            return (
                                                <img
                                                    className="rune-icon"
                                                    src={`/assets/img/${build.runes.secondary.path.toLowerCase()}.png`}
                                                    alt={build.runes.secondary.path}
                                                />
                                            );
                                        } else {
                                            return <div className="viewer-empty-rune-slot" />;
                                        }
                                    })()}
                                </div>
                            </div>


                            <div className="rune-row">
                                {Array.from({ length: 2 }).map((_, i) => {
                                    const minor = build.runes?.secondary?.minors?.[i] || null;
                                    return (
                                        <div key={i} className="rune-block">
                                            {minor && (
                                                <img
                                                    className="rune-icon"
                                                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${minor.icon.toLowerCase()}`}
                                                    alt={minor.key}
                                                />
                                            )}
                                            {!minor && <div className="viewer-empty-rune-slot" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {build.items?.length > 0 && (
                        <div className="item-container">
                            <div className="item-grid">
                                {build.items.map((itemID, i) => (
                                    <div key={i} className="item-block">
                                        {itemID && (
                                            <img
                                                className="item-icon"
                                                src={`https://ddragon.leagueoflegends.com/cdn/15.23.1/img/item/${itemID}.png`}
                                                alt={`Item ${itemID}`}
                                            />
                                        )}
                                        {!itemID && <div className="viewer-empty-item-slot" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="skills-container">
                        <div className="build-skills">
                            {Array.from({ length: 18 }).map((_, i) => {
                                const skill = build.skillPoints?.[i] || '';
                                return (
                                    <div key={i} className="skill-cell">
                                        <span className="skill-letter-viewer">{skill}</span>
                                        <span className="skill-level">{i + 1}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
            {!props.publicViewer && (
                <button
                    className="delete-button"
                    onClick={() => helper.sendDelete('/unmaker', { id: build._id }, props.triggerReload)}
                >
                    <img src="/assets/img/garbage.png" alt="delete button" />
                </button>
            )}
        </div>
    ));

    return (
        <div className="build-list">
            {buildNodes}
        </div>
    );
};


// personal viewer
const App = () => {
    const [reloadBuilds, setReloadBuilds] = useState(false);

    return (
        <div className="build-page">
            <h1 className="app-header">Personal Builds</h1>
            <div id="builds">
                <BuildList
                    builds={[]}
                    reloadBuilds={reloadBuilds}
                    triggerReload={() => setReloadBuilds(!reloadBuilds)}
                    publicViewer={false} />
            </div>
            <div className="make-build-outside">
                <button onClick={() => window.location.href = '/buildMaker'} className="build-maker-button">
                    Make a Build
                </button>
            </div>

        </div>
    );
};

// public viewer
const PublicApp = () => {
    return (
        <div>
            <h1 className="app-header">Public Builds</h1>
            <div id="builds">
                <BuildList builds={[]} publicViewer={true} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));

    // check if we are public
    if (window.location.pathname === '/publicViewer') {
        root.render(<PublicApp />);
    } else {
        root.render(<App />);
    }
};

window.onload = init;