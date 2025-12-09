const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// Specifically for creating builds, which is on it's own page separate from where builds are stored.
const BuildForm = (props) => {
  const [selectedChampion, setSelectedChampion] = React.useState(null);

  // When the champion is changed, change
  const handleChampionChange = (e) => {
    const champID = e.target.value;
    const champ = props.champions.find(c => c.id === champID);
    if (!champ) {
      console.error("Champion not found:", champID);
      setSelectedChampion(null);
      return;
    }
    setSelectedChampion(champ);
  };

  return (
    <form
      id="buildForm"
      onSubmit={(e) => handleBuild(e, props.triggerReload, props.skillPoints, props.runes, props.items)}
      name="buildForm"
      action="/buildMaker"
      className="buildForm"
    >
      <div className="champion-select-row">
        <div className="champion-left-column">
          {selectedChampion && (
            <img
              src={`https://raw.communitydragon.org/latest/game/assets/characters/${selectedChampion.id.toLowerCase()}/skins/base/${selectedChampion.id.toLowerCase()}loadscreen.png`}
              alt={selectedChampion.name}
              className="champion-banner"
              onError={(e) => {
                const fallbackUrls = [
                  `https://raw.communitydragon.org/latest/game/assets/characters/${selectedChampion.id.toLowerCase()}/skins/base/${selectedChampion.id.toLowerCase()}loadscreen_0.png`,
                  `https://raw.communitydragon.org/latest/game/assets/characters/${selectedChampion.id.toLowerCase()}/skins/base/${selectedChampion.id.toLowerCase()}loadscreen_0.${selectedChampion.id.toLowerCase()}.png`,
                  `https://raw.communitydragon.org/latest/game/assets/characters/${selectedChampion.id.toLowerCase()}/skins/base/${selectedChampion.id.toLowerCase()}loadscreen_0.${selectedChampion.id.toLowerCase()}vgu.png`,
                ];
                let currentIndex = fallbackUrls.indexOf(e.currentTarget.src);
                currentIndex = currentIndex + 1;
                if (currentIndex < fallbackUrls.length) {
                  e.currentTarget.src = fallbackUrls[currentIndex];
                } else {
                  e.currentTarget.onerror = null;
                }
              }}
            />
          )}

          {!selectedChampion && <div className="empty-champion-banner" />}


          <select
            id="buildChampion"
            name="champion"
            defaultValue=""
            onChange={handleChampionChange}
            className="champion-dropdown"
          >
            <option value="" disabled>Choose your champion</option>
            {props.champions.map((champ) => (
              <option key={champ.id} value={champ.id}>{champ.name}</option>
            ))}
          </select>
        </div>

        <div className="build-info">
          <div className="build-title-row">
            <input
              id="buildName"
              type="text"
              name="name"
              placeholder="What is your build called?"
              className="build-title"
            />
            <label htmlFor="publicBuild" className="public-label">Public?</label>
            <input id="publicBuild" type="checkbox" name="public" />
          </div>

          <textarea
            id="buildDesc"
            name="desc"
            placeholder="What makes your build unique or strong?"
            rows="10"
            className="build-desc"
          />
        </div>
      </div>

        <Descriptor
          title="Skill Selector"
          description="Here, you can select the order in which you want players to select their skills."
        />
        <SkillSelector levels={18} onChange={props.setSkillPoints} />

        <Descriptor
          title="Rune Selector"
          description="Here, you can select your primary rune path, keystones, minor runes, and shards."
        />
        <RuneSelector onChange={props.setRunes} />

        <Descriptor
          title="Item Selector"
          description="Here, you can create your item build."
        />
        <ItemSelector onChange={props.setItems} />

        <div className="form-buttons">
          <button
            type="button"
            className="cancel-build"
            onClick={() => window.location.href = '/viewer'}
          >Cancel Build</button>
          <input
            type="submit"
            className="make-build-submit"
            value="Create Build"
          />
      </div>
    </form>
  );
};


