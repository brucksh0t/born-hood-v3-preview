// The collection's copy and media live here. Keep the same IDs when replacing a drop.
// Descriptions are illustrative demo copy, not manufacturing specifications.
export const products = [
  {
    id: 'hoodie', shopHref: 'shop.html?category=hoodies', shopLabel: 'Shop hoodies', number: '01', short: 'Hoodie', name: 'Crown hoodie',
    role: 'The original', tagline: 'The signature. Worn your way.',
    description: 'The Born Hood name. The red crown. A piece that keeps your roots in the picture.',
    detail: 'A bold chest graphic, a dark silhouette, and the crown at its center. The starting point for the collection.',
    idle: 'assets/swap_hoodie_main.mp4', poster: 'assets/poster-hoodie.jpg',
    focus: '34% 50%',
  },
  {
    id: 'tee', shopHref: 'shop.html?category=tees', shopLabel: 'Shop tees', number: '02', short: 'Graphic tee', name: 'Graphic tee',
    role: 'The expression', tagline: 'A little louder. All you.',
    description: 'Color outside the lines. The crown gets a full-color remix against a black canvas.',
    detail: 'A splash of color with a familiar symbol. The graphic tee takes the same mindset in a different direction.',
    idle: 'assets/swap_tee_main.mp4', poster: 'assets/poster-tee.jpg',
    focus: '34% 45%',
  },
  {
    id: 'hat', shopHref: 'shop.html?category=headwear', shopLabel: 'Shop headwear', number: '03', short: 'Crown cap', name: 'Crown cap',
    role: 'The finishing touch', tagline: 'Keep your crown close.',
    description: 'Black on red. One unmistakable mark. The final detail that pulls the look together.',
    detail: 'The red crown stands on its own. A simple finishing touch, with the same identity as the rest of the collection.',
    idle: 'assets/swap_hat_main.mp4', poster: 'assets/poster-hat.jpg',
    focus: '34% 43%',
  },
];
export const productById = Object.fromEntries(products.map(product => [product.id, product]));
export const transitionSource = (from, to) => `assets/trans_${from}_to_${to}.mp4`;
// Rectangles are percentages inside the original 16:9 scene, not the viewport.
const front = [14, 8, 40, 84];
const middle = [59, 22, 22, 43];
const back = [77, 8, 18, 25];
export const sceneLayout = {
  hoodie: { hoodie: front, tee: middle, hat: back },
  tee: { tee: front, hoodie: middle, hat: back },
  hat: { hat: [17, 17, 37, 60], hoodie: middle, tee: [77, 8, 19, 44] },
};

