// The home page's photographs, from Wikimedia Commons; /creditos lists each one with its author and licence.
const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/thumb/'
export const foto = (f: string, w = 1280) => `${COMMONS}${f}/${w}px-${f.split('/').pop()}`
// shortcut: Wikimedia serves these reliably only at 1280px (1920 answers 429, 2560 answers 400); host our own larger copies if they look soft
export const FOTOS = {
  piramide: { f: 'c/ca/Honduras-0162_%282214381528%29.jpg', autor: 'Dennis G. Jarvis', lic: 'CC BY-SA 2.0', pagina: 'File:Honduras-0162_(2214381528).jpg', lugar: 'Copán Ruinas' },
  tegucigalpa: { f: '4/4a/Cumulus_clouds_over_Tegucigalpa%2C_Honduras.jpg', autor: 'Straggles', lic: 'CC0', pagina: 'File:Cumulus_clouds_over_Tegucigalpa,_Honduras.jpg', lugar: 'Tegucigalpa' },
  carretera: { f: 'a/ab/Honduras-0066_-_Toll_Road_%282213586647%29.jpg', autor: 'Dennis G. Jarvis', lic: 'CC BY-SA 2.0', pagina: 'File:Honduras-0066_-_Toll_Road_(2213586647).jpg', lugar: 'Honduras' },
  roatan: { f: 'a/ab/West_Bay_Beach_-Roatan_-Honduras-23May2009.jpg', autor: 'Adalberto Hernandez Vega', lic: 'CC BY 2.0', pagina: 'File:West_Bay_Beach_-Roatan_-Honduras-23May2009.jpg', lugar: 'Roatán' },
  bus: { f: 'd/d5/Public_bus_from_Tegucigalpa-Gracias_Lempira%2C_Honduras.jpg', autor: 'Ridiculopathy', lic: 'CC0', pagina: 'File:Public_bus_from_Tegucigalpa-Gracias_Lempira,_Honduras.jpg', lugar: 'Tegucigalpa' },
  pelota: { f: '0/04/CPN_BallCourt_01.jpg', autor: 'Talk2winik', lic: 'Public domain', pagina: 'File:CPN_BallCourt_01.jpg', lugar: 'Copán Ruinas' },
}
