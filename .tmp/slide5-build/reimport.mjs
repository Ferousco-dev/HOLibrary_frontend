import { FileBlob, PresentationFile } from '@oai/artifact-tool';
try {
  const deck = await PresentationFile.importPptx(await FileBlob.load('/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/holibrary-frontend/.codex-finalizer/HOLibrary-Group4-slide5-annotated-candidate.pptx'));
  console.log('reimported', deck.slides.items.length);
} catch (error) {
  console.error('REIMPORT_ERROR:', error.message);
}
