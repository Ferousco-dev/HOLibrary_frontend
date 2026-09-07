import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
const source = '/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/docs/presentation/HOLibrary-Group4.pptx';
const deck = await PresentationFile.importPptx(await FileBlob.load(source));
const s = await deck.inspect({kind:'slide,textbox,shape,image,table,chart,notes,layout', target:{id:'sl/i107q5of',beforeLines:0,afterLines:0}, maxChars:30000});
console.log(s.ndjson);
const slide = deck.slides.getItem(4);
const png = await slide.export({format:'png', scale:2});
await fs.writeFile('.tmp/slide5-build/slide5-before.png', new Uint8Array(await png.arrayBuffer()));