const handleBuild = (e, onBuildAdded, skillPoints, runes, items) => {
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

    // kind messy, but there is some info I want, and some I don't want to save.
    helper.sendPost(e.target.action, {
      name, 
      champion, 
      desc, 
      skillPoints: skillPoints, 
      // storing key and icons, since icons get really weird. 
      runes: {
        primary: {
          path: runes.primary.path.key || null,
          keystone: runes.primary.keystone.key || null,
          minors: runes.primary.minors.map(m => m ? { key: m.key, icon: m.icon } : null) || [],
        },
        secondary: {
          path: runes.secondary.path.key || null,
            minors: runes.secondary.minors?.map(m => m ? { key: m.key, icon: m.icon } : null) || [],

        },
        shards: runes.shards || [],
      },
      // no keys, so we use item id instead
      items: items.map(item => item ? item.id : null),
      publicBuild
    }, onBuildAdded);
    return false;
};

// Just for creating descriptors on each category of the builder. description unnecessary
const Descriptor = ({title, description}) => {
  if (!description) {
    return (
      <div className="descriptor">
        <h3>{title}</h3>
      </div>
    );
  } else {
    return (
      <div className="descriptor">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    );
  }

};

// a function for creating the skill point selector on the client side.
// While the next season is moving the level to 20 in an edge case, the skill
// should still cap out at 18.
const SkillSelector = ({ levels = 18, onChange }) => {

  // All skills, should never change between champs. I think.
  const skills = ['Q', 'W', 'E', 'R'];
  // Fills an array of length levels with null just to start with in our state.
  const [selection, setSelection] = useState(Array(levels).fill(null));

  // When the user checks something, it will be put into the correct position in the state array
  const handleSelect = (levelIndex, skill) => {
    // array spread syntax https://react.dev/learn/updating-arrays-in-state
    const newSelection = [...selection];
    newSelection[levelIndex] = skill;
    setSelection(newSelection);
    if (onChange) onChange(newSelection);
  };

  // table: https://mui.com/material-ui/react-table/
  return (
    <table className="skill-table">
      <thead>
        <tr>
          <th></th>
          {Array.from({ length: levels }).map((_, i) => (
            <th key={i}>{i + 1}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {skills.map((skill) => (
          <tr key={skill}>
            <td>{skill}</td>
            {Array.from({ length: levels }).map((_, levelIndex) => (
              <td key={levelIndex}>
                <div
                  className={`skill-box ${selection[levelIndex] === skill && ' selected'}`}
                  onClick={() => handleSelect(levelIndex, skill)}
                ><span className="skill-letter">{skill}</span></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// A function for creating the rune page selector on the client side.
const RuneSelector = ({ onChange }) => {
  // all rune paths
  const [runePaths, setRunePaths] = useState([]);

  // our primary path
  const [primaryPath, setPrimaryPath] = useState(null);
  // our primary keystone
  const [primaryKeystone, setPrimaryKeystone] = useState(null);
  // our three minor runes
  const [primaryMinors, setPrimaryMinors] = useState([null, null, null]);
  
  // our secondary path
  const [secondaryPath, setSecondaryPath] = useState(null);
  // our secondary minors
  const [secondaryMinors, setSecondaryMinors] = useState([null, null]);

  // rune shards. might have to do this manually
  const [runeShards, setRuneShards] = useState([null, null, null]);

  // fetching our data
  useEffect(() => {
    const fetchRunes = async () => {
      const res = await fetch('/api/runes');
      const data = await res.json();
      // alllll of our rune data
      setRunePaths(data.runes);
      console.log("Runes: ");
      console.log(data.runes);
    };
    fetchRunes();
  }, []);

  // When any of these change, update
  useEffect(() => {
    if (onChange) {
      onChange({
        primary: { path: primaryPath, keystone: primaryKeystone, minors: primaryMinors },
        secondary: { path: secondaryPath, minors: secondaryMinors },
        shards: runeShards,
      });
    }
  }, [primaryPath, primaryKeystone, primaryMinors, secondaryPath, secondaryMinors, runeShards]);

  return (
   <div className="rune-selector-column">
    <div className="primary-column">
      <div className="path-and-keystone">
        {primaryPath && (
          <img
            src={`assets/img/${primaryPath.key.toLowerCase()}.png`}
            alt={primaryPath.pathName}
            className="rune-path-img"
          />
        )}
        {!primaryPath && <div className="empty-rune-path-slot" />}

        {primaryKeystone && (
          <img
            src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${primaryKeystone.icon.toLowerCase()}`}
            alt={primaryKeystone.key}
            className="keystone-img"
          />
        )}
        {!primaryKeystone && <div className="empty-keystone-slot" />}
      </div>


      <RunePathDropdown
        runePaths={runePaths}
        selectedPath={primaryPath}
        // Reset keystone and minors
        onSelect={(path) => {
          setPrimaryPath(path);
          setPrimaryKeystone(null);
          setPrimaryMinors([null, null, null]);
        }}
      />
      <KeystoneDropdown
        key={null}
        keystones={primaryPath?.keystones || []}
        selectedKeystone={primaryKeystone}
        onSelect={setPrimaryKeystone}
      />

      <MinorRunesDropdown
        minors={primaryMinors}
        runeSlots={primaryPath?.minorRunes || []}
        onChange={setPrimaryMinors}
        primarySelected={!!primaryPath}
      />
    </div>

    <div className="secondary-column">
      <div className="path-and-keystone">
        {secondaryPath && (
          <img
            src={`assets/img/${secondaryPath.key.toLowerCase()}.png`}
            alt={secondaryPath.pathName}
            className="rune-path-img"
          />
        )}
        {!secondaryPath && <div className="empty-rune-path-slot" />}
      </div>


      <RunePathDropdown
        runePaths={runePaths.filter(path => path !== primaryPath)}
        selectedPath={secondaryPath}
        onSelect={(path) => {
          setSecondaryPath(path);
          setSecondaryMinors([null, null]);
        }}
      />

      <SecondaryMinorRunesDropdowns
        minors={secondaryMinors}
        runeSlots={secondaryPath?.minorRunes || []}
        secondaryPath={secondaryPath}
        onChange={setSecondaryMinors}
      />
    </div>
  </div>

  );

};

// Our Rune Path dropdown. For primary and secondaries.
const RunePathDropdown = ({ runePaths, selectedPath, onSelect }) => {
  return (
    <select
      value={selectedPath ? selectedPath.pathName : ""}
      onChange={(e) => {
        const path = runePaths.find(runePath => runePath.pathName === e.target.value);
        onSelect(path);
      }}
    >
      <option value="" disabled>Select path</option>
      {runePaths.map((path) => (
        <option key={path.pathName} value={path.pathName}>
          {path.pathName}
        </option>
      ))}
    </select>
  );
};


// Our Keystone dropdown.
const KeystoneDropdown = ({ keystones, selectedKeystone, onSelect }) => {
  return (
    <select
      value={selectedKeystone ? selectedKeystone.name : ""}
      onChange={(e) => {
        const keystone = keystones.find(keystone => keystone.name === e.target.value);
        onSelect(keystone);
      }}
    >
      <option value="" disabled>Select keystone</option>
      {keystones.map((keystone) => (
        <option key={keystone.key} value={keystone.name}>
          {keystone.name}
        </option>
      ))}
    </select>
  );
};

const MinorRunesDropdown = ({ minors, runeSlots, onChange, primarySelected }) => {
  const handleChange = (index, value) => {
    const newMinors = [...minors];
    newMinors[index] = runeSlots[index].find(rune => rune.name === value);
    onChange(newMinors);
  };

  return (
    <div className="minor-runes">
      <div className="minor-rune-icons">
        {minors.map((rune, index) => {
          if (rune) {
            return (
              <img
                key={index}
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${rune.icon.toLowerCase()}`}
                alt={rune.name}
                className="minor-rune-img"
              />
            );
          }
          return <div key={index} className="minor-rune-img" />;
        })}
      </div>

      <div className="minor-rune-dropdown">
        {minors.map((rune, index) => (
          <select
            key={index}
            value={rune?.name || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            disabled={!primarySelected} // <-- check primary path here
          >
            <option value="" disabled>Select minor rune</option>
            {runeSlots[index]?.map(rune => (
              <option key={rune.key} value={rune.name}>{rune.name}</option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
};




// Need a separate function since 
const SecondaryMinorRunesDropdowns = ({ minors, runeSlots, secondaryPath, onChange }) => {
  // Flatten rune slots for easy lookup
  const groupedRunes = runeSlots.map((slot, idx) =>
    slot.map(rune => ({ ...rune, group: idx + 1 }))
  );

  const handleSelect = (index, runeName) => {
    const selectedRune = groupedRunes.flat().find(rune => rune.name === runeName);
    const newMinors = [...minors];
    newMinors[index] = selectedRune;
    onChange(newMinors);
  };

  const secondarySelected = !!secondaryPath; // true if a secondary path is chosen

  return (
    <div className="minor-runes">
      <div className="minor-rune-icons">
        {minors.map((selected, index) => {
          // Only show image if a rune is selected
          if (selected) {
            return (
              <img
                key={index}
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/${selected.icon.toLowerCase()}`}
                alt={selected.name}
                className="minor-rune-img"
              />
            );
          }
          return <div key={index} className="minor-rune-img" />;
        })}
      </div>

      <div className="minor-rune-dropdown">
        {minors.map((selected, index) => {
          // for disabling specific groupings
          const otherIndex = (index + 1) % 2;
          const otherSelection = minors[otherIndex];

          return (
            // disabled unless secondary path is selected
            <select
              key={index}
              value={selected?.name || ""}
              onChange={(e) => handleSelect(index, e.target.value)}
              disabled={!secondarySelected}
            > 
              <option value="" disabled>Select minor rune</option>
              {groupedRunes.flat().map((rune) => {
                const disable = otherSelection && otherSelection.group === rune.group;
                return (
                  <option key={rune.key} value={rune.name} disabled={disable}>{rune.name}</option>
                );
              })}
            </select>
          );
        })}
      </div>
    </div>
  );
};


// For creating our Item Selector component
const ItemSelector = ({ onChange }) => {
  // Our data
  const [itemsData, setItemsData] = useState([]);
  // Create six item slots
  const [selectedItems, setSelectedItems] = useState(Array(6).fill(null));

  // Get the items
  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItemsData(data.items);
    };
    fetchItems();
  }, []);

  // update for when something changes
  useEffect(() => {
    if (onChange) {
      onChange(selectedItems);
    }
  }, [selectedItems]);

  // updates the array in react to be what was chosen
  const handleSelect = (index, item) => {
    const newItems = [...selectedItems];
    newItems[index] = item;
    setSelectedItems(newItems);
  };

  // our html
  return (
    <div className="item-selector-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="item-slot">
          {selectedItems[index] && (
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/15.23.1/img/item/${selectedItems[index].icon}`}
              alt={selectedItems[index].name}
              className="item-img"
            />
          )}

          {!selectedItems[index] && <div className="empty-item-slot"></div>}
          <select
            value={selectedItems[index]?.name || ''}
            onChange={(e) => {
              const item = itemsData.find(i => i.name === e.target.value);
              handleSelect(index, item);
            }}
          >
            <option value="" disabled>Select item</option>
            {itemsData.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};



// Crafting our build.
const BuildMaker = () => {
  const[reloadBuilds, setReloadBuilds] = useState(false);
  const[skillPoints, setSkillPoints] = useState([]);
  const[runes, setRunes] = useState([]);
  const[items, setItems] = useState([]);
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
              runes={runes}
              setRunes={setRunes}
              items={items}
              setItems={setItems}
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