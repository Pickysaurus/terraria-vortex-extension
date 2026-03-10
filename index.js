const STEAMAPP_ID = '1281930';
const GAME_ID = 'terraria';

const path = require('path');
const { fs, log, util } = require('vortex-api');
const userProfile = process.env.USERPROFILE;

const modPath = path.join(userProfile, 'Documents', `My Games`, `Terraria`, `tModLoader`);
const tmodExtension = ".tmod";
const saveExtension = ".wld";
const backupSaveExtension = ".bak";
const tmodSaveExtension = ".twld";

function main(context) {
    context.registerGame({
        id: GAME_ID,
        name: 'Terraria ModLoader',
        mergeMods: true,
        queryPath: findGame,
        supportedTools: [],
        queryModPath: () => modPath,
        logo: 'gameart.png',
        executable: () => 'start-tModLoader.bat',
        requiredFiles: [
            'start-tModLoader.bat',
        ],
        shell: true,
        setup: prepareForModding,
        environment: {
            SteamAPPId: STEAMAPP_ID,
        },
        details: {
            steamAppId: STEAMAPP_ID,
        },
    });

    context.registerInstaller('terraria-tmod', 25, testSupportedTmodContent, installTmodMods);
    context.registerInstaller('terraria-savemod', 25, testSupportedSaveContent, installSaveMods);
    return true;
}

function findGame() {
    return util.GameStoreHelper.findByAppId([STEAMAPP_ID])
        .then(game => game.gamePath);
}

function prepareForModding() {
    return fs.ensureDirWritableAsync(path.join(modPath, 'Mods'));
}

function testSupportedTmodContent(files, gameId) {
    let supported = (gameId === GAME_ID) &&
        (files.find(file => path.extname(file).toLowerCase() === tmodExtension) !== undefined);

    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
}

function installTmodMods(files) {
    const modFiles = files.filter(file => path.extname(file).toLowerCase() === tmodExtension);

    const instructions = modFiles.map(file => {
        const destDir = 'Mods';
        return {
            type: 'copy',
            source: file,
            destination: path.join(destDir, path.basename(file)),
        };
    });
    return Promise.resolve({ instructions });
}

function testSupportedSaveContent(files, gameId) {
    let supported = (gameId === GAME_ID) &&
        (files.find(file => {
            const ext = path.extname(file).toLowerCase();
            return ext === saveExtension || ext === backupSaveExtension || ext === tmodSaveExtension;
        }) !== undefined);

    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
}

function installSaveMods(files) {
    const saveFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === saveExtension || ext === backupSaveExtension || ext === tmodSaveExtension;
    });

    const instructions = saveFiles.map(file => {
        const destDir = 'Worlds';
        return {
            type: 'copy',
            source: file,
            destination: path.join(destDir, path.basename(file)),
        };
    });
    return Promise.resolve({ instructions });
}

module.exports = {
    default: main,
};
