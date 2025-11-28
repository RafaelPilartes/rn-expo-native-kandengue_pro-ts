// src/services/google/googleApi.ts
import { GOOGLE_API_KEY } from '@/constants/keys';

export const getAddressFromCoords = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=pt`,
    );
    const data = await response.json();

    if (data.status === 'OK') {
      return data.results[0]?.formatted_address || 'Endereço não encontrado';
    } else {
      console.log('Erro na API Geocoding:', data.status);
      return 'Endereço não disponível';
    }
  } catch (err) {
    console.log('Erro ao buscar endereço:', err);
    return 'Erro ao obter endereço';
  }
};
