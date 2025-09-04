// // index.js

// const fs = require('fs');
// const path = require('path');

// // Caminho do arquivo original
// const inputPath = path.join(__dirname, 'files/structures_TD1.js');

// // Lê o conteúdo do arquivo
// const content = fs.readFileSync(inputPath, 'utf8');

// // Extrai o objeto structures usando regex
// const match = content.match(/this\.structures\s*=\s*({[\s\S]*?});/);
// if (!match) {
//     console.error('Objeto structures não encontrado.');
//     process.exit(1);
// }

// const objStr = match[1];

// // Converte para objeto JS
// const structures = eval('(' + objStr + ')');

// function consolidateByHanaName(dataObj) {
//   // 1. Mapeia todos os items como antes
//   const allItems = Object.values(dataObj).flatMap(obj => [
//     ...(obj.inputParameters || []),
//     ...(obj.fields || [])
//   ].map(item => ({
//     hanaName: item.hanaName,
//     type: item.Type || item.type || null,
//     label: item.label || null,
//     labelPT: item.labelPT || null,
//     labelEN: item.labelEN || null
//   })));

//   // 2. Agrupa por hanaName
//   const grouped = {};
//   for (const item of allItems) {
//     if (!grouped[item.hanaName]) grouped[item.hanaName] = [];
//     grouped[item.hanaName].push(item);
//   }

//   // 3. Consolida pegando o valor mais frequente
//   function mostFrequent(arr) {
//     const counts = {};
//     for (const val of arr) {
//       if (val == null) continue;
//       counts[val] = (counts[val] || 0) + 1;
//     }
//     return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
//   }

//   const consolidated = {};
//   for (const [hanaName, items] of Object.entries(grouped)) {
//     consolidated[hanaName] = {
//       hanaName,
//       type: mostFrequent(items.map(i => i.type)),
//       label: mostFrequent(items.map(i => i.label)),
//       labelPT: mostFrequent(items.map(i => i.labelPT)),
//       labelEN: mostFrequent(items.map(i => i.labelEN))
//     };
//   }

//   return consolidated;
// }


// const mappedData = consolidateByHanaName(structures);

// const outputPath = path.join(__dirname, 'files/structures_mapped.json');
// fs.writeFileSync(outputPath, JSON.stringify(mappedData, null, 2), 'utf8');
// console.log('Arquivo JSON gerado em:', outputPath);