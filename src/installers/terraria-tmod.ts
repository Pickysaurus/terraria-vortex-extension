
import path from 'path';
import { GAME_ID } from '../common';
import { types } from 'vortex-api';

const tmodExtension = ".tmod";

function testTModInstructions(instructions: types.IInstruction[]): boolean {
    const tModFile = instructions.find(i => path.extname(i.destination) === tmodExtension);
    return !!tModFile;
}

function testSupportedTmodContent(files: string[], gameId: string) {
    let supported = (gameId === GAME_ID) &&
        (files.find(file => path.extname(file).toLowerCase() === tmodExtension) !== undefined);

    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
}

function installTmodMods(files: string[]) {
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

export { testSupportedTmodContent, installTmodMods, testTModInstructions };