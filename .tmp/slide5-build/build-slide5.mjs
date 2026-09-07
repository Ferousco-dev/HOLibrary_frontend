import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

process.on('uncaughtException', (error) => {
  console.error('BUILD_ERROR:', error.message);
  console.error('BUILD_ERROR_DETAILS:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  process.exitCode = 1;
});

const sourceDeck = '/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/docs/presentation/HOLibrary-Group4.pptx';
const screenshotPath = '/var/folders/jr/qz3v83px10g3qwgmgb9t547h0000gn/T/TemporaryItems/NSIRD_screencaptureui_4AZ8cr/Screenshot 2026-09-07 at 12.38.26.png';
const logoPath = '/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/holibrary-frontend/assets/oau-logo.png';
const workspaceDir = '/Users/oresajooluwaferanmiidunuoluwa/Desktop/SCHOOL/holibrary-frontend';
const skillDir = '/Users/oresajooluwaferanmiidunuoluwa/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const finalPath = path.join(workspaceDir, '.presentation-output', 'HOLibrary-Group4-slide5-annotated-v3.pptx');
const stagingDir = path.join(workspaceDir, '.codex-finalizer');
const candidatePath = path.join(stagingDir, 'HOLibrary-Group4-slide5-annotated-v3-candidate.pptx');
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);

const deck = await PresentationFile.importPptx(await FileBlob.load(sourceDeck));
const slide = deck.slides.getItem(4);
slide.shapes.deleteAll();
console.error('checkpoint: cleared slide');
slide.background.fill = '#FFFFFF';

const purple = '#28115B';
const royal = '#2455D6';
const gold = '#E9B33B';
const slate = '#313448';
const muted = '#656A7B';
const pale = '#F7F7FB';
const line = '#D8DAE6';
const screenshot = new Uint8Array(await fs.readFile(screenshotPath));
const logo = new Uint8Array(await fs.readFile(logoPath));

