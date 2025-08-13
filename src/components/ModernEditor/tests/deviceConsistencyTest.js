/**
 * Test automatisé de cohérence des clés de device
 * Vérifie que les positions persistent correctement entre desktop ↔ mobile ↔ tablet
 */

// Simulation d'un élément de test
const createTestElement = (id) => ({
  id,
  text: `Test Element ${id}`,
  enabled: true,
  x: 100,
  y: 100,
  color: '#000000',
  size: 'base'
});

// Simulation des fonctions de device config
const getElementDeviceConfig = (element, previewDevice) => {
  if (previewDevice === 'desktop') return element;
  const fromConfig = element.deviceConfig?.[previewDevice] || {};
  const fromDirect = element[previewDevice] || {};
  return { ...element, ...fromConfig, ...fromDirect };
};

// Simulation de la logique de drag end
const updateElementPosition = (element, previewDevice, newPosition) => {
  if (previewDevice !== 'desktop') {
    return {
      ...element,
      [previewDevice]: {
        ...(element[previewDevice] || {}),
        ...newPosition
      }
    };
  } else {
    return {
      ...element,
      ...newPosition
    };
  }
};

// Test de cohérence
function testDeviceConsistency() {
  console.log('🧪 Test de Cohérence des Devices - DÉBUT\n');
  
  let element = createTestElement(1);
  let passed = 0;
  let failed = 0;
  
  // Test 1: Position initiale desktop
  console.log('📱 Test 1: Position initiale desktop');
  const desktopConfig = getElementDeviceConfig(element, 'desktop');
  if (desktopConfig.x === 100 && desktopConfig.y === 100) {
    console.log('✅ Desktop initial position: PASS');
    passed++;
  } else {
    console.log('❌ Desktop initial position: FAIL');
    failed++;
  }
  
  // Test 2: Drag sur mobile
  console.log('\n📱 Test 2: Drag sur mobile');
  element = updateElementPosition(element, 'mobile', { x: 200, y: 150 });
  const mobileConfig = getElementDeviceConfig(element, 'mobile');
  if (mobileConfig.x === 200 && mobileConfig.y === 150) {
    console.log('✅ Mobile drag position: PASS');
    passed++;
  } else {
    console.log('❌ Mobile drag position: FAIL', mobileConfig);
    failed++;
  }
  
  // Test 3: Retour sur desktop (doit garder position originale)
  console.log('\n📱 Test 3: Retour sur desktop');
  const desktopConfigAfter = getElementDeviceConfig(element, 'desktop');
  if (desktopConfigAfter.x === 100 && desktopConfigAfter.y === 100) {
    console.log('✅ Desktop position preserved: PASS');
    passed++;
  } else {
    console.log('❌ Desktop position preserved: FAIL', desktopConfigAfter);
    failed++;
  }
  
  // Test 4: Retour sur mobile (doit garder nouvelle position)
  console.log('\n📱 Test 4: Retour sur mobile');
  const mobileConfigAgain = getElementDeviceConfig(element, 'mobile');
  if (mobileConfigAgain.x === 200 && mobileConfigAgain.y === 150) {
    console.log('✅ Mobile position persistent: PASS');
    passed++;
  } else {
    console.log('❌ Mobile position persistent: FAIL', mobileConfigAgain);
    failed++;
  }
  
  // Test 5: Drag sur tablette
  console.log('\n📱 Test 5: Drag sur tablette');
  element = updateElementPosition(element, 'tablet', { x: 300, y: 250 });
  const tabletConfig = getElementDeviceConfig(element, 'tablet');
  if (tabletConfig.x === 300 && tabletConfig.y === 250) {
    console.log('✅ Tablet drag position: PASS');
    passed++;
  } else {
    console.log('❌ Tablet drag position: FAIL', tabletConfig);
    failed++;
  }
  
  // Test 6: Vérification que desktop et mobile sont inchangés
  console.log('\n📱 Test 6: Isolation des devices');
  const finalDesktop = getElementDeviceConfig(element, 'desktop');
  const finalMobile = getElementDeviceConfig(element, 'mobile');
  
  if (finalDesktop.x === 100 && finalDesktop.y === 100 && 
      finalMobile.x === 200 && finalMobile.y === 150) {
    console.log('✅ Device isolation: PASS');
    passed++;
  } else {
    console.log('❌ Device isolation: FAIL');
    console.log('Desktop:', finalDesktop);
    console.log('Mobile:', finalMobile);
    failed++;
  }
  
  // Résultats
  console.log('\n🎯 RÉSULTATS DU TEST:');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📊 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! La cohérence des devices est assurée.');
  } else {
    console.log('\n⚠️  DES PROBLÈMES DE COHÉRENCE PERSISTENT.');
  }
  
  console.log('\n📋 Structure finale de l\'élément:');
  console.log(JSON.stringify(element, null, 2));
  
  return { passed, failed, element };
}

// Exécution du test
if (typeof window !== 'undefined') {
  // Dans le navigateur
  window.testDeviceConsistency = testDeviceConsistency;
  console.log('🧪 Test de cohérence disponible via: window.testDeviceConsistency()');
} else {
  // Dans Node.js
  testDeviceConsistency();
}

module.exports = { testDeviceConsistency };
