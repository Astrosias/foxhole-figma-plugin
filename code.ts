const ratio = (40960 - 10230)/35520;
const coef = 887;
const coefCol = coef * ratio;
const coefLine = coef;
const small_ratio = 40960/35520;
const coefx= coef * small_ratio;
const coefy= coef;

interface Dictionary<T> {
  [Key: string]: T;
}

const region_to_offsets: Dictionary<Array<number>> = {'Oarbreaker': [0, 2.0], 'FishermansRow': [0, 3.0], 'StemaLanding': [0, 4.0], 'NevishLine': [1, 1.5],
'FarranacCoast': [1, 2.5], 'Westgate': [1, 3.5], 'Origin': [1, 4.5], 'CallumsCape': [2, 1.0],
'Stonecradle': [2, 2.0], 'KingsCage': [2, 3.0], 'Sableport': [2, 4.0], 'AshFields': [2, 5.0],
'SpeakingWoods': [3, 0.5], 'MooringCounty': [3, 1.5], 'LinnMercy': [3, 2.5], 'LochMor': [3, 3.5],
'Heartlands': [3, 4.5], 'RedRiver': [3, 5.5], 'BasinSionnach': [4, 0.0], 'ReachingTrail': [4, 1.0],
'CallahansPassage': [4, 2.0], 'DeadLands': [4, 3.0], 'UmbralWildwood': [4, 4.0], 'GreatMarch': [4, 5.0],
'Kalokai': [4, 6.0], 'HowlCounty': [5, 0.5], 'ViperPit': [5, 1.5], 'MarbanHollow': [5, 2.5],
'DrownedVale': [5, 3.5], 'ShackledChasm': [5, 4.5], 'Acrithia': [5, 5.5], 'ClansheadValley': [6, 1.0],
'WeatheredExpanse': [6, 2.0], 'Clahstra': [6, 3.0], 'AllodsBight': [6, 4.0], 'Terminus': [6, 5.0],
'MorgensCrossing': [7, 1.5], 'StlicanShelf': [7, 2.5], 'EndlessShore': [7, 3.5], 'ReaversPass': [7, 4.5],
'Godcrofts': [8, 2.0], 'TempestIsland': [8, 3.0], 'TheFingers': [8, 4.0]};

const icon_dictionnary: Dictionary<string> = {"8": "ForwardBase", "11": "Medical", "12": "Vehicle", "17": "Manufacturing", "18": "Shipyard",
					"20": "Salvage", "21": "Components", "22": "OilWell", "23": "Sulfur", "27": "Keep", "28": "ObservationTower",
					"32": "SulfurMine", "33": "StorageFacility", "34": "Factory", "35": "Safehouse", "37": "RocketSite", "38": "SalvageMine",
					"39": "ConstructionYard", "40": "ComponentMine", "47": "RelicBase", "51": "MassProductionFactory",
					"52": "Seaport", "53": "CoastalGun", "54": "SoulFactory", "56": "StaticBase1", "57": "StaticBase2", "58": "StaticBase3",
					"59": "StormCannon", "60": "IntelCenter", "61": "Coal", "62": "Fuel", "19": "TechCenter", "45": "RelicBase"};
          

const components_nodes = figma.root.findAllWithCriteria({
  types: ['COMPONENT']
});
console.log(components_nodes)

// This file holds the main code for plugins. Code in this file has access to

// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

var plugedInstanceNodes: Array<InstanceNode> = []

async function mega_fun(region: string) {

  const url = `https://war-service-live.foxholeservices.com/api/worldconquest/maps/${region}/dynamic/public`
  const response = await fetch(url)
  const warapi_json = await response.json()

  const region_name = region.replace("Hex", "")

  warapi_json.mapItems.forEach( async (item: { teamId: string; x: number; y: number; iconType: number}) => {
    const coords = [255 + item.x * coefx + (region_to_offsets[region_name][0] - 5) * coefCol, item['y'] * coefy + (region_to_offsets[region_name][1] - 3.5)* coefLine]
    const icontype = String(item.iconType)
    var teamid = item.teamId
    if (teamid === "WARDENS") {
      teamid = "Warden"
    }
    else if (teamid === "COLONIALS") {
      teamid = "Colonial"
    }
    else {
      teamid = ""
    }
    components_nodes.forEach( (component: ComponentNode) => {
      // console.log(component.name, icon_dictionnary[String(icontype)])
      if (component.name === "MapIcon" + icon_dictionnary[String(icontype)] + teamid) {
        var current_element = component.createInstance()
        current_element.x = coords[0] - component.width / 2
        current_element.y = coords[1] - component.height / 2
        current_element.name = "pluged" + icontype
        plugedInstanceNodes.push(current_element)
      }
    })
  })
}

(async () => {
  console.log("Entering async task")
  const response = await fetch('https://war-service-live.foxholeservices.com/api/worldconquest/maps')
  const json = await response.json()
  console.log(response.status)
  console.log(json)
  var allPromises: Promise<any>[] = []

  json.forEach( (region: string) => {
    const promisetmp = new Promise((resolve, reject) => resolve(mega_fun(region)))
    allPromises.push(promisetmp) // Saving every promise inside an array
  })
  Promise.all(allPromises).then(() => {  // When all promises have resolved, terminate the plugin
    var plugedGroupNode = figma.group(plugedInstanceNodes, figma.currentPage)
    plugedGroupNode.name = "API Intel " + Date()
    plugedGroupNode.locked = true
    figma.closePlugin()
  })
})()

