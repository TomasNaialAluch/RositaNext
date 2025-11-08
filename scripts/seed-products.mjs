import readline from 'readline';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar service account
const serviceAccountPath = path.join(__dirname, '..', 'service-accounts', 'rosita-admin.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'rosita-b76eb.appspot.com'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Configurar readline para inputs interactivos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer pregunta y esperar respuesta
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Función para capitalizar primera letra
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Función para obtener nombre del producto desde el nombre del archivo
function getProductName(filename) {
  const nameWithoutExt = path.parse(filename).name;
  // Reemplazar guiones y guiones bajos con espacios
  const nameWithSpaces = nameWithoutExt.replace(/[-_]/g, ' ');
  // Capitalizar primera letra de cada palabra
  return nameWithSpaces
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

// Función para subir imagen a Firebase Storage usando Admin SDK
async function uploadImage(filePath, fileName) {
  try {
    const destination = `products/${fileName}`;
    const contentType = mime.lookup(filePath) || 'image/jpeg';
    
    // Subir archivo usando Admin SDK
    await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        contentType: contentType,
        metadata: {
          uploadedBy: 'seed-script'
        }
      }
    });
    
    // Obtener URL pública del archivo
    const file = bucket.file(destination);
    await file.makePublic(); // Hacer el archivo público para acceso directo
    
    // Generar URL pública
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    return downloadURL;
  } catch (error) {
    console.error(`Error al subir imagen ${fileName}:`, error);
    throw error;
  }
}

// Opciones de corte disponibles
const CUT_OPTIONS = [
  'Entero',
  'Cortado',
  'Cortado Banderita',
  'Cortado a 3 Dedos',
  'Cortado a 5 Dedos',
  'Bife',
  'Bife a 1 dedo',
  'Bife a 2 dedos',
  'Bife a 3 dedos',
  'Milanesa',
  'Picado'
];

// Métodos de preparación disponibles
const PREPARATION_METHODS = [
  'parrilla',
  'milanesa',
  'horno',
  'guiso',
  'asado',
  'plancha'
];

// Función para seleccionar opciones de corte
async function selectCutOptions() {
  console.log('\nOpciones de entrega disponibles:');
  CUT_OPTIONS.forEach((option, index) => {
    console.log(`${index + 1}. ${option}`);
  });
  
  const selected = [];
  let continueSelecting = true;
  
  while (continueSelecting) {
    const answer = await question('\nIngresa el número de la opción (o "fin" para terminar): ');
    
    if (answer.toLowerCase() === 'fin' || answer === '') {
      continueSelecting = false;
    } else {
      const index = parseInt(answer) - 1;
      if (index >= 0 && index < CUT_OPTIONS.length) {
        const option = CUT_OPTIONS[index];
        if (!selected.includes(option)) {
          selected.push(option);
          console.log(`✓ Agregado: ${option}`);
        } else {
          console.log(`⚠ Ya está seleccionado: ${option}`);
        }
      } else {
        console.log('⚠ Número inválido. Intenta de nuevo.');
      }
    }
  }
  
  return selected;
}

// Función para seleccionar métodos de preparación
async function selectPreparationMethods() {
  console.log('\nMétodos de preparación disponibles:');
  PREPARATION_METHODS.forEach((method, index) => {
    const capitalized = method.charAt(0).toUpperCase() + method.slice(1);
    console.log(`${index + 1}. ${capitalized}`);
  });
  
  const selected = [];
  let continueSelecting = true;
  
  while (continueSelecting) {
    const answer = await question('\nIngresa el número del método (o "fin" para terminar): ');
    
    if (answer.toLowerCase() === 'fin' || answer === '') {
      continueSelecting = false;
    } else {
      const index = parseInt(answer) - 1;
      if (index >= 0 && index < PREPARATION_METHODS.length) {
        const method = PREPARATION_METHODS[index];
        if (!selected.includes(method)) {
          selected.push(method);
          const capitalized = method.charAt(0).toUpperCase() + method.slice(1);
          console.log(`✓ Agregado: ${capitalized}`);
        } else {
          const capitalized = method.charAt(0).toUpperCase() + method.slice(1);
          console.log(`⚠ Ya está seleccionado: ${capitalized}`);
        }
      } else {
        console.log('⚠ Número inválido. Intenta de nuevo.');
      }
    }
  }
  
  return selected;
}

