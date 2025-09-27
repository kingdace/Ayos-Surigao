// Complete list of Surigao City Barangays
// Source: Official Surigao City data

export const SURIGAO_CITY_BARANGAYS = [
  // Urban Barangays
  { code: 'ALANG_ALANG', name: 'Alang-alang', type: 'urban' },
  { code: 'ANOMAR', name: 'Anomar', type: 'urban' },
  { code: 'AURORA', name: 'Aurora', type: 'urban' },
  { code: 'BILABID', name: 'Bilabid', type: 'urban' },
  { code: 'BONIFACIO', name: 'Bonifacio', type: 'urban' },
  { code: 'BUGSUKAN', name: 'Bugsukan', type: 'urban' },
  { code: 'CANLANIPA', name: 'Canlanipa', type: 'urban' },
  { code: 'DANAWAN', name: 'Danawan', type: 'urban' },
  { code: 'HABAY', name: 'Habay', type: 'urban' },
  { code: 'IPIL', name: 'Ipil', type: 'urban' },
  { code: 'LIPATA', name: 'Lipata', type: 'urban' },
  { code: 'LUNA', name: 'Luna', type: 'urban' },
  { code: 'MABINI', name: 'Mabini', type: 'urban' },
  { code: 'MABUA', name: 'Mabua', type: 'urban' },
  { code: 'MAPAWA', name: 'Mapawa', type: 'urban' },
  { code: 'NONOC', name: 'Nonoc', type: 'urban' },
  { code: 'OROK', name: 'Orok', type: 'urban' },
  { code: 'POCTOY', name: 'Poctoy', type: 'urban' },
  { code: 'QUEZON', name: 'Quezon', type: 'urban' },
  { code: 'RIZAL', name: 'Rizal', type: 'urban' },
  { code: 'SAN_JUAN', name: 'San Juan', type: 'urban' },
  { code: 'SAN_MATEO', name: 'San Mateo', type: 'urban' },
  { code: 'SAN_PEDRO', name: 'San Pedro', type: 'urban' },
  { code: 'SILOP', name: 'Silop', type: 'urban' },
  { code: 'SUKAILANG', name: 'Sukailang', type: 'urban' },
  { code: 'TAFT', name: 'Taft', type: 'urban' },
  { code: 'TRINIDAD', name: 'Trinidad', type: 'urban' },
  { code: 'WASHINGTON', name: 'Washington', type: 'urban' },

  // Rural Barangays
  { code: 'BUENAVISTA', name: 'Buenavista', type: 'rural' },
  { code: 'CAPALAYAN', name: 'Capalayan', type: 'rural' },
  { code: 'JUBGAN', name: 'Jubgan', type: 'rural' },
  { code: 'MAG_ASO', name: 'Mag-aso', type: 'rural' },
  { code: 'MATALINGAO', name: 'Matalingao', type: 'rural' },
  { code: 'POBLACION', name: 'Poblacion', type: 'rural' },
  { code: 'SABANG', name: 'Sabang', type: 'rural' },
  { code: 'SACA', name: 'Saca', type: 'rural' },
  { code: 'TAGANA_AN', name: 'Tagana-an', type: 'rural' },
  { code: 'TOGBONGON', name: 'Togbongon', type: 'rural' },
];

export const getBarangayByCode = (code: string) => {
  return SURIGAO_CITY_BARANGAYS.find(b => b.code === code);
};

export const getBarangaysByType = (type: 'urban' | 'rural') => {
  return SURIGAO_CITY_BARANGAYS.filter(b => b.type === type);
};

export const getAllBarangayNames = () => {
  return SURIGAO_CITY_BARANGAYS.map(b => b.name).sort();
};
