
import path from 'path';
import { fs, types, util } from 'vortex-api';
import { GAME_ID, STEAMAPP_ID, TMOD_STEAMAPP_ID } from './common';
import { testSupportedTmodContent, installTmodMods, testTModInstructions } from './installers/terraria-tmod';
import { testSupportedSaveContent, installSaveMods } from './installers/terraria-savemod';
import { testTerrariaModderSupported, installTerrariaModderMod, testTerrariaModderCoreSupported, installTerrariaModderCore } from './installers/terraria-modder-mod';

const baseGameDocumentsPath = () => path.join(util.getVortexPath('documents'), `My Games`, `Terraria`);

function main(context: types.IExtensionContext) {
    context.registerGame({
        id: GAME_ID,
        name: 'Terraria',
        mergeMods: true,
        queryPath: findGame,
        supportedTools: [
            {
                id: 'tmod-loader-tool',
                name: 'tModLoader',
                queryPath: async () => {
                    const tMod: types.IGameStoreEntry = await util.GameStoreHelper.findByAppId(TMOD_STEAMAPP_ID);
                    return tMod?.gamePath;
                },
                requiredFiles: [
                    'start-tModLoader.bat',
                ],
                executable: () => 'start-tModLoader.bat'

            },
            {
                id: 'terraria-modder',
                name: 'TerrariaModder',
                requiredFiles: [
                    'TerrariaInjector.exe'
                ],
                executable: () => 'TerrariaInjector.exe'
            }
        ],
        queryModPath: () => path.join('TerrariaModder', 'mods'),
        logo: 'gameart.png',
        executable: () => 'Terraria.exe',
        requiredFiles: [
            'Terraria.exe'
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

    // We'd need to migrate the existing user data to support this update
    // All existing mods need to be flagged with the "terraria-tmod-type"
    // context.registerMigration((oldVersion: string) => undefined);

    // Register Mod Type for tModLoader
    context.registerModType(
        'terraria-tmod-type', 25, 
        (gameId: string) => gameId === GAME_ID,
        () => path.join(baseGameDocumentsPath(), `tModLoader`),
        testTModInstructions,
        {
            name: 'tModLoader Mod'
        }
    );

    // Register Mod Type for non-tModLoader saves
    context.registerModType(
        'terraria-tmod-type', 25, 
        (gameId: string) => gameId === GAME_ID,
        () => baseGameDocumentsPath(),
        () => false,
        {
            name: 'Vanilla Save'
        }
    );

    // Register installers for tModLoader
    context.registerInstaller('terraria-tmod', 25, testSupportedTmodContent, installTmodMods);
    context.registerInstaller('terraria-savemod', 25, testSupportedSaveContent, installSaveMods);

    // Register installers for TerrariaModder
    context.registerInstaller('terraria-modder-core', 25, testTerrariaModderCoreSupported, installTerrariaModderCore);    
    context.registerInstaller('terraria-modder-mod', 25, testTerrariaModderSupported, installTerrariaModderMod);

    return true;
}

async function findGame(): Promise<string | undefined> {
    try {
        const game = await util.GameStoreHelper.findByAppId([STEAMAPP_ID]);
        return game.gamePath
    }
    catch(err: unknown) {
        return undefined;
    }
}

async function prepareForModding(discovery: types.IDiscoveryResult): Promise<void> {
    try {
        await fs.ensureDirWritableAsync(path.join(baseGameDocumentsPath(), 'tModLoader', 'Mods'));
        await fs.ensureDirWritableAsync(path.join(discovery.path, 'TerrariaModder', 'Mods'));
    }
    catch (e: unknown){
        throw e;
    } 
}

module.exports = {
    default: main,
};
