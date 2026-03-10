import path from 'path';
import { GAME_ID } from '../common';
import { types } from 'vortex-api';

const manifestFile = 'manifest.json';
const modExt = '.dll';
const injectorFile = 'TerrariaInjector.exe';

function testTerrariaModderSupported(files: string[], gameId: string) {
    let supportedGame = (gameId === GAME_ID) 
    const manifest = files.find(f => path.basename(f) === manifestFile);
    const dllFile = files.find(f => path.extname(f) === modExt);

    return Promise.resolve({
        supported: supportedGame && !!manifest && !!dllFile,
        requiredFiles: [],
    });

}

function testTerrariaModderCoreSupported(files: string[], gameId: string) {
    let supportedGame = (gameId === GAME_ID) 
    const injector = files.find(f => path.basename(f) === injectorFile);

    return Promise.resolve({
        supported: supportedGame && !!injector,
        requiredFiles: [],
    });

}

function installTerrariaModderMod(files: string[]) {
    const manifests = files.filter(f => path.basename(f) === manifestFile);
    let instructions: types.IInstruction[] = [];
    for (const manifest of manifests) {
        // Trim off the Manifest.json part to get the path
        const manifestPath = manifest.replace(manifestFile, '');
        const modFolder = path.basename(manifestPath);
        const manifestFiles = manifestPath.length ? files.filter(f => f.startsWith(manifestPath)) : files;
        manifestFiles.map((file: string) => {
            instructions.push({
                type: 'copy',
                source: file,
                destination: path.join(modFolder, path.basename(file)),
            });
        });
    }

    return Promise.resolve({ instructions });
}

function installTerrariaModderCore(files: string[]) {
    let instructions: types.IInstruction[] = files.map(
        (file: string) => 
            ({
                type: 'copy',
                source: file,
                destination: file,
            })
    );

    instructions.push({
        type: 'setmodtype',
        value: 'dinput'
    });

    return Promise.resolve({ instructions });
}

export {
    testTerrariaModderSupported, installTerrariaModderMod,
    testTerrariaModderCoreSupported, installTerrariaModderCore
};