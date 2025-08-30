const fs = require('fs');

const propertyTypes = ['single-family', 'condo', 'townhouse', 'multi-family', 'land'];
const cities = [
  { name: 'New York', state: 'NY', lat: 40.7589, lng: -73.9851, zips: ['10001', '10014', '10025', '10280', '10002'] },
  { name: 'Jersey City', state: 'NJ', lat: 40.7282, lng: -74.0776, zips: ['07302', '07030', '07310', '07311', '07306'] },
  { name: 'Brooklyn', state: 'NY', lat: 40.6892, lng: -73.9442, zips: ['11201', '11215', '11217', '11231', '11205'] },
  { name: 'Queens', state: 'NY', lat: 40.7282, lng: -73.7949, zips: ['11101', '11102', '11103', '11104', '11105'] },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, zips: ['19102', '19103', '19106', '19107', '19123'] },
];

const streetNames = ['Main St', 'Oak Ave', 'Park Pl', 'Broadway', 'First Ave', 'Second St', 'Third Ave', 'Elm St', 'Pine St', 'Cedar Ave'];
const amenities = [
  ['Doorman', 'Gym', 'Rooftop'],
  ['Garage', 'Backyard', 'Basement'],
  ['Private Entrance', 'Terrace', 'Storage'],
  ['Separate Entrances', 'Laundry', 'Parking'],
  ['Concierge', 'Pool', 'Spa'],
  ['Garden', 'Balcony', 'Fireplace'],
  ['Elevator', 'Central AC', 'Hardwood Floors'],
  ['Washer/Dryer', 'Dishwasher', 'Walk-in Closet'],
];

const images = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800',
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800',
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateROIMonthly() {
  const baseROI = randomFloat(4, 12);
  return Array.from({ length: 12 }, () =>
    randomFloat(baseROI - 1, baseROI + 1, 1)
  );
}

function generateProperty(id) {
  const city = randomChoice(cities);
  const zip = randomChoice(city.zips);
  const propertyType = randomChoice(propertyTypes);

  // Adjust coordinates slightly for variety
  const lat = city.lat + randomFloat(-0.05, 0.05, 4);
  const lng = city.lng + randomFloat(-0.05, 0.05, 4);

  const beds = propertyType === 'land' ? 0 : randomBetween(0, 5);
  const baths = beds === 0 ? 1 : randomFloat(1, beds + 1, 1);
  const sqft = propertyType === 'land' ? randomBetween(2000, 10000) : randomBetween(400, 3000);
  const yearBuilt = randomBetween(1950, 2023);

  // Price based on city and property type
  let basePrice = 300000;
  if (city.name === 'New York') basePrice = 600000;
  if (city.name === 'Brooklyn') basePrice = 500000;
  if (city.name === 'Queens') basePrice = 450000;
  if (city.name === 'Philadelphia') basePrice = 350000;

  const price = basePrice + randomBetween(-150000, 300000);
  const hoa = propertyType === 'condo' ? randomBetween(200, 800) : 0;
  const taxes = Math.floor(price * randomFloat(0.015, 0.03));
  const rentEst = Math.floor(price * randomFloat(0.004, 0.008));
  const expensesEst = Math.floor(price * randomFloat(0.01, 0.04));
  const capRate = randomFloat(3, 8, 1);

  const titles = [
    `Modern ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1).replace('-', ' ')}`,
    `Luxury ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1).replace('-', ' ')}`,
    `Charming ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1).replace('-', ' ')}`,
    `Updated ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1).replace('-', ' ')}`,
    `Stunning ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1).replace('-', ' ')}`,
  ];

  return {
    id: `prop-${String(id).padStart(3, '0')}`,
    title: randomChoice(titles),
    address: `${randomBetween(100, 999)} ${randomChoice(streetNames)}, ${city.name}`,
    lat,
    lng,
    price,
    beds,
    baths,
    sqft,
    yearBuilt,
    hoa,
    taxes,
    rentEst,
    expensesEst,
    roiMonthly: generateROIMonthly(),
    capRate,
    images: [
      randomChoice(images),
      randomChoice(images),
      randomChoice(images)
    ].filter((img, index, arr) => arr.indexOf(img) === index),
    zip,
    city: city.name,
    state: city.state,
    propertyType,
    amenities: randomChoice(amenities),
    description: `Beautiful ${propertyType.replace('-', ' ')} in ${city.name} with great potential.`
  };
}

// Generate 200 properties
const properties = [];
for (let i = 1; i <= 200; i++) {
  properties.push(generateProperty(i));
}

// Write to file
fs.writeFileSync('./seed/properties.json', JSON.stringify(properties, null, 2));
console.log(`Generated ${properties.length} properties`);
