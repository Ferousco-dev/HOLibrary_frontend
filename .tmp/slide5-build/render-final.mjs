import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
const deck = await PresentationFile.importPptx(await FileBlob.load('/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/holibrary-frontend/.presentation-output/HOLibrary-Group4-slide5-annotated-v3.pptx'));
const slide = deck.slides.getItem(4);
const image = await slide.export({ format: 'png', scale: 2 });
await fs.writeFile('/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/holibrary-frontend/.tmp/slide5-build/slide5-final.png', new Uint8Array(await image.arrayBuffer()));
console.log('slide-count', deck.slides.items.length);
