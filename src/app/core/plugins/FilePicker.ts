import { registerPlugin } from '@capacitor/core';

export interface FilePickerPlugin {
  pickFile(options?: { types?: string[] }): Promise<{ filePath: string; name: string }>;
}


const FilePicker = registerPlugin<FilePickerPlugin>('FilePicker');

export default FilePicker;
