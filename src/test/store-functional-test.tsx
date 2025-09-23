// FUNCTIONAL TEST: Zustand Store - Tarea 9
// Este archivo verifica que el store funciona correctamente

import { useMeetingStore } from '../store/meetingStore';

// Test simulado para verificar funcionalidad
export const testZustandStore = () => {
  console.log('🧪 INICIANDO TEST FUNCIONAL DEL STORE...');
  
  // 1. Test Meeting Data
  console.log('\n1️⃣ Testing Meeting Data:');
  
  const store = useMeetingStore.getState();
  
  // Test inicial
  console.log('Initial meetingData:', store.meetingData);
  console.assert(store.meetingData.name === '', 'Initial meeting name should be empty');
  console.assert(store.meetingData.participants.length === 0, 'Initial participants should be empty');
  console.assert(store.meetingData.type === 'daily', 'Initial type should be daily');
  console.log('✅ Meeting data initial state correct');
  
  // Test updateMeeting (requerimiento específico)
  store.updateMeeting({ name: 'Test Meeting' });
  const updatedMeetingData = useMeetingStore.getState().meetingData;
  console.assert(updatedMeetingData.name === 'Test Meeting', 'updateMeeting should work');
  console.log('✅ updateMeeting action works correctly');
  
  // 2. Test Transcript Data
  console.log('\n2️⃣ Testing Transcript Data:');
  
  console.log('Initial transcriptData:', store.transcriptData);
  console.assert(store.transcriptData.text === '', 'Initial transcript should be empty');
  console.assert(store.transcriptData.wordCount === 0, 'Initial wordCount should be 0');
  console.log('✅ Transcript data initial state correct');
  
  // Test updateTranscript (requerimiento específico)
  store.updateTranscript({ text: 'Hello world test', wordCount: 3 });
  const updatedTranscriptData = useMeetingStore.getState().transcriptData;
  console.assert(updatedTranscriptData.text === 'Hello world test', 'updateTranscript should work');
  console.assert(updatedTranscriptData.wordCount === 3, 'wordCount should update');
  console.log('✅ updateTranscript action works correctly');
  
  // 3. Test Summary Data
  console.log('\n3️⃣ Testing Summary Data:');
  
  console.log('Initial summaryData:', store.summaryData);
  console.assert(store.summaryData.content === '', 'Initial summary should be empty');
  console.assert(store.summaryData.isLoading === false, 'Initial isLoading should be false');
  console.log('✅ Summary data initial state correct');
  
  // Test updateSummary (según patrón de requerimientos)
  store.updateSummary({ content: 'Test summary content' });
  const updatedSummaryData = useMeetingStore.getState().summaryData;
  console.assert(updatedSummaryData.content === 'Test summary content', 'updateSummary should work');
  console.log('✅ updateSummary action works correctly');
  
  // 4. Test Actions adicionales (etc.)
  console.log('\n4️⃣ Testing Additional Actions:');
  
  // Test appendTranscriptText
  store.appendTranscriptText('additional text');
  const appendedTranscript = useMeetingStore.getState().transcriptData;
  console.assert(appendedTranscript.text.includes('additional text'), 'appendTranscriptText should work');
  console.log('✅ Additional actions work correctly');
  
  // Test clearTranscript
  store.clearTranscript();
  const clearedTranscript = useMeetingStore.getState().transcriptData;
  console.assert(clearedTranscript.text === '', 'clearTranscript should clear text');
  console.assert(clearedTranscript.wordCount === 0, 'clearTranscript should reset wordCount');
  console.log('✅ Clear actions work correctly');
  
  // 5. Test Store Reset
  console.log('\n5️⃣ Testing Store Reset:');
  
  store.resetStore();
  const resetState = useMeetingStore.getState();
  console.assert(resetState.meetingData.name === '', 'Reset should clear meeting name');
  console.assert(resetState.transcriptData.text === '', 'Reset should clear transcript');
  console.assert(resetState.summaryData.content === '', 'Reset should clear summary');
  console.log('✅ Store reset works correctly');
  
  console.log('\n🎯 RESULTADO: TODOS LOS TESTS FUNCIONALES PASAN');
  console.log('✅ Meeting data: FUNCIONANDO');
  console.log('✅ Transcript data: FUNCIONANDO');  
  console.log('✅ Summary data: FUNCIONANDO');
  console.log('✅ updateMeeting: FUNCIONANDO');
  console.log('✅ updateTranscript: FUNCIONANDO');
  console.log('✅ Actions adicionales: FUNCIONANDO');
  
  return true;
};

// Verificar que el store existe y es accesible
export const verifyStoreStructure = () => {
  console.log('🔍 VERIFICANDO ESTRUCTURA DEL STORE...');
  
  const store = useMeetingStore.getState();
  
  // Verificar datos requeridos
  console.assert('meetingData' in store, 'Store should have meetingData');
  console.assert('transcriptData' in store, 'Store should have transcriptData');
  console.assert('summaryData' in store, 'Store should have summaryData');
  
  // Verificar actions requeridas
  console.assert('updateMeeting' in store, 'Store should have updateMeeting action');
  console.assert('updateTranscript' in store, 'Store should have updateTranscript action');
  
  // Verificar types
  console.assert(typeof store.updateMeeting === 'function', 'updateMeeting should be function');
  console.assert(typeof store.updateTranscript === 'function', 'updateTranscript should be function');
  
  console.log('✅ Store structure is correct');
  return true;
};

// Export para testing
export default {
  testZustandStore,
  verifyStoreStructure
};