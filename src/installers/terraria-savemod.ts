import path from 'path';
import { GAME_ID } from '../common';

const saveExtensions = [ ".wld", ".bak", ".twld", ".plr"];

function testSupportedSaveContent(files: string[], gameId: string) {
    let supported = (gameId === GAME_ID) &&
        (files.find(file => {
            const ext = path.extname(file).toLowerCase();
            return saveExtensions.includes(ext);
        }) !== undefined);

    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
}

function installSaveMods(files: string[]) {
    const saveFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return saveExtensions.includes(ext);
    });

    const instructions = saveFiles.map(file => {
        let destDir = 'Worlds';
        // If we have a plr file, this is a player, not a world.
        if (path.extname('.plr')) destDir = 'Players';
        return {
            type: 'copy',
            source: file,
            destination: path.join(destDir, path.basename(file)),
        };
    });
    return Promise.resolve({ instructions });
}

export { testSupportedSaveContent, installSaveMods };