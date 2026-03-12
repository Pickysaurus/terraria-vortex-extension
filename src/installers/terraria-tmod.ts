
import path from 'path';
import { GAME_ID } from '../common';
import { types } from 'vortex-api';
import { IInstruction } from 'vortex-api/lib/types/IExtensionContext';

const tmodExtension = ".tmod";

function testTModInstructions(instructions: types.IInstruction[]): boolean {
    const tModFile = instructions.find(i => i.destination && path.extname(i.destination) === tmodExtension);
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

function installTmodMods(files: string[]): Promise<types.IInstallResult> {
    const modFiles = files.filter(file => path.extname(file).toLowerCase() === tmodExtension);

    const instructions: IInstruction[] = modFiles.map(file => {
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