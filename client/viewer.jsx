const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');




const BuildList = (props) => {
    const [builds, setBuilds] = useState(props.builds);

    useEffect(() => {
        const loadBuildsFromServer = async () => {
            const response = await fetch('/getBuilds');
            const data = await response.json();
            setBuilds(data.builds);
        };
        loadBuildsFromServer();
    }, [props.reloadBuilds]);

    if (builds.length === 0) {
        return (
            <div className="buildList">
                <div class="build">
                    <h3 className="emptyBuild">No Builds Yet!</h3>
                    <h2 className="emptyBuildSub">Why not make one?</h2>
                    <button onClick={() => window.location.href = '/buildMaker'} className="buildMakerButton">
                        Make a Build
                    </button>
                </div>
            </div>
        );
    };

    const buildNodes = builds.map(build => {
        return(
            <div key={build._id} className="build">
                <button 
                    className="deleteButton"
                    onClick={() => helper.sendDelete('/unmaker', { id: build._id }, props.triggerReload)}
                >X</button>

                <img src={build.spriteURL} alt="champion face" className="buildFace" />
                <h3 className="buildName">Name: {build.name}</h3>
                <h3 className="buildChampion">Champion: {build.champion}</h3>
                <h3 className="buildDesc">Description: {build.desc}</h3>
            </div>
        );
    });

    return (
        <div className="buildList">
            {buildNodes}
            <button onClick={() => window.location.href = '/buildMaker'} className="buildMakerButton">
                Make a Build
            </button>
        </div>
    );
};

const App = () => {
    const[reloadBuilds, setReloadBuilds] = useState(false);

    return (
        <div>
            <div id="builds">
                <BuildList builds={[]} reloadBuilds={reloadBuilds} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App /> );
};

window.onload = init;