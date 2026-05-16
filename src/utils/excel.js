import * as XLSX from 'xlsx';

export const exportToExcel = (folios) => {
  // Format the data for Excel
  const excelData = folios.map((folio) => ({
    'No. Folio': parseInt(folio.num),
    'Fecha de Creación': new Date(folio.createdAt).toLocaleDateString('es-MX'),
    'Fecha del Documento': folio.fecha.split('-').reverse().join('/'),
    'Dirigido A': folio.dirigidoA,
    'Asunto': folio.asunto,
    'Estado': folio.estado,
    'Registrado Por': folio.createdBy
  }));

  // Sort by folio number ascending
  excelData.sort((a, b) => a['No. Folio'] - b['No. Folio']);

  // Create a new workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 10 },  // No. Folio
    { wch: 18 },  // Fecha de Creación
    { wch: 18 },  // Fecha del Documento
    { wch: 35 },  // Dirigido A
    { wch: 50 },  // Asunto
    { wch: 15 },  // Estado
    { wch: 25 },  // Registrado Por
  ];
  worksheet['!cols'] = colWidths;

  // Add auto-filter for all columns (A1 to G1)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, `Folios ${new Date().getFullYear()}`);

  // Save the file
  XLSX.writeFile(workbook, `Reporte_Historico_Folios_IMSS_${new Date().getFullYear()}.xlsx`);
};
