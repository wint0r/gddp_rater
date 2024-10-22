import express from "express";
const app = express();
const UPDATE_PERIOD = 1 * 60 * 60 * 1000;
const NLW_API_URL = "https://nlw.oat.zone/list?type=all";
const IDS_API_URL = "https://nlw.oat.zone/ids?type=all";
const AREDL_API_URL = "https://api.aredl.net/api/aredl/levels";

interface Level {
    id: number;
    tier: string;
}

interface AREDLLevel {
    id: string;
    legacy: boolean;
    level_id: number;
    name: string;
    points: number;
    position: number;
    two_player: boolean;
}

interface NLWLevel {
    sheetIndex: number;
    id: number;
    name: string;
    creator: string;
    description: string;
    checkpoints: string | null;
    tier: string;
    skillset: string;
    enjoyment: number | null;
    broken: string | null;
}

interface IDSLevel {
    sheetIndex: number;
    id: number;
    name: string;
    creator: string;
    description: string;
    checkpoints: string | null;
    tier: string;
    skillset: string;
    broken: string | null;
}

let levels: Level[] = [];

async function updateLevels() {
    const idsMappings = {
        "Fuck": "Gold",
        "Beginner": "Gold",
        "Easy": "Gold",
        "Medium": "Gold",
        "Hard": "Gold",
        "Very Hard": "Amber",
        "Insane": "Amber",
        "Extreme": "Amber"
    };

    const nlwMappings = {
        "Fuck": "Platinum",
        "Beginner": "Platinum",
        "Easy": "Platinum",
        "Medium": "Sapphire",
        "Hard": "Sapphire",
        "Very Hard": "Sapphire",
        "Insane": "Jade",
        "Extreme": "Emerald",
        "Remorseless": "Emerald",
        "Relentless": "Ruby",
        "Terrifying": "Ruby",
        "Catastrophic": "Diamond"
    };

    const nlwExceptions = {
        "Cat Planet": "Platinum",
        "Daydream": "Platinum",
        "Falcon16": "Jade",
        "Shock Therapy": "Jade",
        "Ziroikabi": "Jade",
        "DMG CTRL": "Jade",
        "Hyper Paradox": "Jade",
        "Quantum Processing": "Jade",
        "Raisins": "Jade",
        "Arctic Lights": "Ruby",
        "Frozen Cave": "Ruby",
        "Ouroboros": "Ruby",
        "Plasma Pulse Finale": "Ruby"
    };

    const aredlMappings = {
        "Acheron": "Amethyst",
        "poocubed": "Onyx",
        "qoUEO": "Diamond"
    };

    levels = [];

    let idsResponse = await fetch(IDS_API_URL);
    let idsLevels: IDSLevel[] = await idsResponse.json() as IDSLevel[];
    let nlwResponse = await fetch(NLW_API_URL);
    let nlwLevels: NLWLevel[] = await nlwResponse.json() as NLWLevel[];
    let aredlResponse = await fetch(AREDL_API_URL);
    let aredlLevels: AREDLLevel[] = await aredlResponse.json() as AREDLLevel[];
    
    for (const idsLevel of idsLevels) {
        let level: Level = {
            id: idsLevel.id,
            tier: idsMappings[idsLevel.tier]
        };

        levels.push(level);
    }

    for (const nlwLevel of nlwLevels) {
        if (Object.keys(nlwMappings).indexOf(nlwLevel.tier) < 0) {
            continue;
        }

        let level: Level = {
            id: nlwLevel.id,
            tier: nlwMappings[nlwLevel.tier]
        };

        if (Object.keys(nlwExceptions).indexOf(nlwLevel.name) >= 0) {
            level.tier = nlwExceptions[nlwLevel.name];
        }

        levels.push(level);
    }

    let currentTier = "Azurite";
    for (const aredlLevel of aredlLevels) {
        if (levels.filter(x => x.id === aredlLevel.level_id).length > 0) {
            break;
        }

        if (Object.keys(aredlMappings).indexOf(aredlLevel.name) >= 0) {
            currentTier = aredlMappings[aredlLevel.name];
        }

        let level: Level = {
            id: aredlLevel.level_id,
            tier: currentTier
        };

        levels.push(level);
    }
}

app.get("/all", (_req, res) => {
    res.send(levels);
});

updateLevels().then(() => {
    app.listen(9663, () => {
        setInterval(updateLevels, UPDATE_PERIOD);
    });
});