function textbox(text, position, style = {}, name = undefined) {
  const shape = slide.shapes.add({
    geometry: 'textbox', name, position, fill: 'none', line: { fill: 'none', width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: 'Calibri', fontSize: 12, color: slate, autoFit: 'shrinkText',
    marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0, ...style,
  };
  return shape;
}

function callout({ side, top, title, body, targetX, targetY }) {
  const left = side === 'left' ? 22 : 1006;
  const markerX = targetX - 5;
  const markerY = targetY - 5;
  const box = slide.shapes.add({
    geometry: 'roundRect',
    position: { left, top, width: 252, height: 76 },
    fill: pale,
    line: { style: 'solid', fill: line, width: 1 },
    borderRadius: 8,
    shadow: 'shadow-sm',
  });
  const accent = slide.shapes.add({
    geometry: 'rect',
    position: { left: left + 1, top: top + 10, width: 4, height: 56 },
    fill: gold,
    line: { fill: 'none', width: 0 },
  });
  const titleShape = textbox(title, { left: left + 15, top: top + 10, width: 224, height: 18 }, {
    fontSize: 12.5, bold: true, color: purple,
  });
  const bodyShape = textbox(body, { left: left + 15, top: top + 31, width: 224, height: 36 }, {
    fontSize: 9.6, color: muted, breakLine: false,
  });
  const marker = slide.shapes.add({
    geometry: 'ellipse',
    position: { left: markerX, top: markerY, width: 10, height: 10 },
    fill: gold,
    line: { style: 'solid', fill: '#FFFFFF', width: 1 },
  });
  const connector = slide.shapes.connect(box, marker, {
    kind: 'straight',
    fromSide: side === 'left' ? 'right' : 'left',
    toSide: side === 'left' ? 'left' : 'right',
    line: { style: 'solid', fill: gold, width: 1.25 },
    tail: { type: 'arrow', width: 'sm', length: 'sm' },
  });
  connector.sendToBack();
  accent.bringToFront();
  titleShape.bringToFront();
  bodyShape.bringToFront();
  marker.bringToFront();
}

textbox('THE CLIENT', { left: 58, top: 24, width: 330, height: 20 }, {
  fontSize: 13, bold: true, color: gold,
});
textbox('The catalogue page, explained', { left: 58, top: 48, width: 800, height: 40 }, {
  typeface: 'Cambria', fontSize: 29, bold: true, color: purple,
});
textbox('Hand-written HTML, token-based CSS and JavaScript work together in every screen.', { left: 58, top: 87, width: 980, height: 20 }, {
  fontSize: 12, color: muted,
});
slide.images.add({
  blob: logo, contentType: 'image/png', alt: 'Obafemi Awolowo University crest', fit: 'contain',
  position: { left: 1175, top: 25, width: 58, height: 58 },
});
console.error('checkpoint: header added');

const screenshotFrame = slide.shapes.add({
  geometry: 'roundRect',
  position: { left: 290, top: 118, width: 700, height: 560 },
  fill: '#FFFFFF', line: { style: 'solid', fill: '#C6C8D5', width: 1.2 }, borderRadius: 12,
  shadow: '2px 6px 16px #170A3B/20',
});
slide.images.add({
  blob: screenshot, contentType: 'image/png', alt: 'The HOL catalogue page showing search, availability guidance and footer navigation',
  fit: 'contain', position: { left: 296, top: 124, width: 688, height: 548 },
});
screenshotFrame.sendToBack();
console.error('checkpoint: screenshot added');

callout({ side: 'left', top: 122, title: 'Semantic structure', body: 'Native header, navigation, main content and footer give the page a clear structure.', targetX: 585, targetY: 211 });
callout({ side: 'left', top: 214, title: 'Labelled search form', body: 'The search field and button use a real form so readers can search by keyboard.', targetX: 515, targetY: 304 });
callout({ side: 'left', top: 306, title: 'Filter and browse', body: 'The expandable filter keeps the first view simple and provides a focused way to browse.', targetX: 515, targetY: 338 });
callout({ side: 'left', top: 398, title: 'Availability language', body: 'The legend explains whether a copy can go home, stays in the library or is on loan.', targetX: 762, targetY: 438 });
callout({ side: 'left', top: 490, title: 'Footer navigation', body: 'Library, account and help links stay available at the end of every page.', targetX: 590, targetY: 620 });

callout({ side: 'right', top: 122, title: 'Shared CSS tokens', body: 'The purple and gold palette, spacing and type remain consistent across the interface.', targetX: 800, targetY: 257 });
callout({ side: 'right', top: 214, title: 'One API module', body: 'The search action uses one async module for requests, token renewal and errors.', targetX: 663, targetY: 305 });
callout({ side: 'right', top: 306, title: 'DOM-rendered results', body: 'JavaScript creates result content safely with textContent instead of innerHTML.', targetX: 598, targetY: 454 });
callout({ side: 'right', top: 398, title: 'Responsive layout', body: 'CSS grid and flexbox keep the search, results and legend readable from phone to desk.', targetX: 701, targetY: 455 });
callout({ side: 'right', top: 490, title: 'Accessibility built in', body: 'Words support colour, controls work by keyboard and reduced-motion settings are respected.', targetX: 504, targetY: 493 });
console.error('checkpoint: callouts added');

textbox('5', { left: 1190, top: 685, width: 32, height: 16 }, { fontSize: 12, color: muted, align: 'right' });
slide.speakerNotes.textFrame.setText('This slide uses a live screenshot of the HOL catalogue page. The callouts connect the visible interface to the HTML, CSS, JavaScript and accessibility decisions described in the original client slide.');

await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });
await (await PresentationFile.exportPptx(deck)).save(candidatePath);
console.error('checkpoint: candidate saved');

const result = await finalizePresentation({
  explicitTotalSlideCount: 18,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: '/Users/oresajooluwaferanmiidunuoluwa/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  fontPolicy: {
    basis: 'reference',
    families: ['Calibri', 'Cambria', 'Courier New'],
    referencePath: sourceDeck,
    referenceSha256: 'c8f6bf044d06c416918adf709f1b8711ba9528d4a28a23b8bd4ebc179e10a93a',
  },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, 'HOLibrary-Group4-slide5-annotated-v3.validation.json'),
});
console.log(JSON.stringify({ finalPath, result }, null, 2));
