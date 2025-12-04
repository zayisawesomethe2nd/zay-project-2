const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// Specifically for creating builds, which is on it's own page separate from where builds are stored.
const BuildForm = (props) => {
    return(
        <form id="buildForm"
            onSubmit={(e) => handleBuild(e, props.triggerReload, props.setSkillPoints)}
            name="buildForm"
            action="/buildMaker"
            method="POST"
            className="buildForm"
        >
            <div>
                <label htmlFor="name">Name: </label>
                <input id="buildName" type="text" name="name" placeholder="Build Name" />
                <label htmlFor="champion">Champion: </label>
                <select id="buildChampion" name="champion" defaultValue="">
                <option value="" disabled>Choose your champion</option>
                {props.champions.map((champ) => (
                  // attaches an id to each champion
                  <option key={champ.id} value={champ.id}>{champ.name}</option>
                ))}
                </select>                
                <input onClick={() => window.location.href = '/viewer'} className="makeBuildSubmit" type="submit" value="Make Build" />
                <label htmlFor="publicBuild">Public? </label>
                <input id="publicBuild" type="checkbox" name="public" />
            </div>
            <div>
                <label htmlFor="desc">Description: </label>
                <textarea id="buildDesc" name="desc" placeholder="Build Description" rows="3"/>
            </div>
            <SkillSelector levels={18} onChange={props.setSkillPoints} />
        </form>
    );
};

const handleBuild = (e, onBuildAdded, skillPoints) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#buildName').value;
    const champion = e.target.querySelector('#buildChampion').value;
    const desc = e.target.querySelector('#buildDesc').value;
    const publicBuild = e.target.querySelector('#publicBuild').checked;

    if(!name || !champion) {
        helper.handleError('Both name and champion are required!');
        return false;
    }

    helper.sendPost(e.target.action, {name, champion, desc, skillpoints: skillPoints, publicBuild}, onBuildAdded);
    return false;
};

const SkillSelector = ({ levels = 18, onChange }) => {
  const abilities = ['Q', 'W', 'E', 'R'];
  const [selection, setSelection] = useState(Array(levels).fill(null));

  const handleSelect = (levelIndex, skill) => {
    const newSelection = [...selection];
    newSelection[levelIndex] = skill;
    setSelection(newSelection);
    if (onChange) onChange(newSelection);
  };

  return (
    <table className="skillTable">
      <thead>
        <tr>
          <th>Level</th>
          {abilities.map((a) => (
            <th key={a}>{a}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: levels }).map((_, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            {abilities.map((skill) => (
              <td key={skill}>
                <input
                  type="radio"
                  name={`level-${i}`}
                  value={skill}
                  checked={selection[i] === skill}
                  onChange={() => handleSelect(i, skill)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const BuildMaker = () => {
    const[reloadBuilds, setReloadBuilds] = useState(false);
    const[skillPoints, setSkillPoints] = useState([]);
    const [champions, setChampions] = useState([]);

    useEffect(() => {
    const fetchChampions = async () => {
        const res = await fetch('/api/champions');
        const data = await res.json();
        console.log(data);
        setChampions(data.champions);
    };
    fetchChampions();
    }, []);

    return (
        <div>
            <div id="makeBuilds">
                <BuildForm triggerReload={() => setReloadBuilds(!reloadBuilds)} 
                skillPoints={skillPoints}
                setSkillPoints={setSkillPoints}
                champions={champions}
                />
            </div>
        </div>
    );
};



const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <BuildMaker /> );
};

window.onload = init;