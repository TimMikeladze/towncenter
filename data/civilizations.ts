import type { Civilization } from "@/lib/types"

export const civilizations: Civilization[] = [
  {
    id: "britons",
    name: "Britons",
    type: "Archer",
    bonuses: [
      {
        id: "britons-1",
        description: "Town Centers cost -50% wood upon reaching the Castle Age",
        category: "economic",
      },
      {
        id: "britons-2",
        description: "Foot archers (excluding Skirmishers) have +1 range in Castle Age, +2 in Imperial Age",
        category: "military",
      },
      {
        id: "britons-3",
        description: "Shepherds work 25% faster",
        category: "economic",
      },
    ],
    uniqueUnits: ["longbowman"],
    uniqueTechs: {
      castle: "Yeomen",
      imperial: "Warwolf",
    },
    teamBonus: "Archery Ranges work 20% faster",
    strengths: ["Archers", "Foot archers", "Defensive play"],
    weaknesses: ["Siege", "Monks", "Early game pressure"],
    techTree: {
      missingUnits: ["hand-cannoneer", "camel-rider", "eagle-warrior"],
      missingTechs: ["thumb-ring", "parthian-tactics"],
    },
  },
  {
    id: "chinese",
    name: "Chinese",
    type: "Archer",
    bonuses: [
      {
        id: "chinese-1",
        description: "Start with +3 Villagers, but -200 food and -50 wood",
        category: "economic",
      },
      {
        id: "chinese-2",
        description: "Town Centers support 10 population instead of 5",
        category: "economic",
      },
      {
        id: "chinese-3",
        description: "Technologies cost -10% Feudal, -15% Castle, -20% Imperial Age",
        category: "economic",
      },
      {
        id: "chinese-4",
        description: "Demolition Ships have +50% HP",
        category: "military",
      },
    ],
    uniqueUnits: ["chu-ko-nu"],
    uniqueTechs: {
      castle: "Great Wall",
      imperial: "Rocketry",
    },
    teamBonus: "Farms start with +45 food",
    strengths: ["Economy", "Technology", "Versatile army compositions"],
    weaknesses: ["Early game vulnerable", "Slower start despite villager bonus"],
    techTree: {
      missingUnits: [],
      missingTechs: [],
    },
  },
  {
    id: "byzantines",
    name: "Byzantines",
    type: "Defensive",
    bonuses: [
      {
        id: "byzantines-1",
        description:
          "Buildings (except Farms and Fish Traps) have +10% HP in Feudal, +20% Castle, +30% Imperial, +40% in Post-Imperial",
        category: "defensive",
      },
      {
        id: "byzantines-2",
        description: "Camels, Skirmishers, Pikemen, and Halberdiers cost -25%",
        category: "military",
      },
      {
        id: "byzantines-3",
        description: "Fire Ships attack 25% faster",
        category: "military",
      },
      {
        id: "byzantines-4",
        description: "Advance to Imperial Age costs -33%",
        category: "economic",
      },
    ],
    uniqueUnits: ["cataphract"],
    uniqueTechs: {
      castle: "Greek Fire",
      imperial: "Logistica",
    },
    teamBonus: "Monks heal 50% faster",
    strengths: ["Counter units", "Defensive play", "Cost-effective army"],
    weaknesses: ["Weak early game", "Slow gold-based economy"],
    techTree: {
      missingUnits: ["paladin"],
      missingTechs: ["siege-onager", "blast-furnace"],
    },
  },
  {
    id: "goths",
    name: "Goths",
    type: "Infantry",
    bonuses: [
      {
        id: "goths-1",
        description: "Infantry cost -20% Feudal, -25% Castle, -30% Imperial, -35% Post-Imperial",
        category: "military",
      },
      {
        id: "goths-2",
        description: "Infantry have +1 attack against buildings",
        category: "military",
      },
      {
        id: "goths-3",
        description: "Villagers have +5 attack against wild boar; hunters carry +15 meat",
        category: "economic",
      },
      {
        id: "goths-4",
        description: "Infantry are created 20% faster starting in Feudal Age",
        category: "military",
      },
    ],
    uniqueUnits: ["huskarl"],
    uniqueTechs: {
      castle: "Anarchy",
      imperial: "Perfusion",
    },
    teamBonus: "Barracks work 20% faster",
    strengths: ["Infantry spam", "Late game power", "Population efficiency"],
    weaknesses: ["Poor early game", "Weak defenses", "No Stone Walls"],
    techTree: {
      missingUnits: ["camel-rider", "eagle-warrior"],
      missingTechs: ["stone-wall", "architecture", "arbalester"],
    },
  },
  {
    id: "turks",
    name: "Turks",
    type: "Cavalry",
    bonuses: [
      {
        id: "turks-1",
        description: "Gunpowder units have +25% HP",
        category: "military",
      },
      {
        id: "turks-2",
        description: "Gold Miners work 20% faster",
        category: "economic",
      },
      {
        id: "turks-3",
        description: "Light Cavalry and Hussar upgrade is free",
        category: "military",
      },
      {
        id: "turks-4",
        description: "Chemistry and Gunpowder technologies are researched instantly",
        category: "military",
      },
    ],
    uniqueUnits: ["janissary"],
    uniqueTechs: {
      castle: "Sipahi",
      imperial: "Artillery",
    },
    teamBonus: "Gunpowder units are created 20% faster",
    strengths: ["Gunpowder units", "Gold economy", "Cavalry"],
    weaknesses: ["No Pikeman line", "Weak Skirmishers", "No Elite Skirmisher"],
    techTree: {
      missingUnits: ["pikeman", "halberdier", "elite-skirmisher", "eagle-warrior"],
      missingTechs: ["stone-wall"],
    },
  },
  {
    id: "franks",
    name: "Franks",
    type: "Cavalry",
    bonuses: [
      {
        id: "franks-1",
        description: "Castles cost -25%",
        category: "defensive",
      },
      {
        id: "franks-2",
        description: "Knights have +20% HP",
        category: "military",
      },
      {
        id: "franks-3",
        description: "Farm upgrades are free",
        category: "economic",
      },
      {
        id: "franks-4",
        description: "Foragers work 25% faster",
        category: "economic",
      },
    ],
    uniqueUnits: ["throwing-axeman"],
    uniqueTechs: {
      castle: "Bearded Axe",
      imperial: "Chivalry",
    },
    teamBonus: "Knights have +2 Line of Sight",
    strengths: ["Knights", "Cavalry push", "Castle drops"],
    weaknesses: ["Archers", "Late game economy", "Anti-cavalry units"],
    techTree: {
      missingUnits: ["eagle-warrior", "camel-rider"],
      missingTechs: ["bracer"],
    },
  },
]
