import { ipcRenderer } from 'electron';
import { VerseLang } from 'VerseLang';

document.getElementById('open-file')?.addEventListener('click', async () => {
    const result = await ipcRenderer.invoke('open-file');
    if (result) {
        (document.getElementById('file-path') as HTMLInputElement).value = result.filePath;
        (document.getElementById('file-content') as HTMLTextAreaElement).value = result.fileContent;
    }
});

document.getElementById('run-script')?.addEventListener('click', () => {
    const fileContent = (document.getElementById('file-content') as HTMLTextAreaElement).value;
    const debug = (document.getElementById('debug-mode') as HTMLInputElement).checked;
    const args = [fileContent, debug ? 'true' : 'false'];

    // Run the interpreter
    VerseLang.main(args).catch((e: any) => console.error(e));
});

document.getElementById('save-file')?.addEventListener('click', async () => {
    const filePath = (document.getElementById('file-path') as HTMLInputElement).value;
    const content = (document.getElementById('file-content') as HTMLTextAreaElement).value;
    await ipcRenderer.invoke('save-file', { filePath, content });
});
