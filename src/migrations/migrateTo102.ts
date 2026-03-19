import { actions, log, types, util } from "vortex-api";
import { GAME_ID, TMOD_STEAMAPP_ID } from "../common";
import semver from 'semver';

export default async function migrateTo102(oldVersion: string, api: types.IExtensionApi) {
    if (semver.gte(oldVersion, '1.0.2')) return Promise.resolve();
    
    log("info", `Terraria Extension migrating from ${oldVersion} to 1.0.2`);
    // If the user is upgrading between 1.0.1 and 1.0.2 all existing mods will need to be swapped to the tModLoader modtype
    const state = api.getState();
    const installedMods = state.persistent.mods[GAME_ID];
    if (!Object.entries(installedMods)) return Promise.resolve(); // No mods to process

    // Assign the modtype
    for (const id of Object.keys(installedMods)) {
        api.store.dispatch(actions.setModType(GAME_ID, id, 'terraria-tmod-type'));
    }
    // Do a purge of all currently deployed tModLoader mods - this was the default mod type.
    const tModLoader = await util.GameStoreHelper.findByAppId(TMOD_STEAMAPP_ID)
    if (tModLoader) api.events.emit("purge-mods-in-path", GAME_ID, "", tModLoader.gamePath);
    // Deploy mods again
    api.events.emit("deploy-mods");
    return Promise.resolve();    
}