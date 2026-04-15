export const SALLET_LIST = [
  { SALLE_ID: 1, SALLE_EMRI: 'Salla A101', SALLE_KAP: 50, AUD_KA_PROJEKTOR: 1, is_laborator: 0 },
  { SALLE_ID: 2, SALLE_EMRI: 'Salla A102', SALLE_KAP: 45, AUD_KA_PROJEKTOR: 1, is_laborator: 0 },
  { SALLE_ID: 3, SALLE_EMRI: 'Salla A103', SALLE_KAP: 40, AUD_KA_PROJEKTOR: 0, is_laborator: 0 },
  { SALLE_ID: 4, SALLE_EMRI: 'Salla A104', SALLE_KAP: 40, AUD_KA_PROJEKTOR: 0, is_laborator: 0 },
  { SALLE_ID: 5, SALLE_EMRI: 'Salla B101', SALLE_KAP: 60, AUD_KA_PROJEKTOR: 1, is_laborator: 0 },
  { SALLE_ID: 6, SALLE_EMRI: 'Salla B102', SALLE_KAP: 55, AUD_KA_PROJEKTOR: 1, is_laborator: 0 },
  { SALLE_ID: 7, SALLE_EMRI: 'Salla B103', SALLE_KAP: 45, AUD_KA_PROJEKTOR: 0, is_laborator: 0 },
  { SALLE_ID: 8, SALLE_EMRI: 'Salla B104', SALLE_KAP: 45, AUD_KA_PROJEKTOR: 0, is_laborator: 0 },
];

export const getSallet = () => Promise.resolve({ data: SALLET_LIST });