// Función para procesar un producto
async function processProduct(imagePath) {
  const fileName = path.basename(imagePath);
  const productName = getProductName(fileName);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 Procesando: ${productName}`);
  console.log(`📁 Archivo: ${fileName}`);
  console.log(`${'='.repeat(60)}`);
  
  // Subir imagen primero
  console.log('\n📤 Subiendo imagen...');
  let imageURL;
  try {
    imageURL = await uploadImage(imagePath, fileName);
    console.log(`✓ Imagen subida exitosamente: ${imageURL}`);
  } catch (error) {
    console.error('❌ Error al subir imagen. Continuando sin imagen...');
    imageURL = null;
  }
  
  // Pedir categoría
  console.log('\n📋 Categorías disponibles:');
  console.log('1. vacuno');
  console.log('2. cerdo');
  console.log('3. pollo');
  console.log('4. otros');
  const categoryChoice = await question('Selecciona la categoría (1-4): ');
  const categories = ['vacuno', 'cerdo', 'pollo', 'otros'];
  const category = categories[parseInt(categoryChoice) - 1] || 'otros';
  
  // Pedir precio por kilogramo
  const pricePerKgStr = await question('💰 Precio por kilogramo: $');
  const pricePerKg = parseFloat(pricePerKgStr) || 0;
  
  // Pedir tipo de venta
  console.log('\n📊 Tipo de venta:');
  console.log('1. Por kilogramo');
  console.log('2. Por unidad');
  const unitTypeChoice = await question('Selecciona el tipo (1 o 2): ');
  const unitType = unitTypeChoice === '2' ? 'unidad' : 'kg';
  
  let price = pricePerKg;
  let minQuantity = null;
  
  if (unitType === 'unidad') {
    // Si es por unidad, pedir precio aproximado
    const unitPriceStr = await question('💰 Precio aproximado por unidad: $');
    price = parseFloat(unitPriceStr) || pricePerKg;
  } else {
    // Si es por kilogramo, pedir mínimo de venta
    const minSaleStr = await question('⚖️ Mínimo de venta (en kg): ');
    minQuantity = parseFloat(minSaleStr) || 0.5;
  }
  
  // Pedir opciones de entrega
  const cutOptions = await selectCutOptions();
  
  // Pedir métodos de preparación
  const preparationMethods = await selectPreparationMethods();
  
  // Pedir descripción
  const description = await question('📝 Descripción del producto: ');
  
  // Crear objeto del producto
  const productData = {
    name: productName,
    description: description || null,
    price: price,
    pricePerKg: pricePerKg,
    image: imageURL,
    category: category,
    unitType: unitType,
    cutOptions: cutOptions,
    preparation: preparationMethods.length > 0 ? preparationMethods : null,
    created_at: serverTimestamp()
  };
  
  // Agregar mínimo de venta si es por kilogramo
  if (unitType === 'kg' && minQuantity) {
    productData.minQuantity = minQuantity;
  }
  
  // Guardar en Firestore usando Admin SDK
  console.log('\n💾 Guardando producto en la base de datos...');
  try {
    // Usar FieldValue.serverTimestamp() de admin
    productData.created_at = admin.firestore.FieldValue.serverTimestamp();
    
    const docRef = await db.collection('products').add(productData);
    console.log(`✓ Producto guardado con ID: ${docRef.id}`);
    return true;
  } catch (error) {
    console.error('❌ Error al guardar producto:', error);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🌱 Script de Inseminación de Productos');
  console.log('=====================================\n');
  
  // Pedir carpeta con imágenes
  const folderPath = await question('📁 Ingresa la ruta de la carpeta con las fotos: ');
  
  // Verificar que la carpeta existe
  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Error: La carpeta "${folderPath}" no existe.`);
    rl.close();
    process.exit(1);
  }
  
  // Obtener archivos de imagen
  const files = fs.readdirSync(folderPath);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });
  
  if (imageFiles.length === 0) {
    console.error('❌ No se encontraron archivos de imagen en la carpeta.');
    rl.close();
    process.exit(1);
  }
  
  console.log(`\n📸 Se encontraron ${imageFiles.length} imágenes para procesar.\n`);
  
  // Procesar cada imagen
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const imagePath = path.join(folderPath, imageFile);
    
    try {
      const success = await processProduct(imagePath);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error procesando ${imageFile}:`, error);
      errorCount++;
    }
    
    // Preguntar si quiere continuar con el siguiente
    if (i < imageFiles.length - 1) {
      const continueAnswer = await question('\n¿Continuar con el siguiente producto? (s/n): ');
      if (continueAnswer.toLowerCase() !== 's' && continueAnswer.toLowerCase() !== 'si' && continueAnswer.toLowerCase() !== '') {
        console.log('\n⏹️ Proceso detenido por el usuario.');
        break;
      }
    }
  }
  
  // Resumen final
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Resumen:');
  console.log(`✓ Productos procesados exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`${'='.repeat(60)}\n`);
  
  rl.close();
  process.exit(0);
}

// Ejecutar script
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  rl.close();
  process.exit(1);
});

