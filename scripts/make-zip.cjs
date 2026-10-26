const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, '../public/faucetflow-source-code.zip'));
const archive = new ZipArchive({
  zlib: { level: 9 },
});

output.on('close', function () {
  console.log(`ZIP created successfully! Total bytes: ${archive.pointer()}`);
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);

// Append files and directories
archive.glob('**/*', {
  cwd: path.join(__dirname, '..'),
  ignore: [
    'node_modules/**',
    '.git/**',
    '.aistudio/**',
    'dist/**',
    'public/faucetflow-source-code.zip',
    'public/faucetflow-source-code.tar.gz',
    'scripts/**',
  ],
  dot: true,
});

archive.finalize();
