import fs from 'node:fs';
const file='ios/App/CapApp-SPM/Package.swift';const source=fs.readFileSync(file,'utf8');fs.writeFileSync(file,source.replace(/from: "8\.[^"]+"/,'exact: "8.6.2"'));
