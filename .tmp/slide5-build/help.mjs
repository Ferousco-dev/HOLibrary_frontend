import { FileBlob, PresentationFile } from '@oai/artifact-tool';
const source = '/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/docs/presentation/HOLibrary-Group4.pptx';
const deck = await PresentationFile.importPptx(await FileBlob.load(source));
const slide = deck.slides.getItem(4);
console.log('slide', Object.getOwnPropertyNames(Object.getPrototypeOf(slide)));
console.log('shapes', Object.getOwnPropertyNames(Object.getPrototypeOf(slide.shapes)));
const target = deck.resolve('sh/dgbulwnm');
console.log('shape', Object.getOwnPropertyNames(Object.getPrototypeOf(target)));
