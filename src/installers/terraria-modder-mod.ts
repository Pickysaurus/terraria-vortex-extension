import path from 'path';
import { GAME_ID } from '../common';
import { types } from 'vortex-api';

const manifestFile = 'manifest.json';
const modExt = '.dll';
const injectorFile = 'TerrariaInjector.exe';

function testTerrariaModderSupported(files: string[], gameId: string): Promise<types.ISupportedResult> {
    let supportedGame = (gameId === GAME_ID) 
    const manifest = files.find(f => path.basename(f) === manifestFile);
    const dllFile = files.find(f => path.extname(f) === modExt);

    return Promise.resolve({
        supported: supportedGame && !!manifest && !!dllFile,
        requiredFiles: [],
    });

}

function testTerrariaModderCoreSupported(files: string[], gameId: string): Promise<types.ISupportedResult> {
    let supportedGame = (gameId === GAME_ID) 
    const injector = files.find(f => path.basename(f) === injectorFile);

    return Promise.resolve({
        supported: supportedGame && !!injector,
        requiredFiles: [],
    });

}

function installTerrariaModderMod(files: string[]): Promise<types.IInstallResult> {
    const manifests = files.filter(f => path.basename(f) === manifestFile);
    let instructions: types.IInstruction[] = [];
    for (const manifest of manifests) {
        // Trim off the Manifest.json part to get the path
        const manifestPath = manifest.replace(manifestFile, '');
        const modFolder = path.basename(manifestPath);
        // We MUST remove the folder paths, or Vortex gets very buggy. 
        const manifestFiles = manifestPath.length 
            ? files.filter(f => f.startsWith(manifestPath) && !!path.extname(f)) 
            : files.filter(f => !!path.extname(f));
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

function installTerrariaModderCore(files: string[]): Promise<types.IInstallResult> {
    let instructions: types.IInstruction[] = files.filter(f => !!path.extname(f)).map(
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