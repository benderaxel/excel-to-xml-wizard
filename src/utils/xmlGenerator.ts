
export const generateXml = (
  data: Record<string, string | number>[],
  selectedParameters: string[]
): string => {
  let xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n';
  
  data.forEach((row) => {
    xmlOutput += '  <row>\n';
    
    selectedParameters.forEach((param) => {
      const value = row[param] !== undefined ? row[param] : '';
      xmlOutput += `    <${param}>${value}</${param}>\n`;
    });
    
    xmlOutput += '  </row>\n';
  });
  
  xmlOutput += '</rows>';
  return xmlOutput;
};

export const generateRowXml = (
  row: Record<string, string | number>,
  selectedParameters: string[]
): string => {
  let xmlOutput = '  <row>\n';
  
  selectedParameters.forEach((param) => {
    const value = row[param] !== undefined ? row[param] : '';
    xmlOutput += `    <${param}>${value}</${param}>\n`;
  });
  
  xmlOutput += '  </row>';
  return xmlOutput;
};
