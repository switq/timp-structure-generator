let mappedFields = {};

function showOutput(mappedFields) {
  const output = document.getElementById('output');
  output.textContent = JSON.stringify(mappedFields, null, 2);

  // Remove botão antigo se existir
  document.getElementById('copyBtn')?.remove();

  // Cria botão copiar
  const copyBtn = document.createElement('button');
  copyBtn.id = 'copyBtn';
  copyBtn.textContent = 'Copiar resultado';
  copyBtn.style.marginTop = '10px';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(output.textContent);
    copyBtn.textContent = 'Copiado!';
    setTimeout(() => (copyBtn.textContent = 'Copiar resultado'), 1500);
  };
  output.parentNode.insertBefore(copyBtn, output.nextSibling);
}

function mapFields(jsonCompact) {
  const typeConverter = (inlineType, hanaName = "") => {
    const typeMap = {
      NVARCHAR: "NVARCHAR",
      DECIMAL: "DECIMAL",
      TINYINT: "INTEGER"
    }
    const type = typeMap[inlineType.primitiveType];


    const dimension = type == "INTEGER" ? 0 : inlineType.length;
    const precision = inlineType.scale;
    const isMeasure = type == "DECIMAL";
    const isKey = hanaName === "ID";

    if (dimension === 8 && type === "NVARCHAR" && mappedFields[hanaName] === "TIMESTAMP") {
      return {
        type: "TIMESTAMP",
        precision: 0,
        isKey: false,
        isMeasure: false
      }
    }

    return {
      type,
      dimension,
      isMeasure,
      isKey,
      ...(type == "DECIMAL" ? { precision } : {})
    }
  }

  const nodes = jsonCompact["View:ColumnView"]["viewNode"];
  const mainProjection = nodes.find((node) => node._attributes.name == "Projection");
  const rawFields = mainProjection.element;

  return rawFields.map((field, index) => {
    const inlineType = field.inlineType["_attributes"];
    const hanaName = field["_attributes"].name;
    const type = typeConverter(inlineType, hanaName)
    return {
      ID: index + 1,
      hanaName,
      active: true,
      ...type,
      label: "",
      labelPT: "",
      labelEN: "",
    }
  });
}

function mapIPs(jsonCompact) {
  const rawInputParameters = jsonCompact["View:ColumnView"].parameter
  return rawInputParameters.map((param, index) => {
    const inputParam = param["_attributes"];
    const inlineType = param["inlineType"]["_attributes"];
    const hanaName = inputParam.name;

    let type = inlineType.primitiveType;

    if (mappedFields[hanaName]?.type === "TIMESTAMP")
      type = "TIMESTAMP";

    return {
      ID: index + 1,
      hanaName,
      isMandatory: inputParam.mandatory,
      Type: type,
      operator: "=",
      label: "",
      labelPT: "",
      labelEN: "",
    }
  })
}

function gerateLevels(maxID) {
  const fields = [];
  for (let i = 1; i <= maxID; i++) {
    fields.push({ ID: i });
  }

  return {
    name: "Dados",
    description: "Dados",
    namePT: "Dados",
    descriptionPT: "Dados",
    nameEN: "Data",
    descriptionEN: "Data",
    fields,
    levels: []
  }
}

async function loadMappedFields() {
  const response = await fetch('files/fields_mapped.json');
  if (!response.ok) {
    throw new Error('Não foi possível carregar o arquivo fields_mapped.json');
  }
  mappedFields = await response.json();
}

function translateFields(fields) {
  return fields.map(field => {
    const mapping = mappedFields[field.hanaName] || {};
    const { label = "", labelPT = "", labelEN = "" } = mapping;
    return {
      ...field,
      label,
      labelPT,
      labelEN
    }
  })
}


loadMappedFields();

document.getElementById('processXmlBtn').addEventListener('click', () => {
  const xml = document.getElementById('xmlInput').value;

  if (!xml.trim()) {
    document.getElementById('output').textContent = 'Insira o XML!';
    document.getElementById('copyBtn')?.remove();
    return;
  }

  try {
    const jsonCompact = window.xml2js(xml, { compact: true, spaces: 2 });
    console.log(jsonCompact)

    const fields = translateFields(mapFields(jsonCompact));
    const lastID = fields.length;
    const inputParameters = translateFields(mapIPs(jsonCompact));
    const levels = gerateLevels(lastID)

    const completeStructure = {
      hanaName: "",
      version: 1,
      hanaPackage: "",
      title: "",
      description: "",
      descriptionPT: "",
      descriptionEN: "",
      lastID,
      inputParameters,
      levels,
      fields,
      jointAmount: 1
    }

    showOutput(completeStructure);

  } catch (error) {
    throw error
    document.getElementById('output').textContent = 'Erro ao processar o XML: ' + error.message;
    document.getElementById('copyBtn')?.remove();
  }
});