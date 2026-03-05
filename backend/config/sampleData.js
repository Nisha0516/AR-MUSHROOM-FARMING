// Sample data to populate the database
const sampleMushrooms = [
  {
    name: "Fresh Button Mushrooms",
    description: "Farm-fresh white button mushrooms, perfect for cooking and salads. Harvested daily for maximum freshness.",
    price: 5.99,
    category: "Button",
    image: "button-mushrooms.jpg",
    stock: 100,
    isAvailable: true,
    rating: 4.5,
    modelUrl: "https://modelviewer.dev/shared-assets/models/shishkebab.glb",
    iosModelUrl: "https://modelviewer.dev/shared-assets/models/shishkebab.usdz"
  },
  {
    name: "Premium Portobello",
    description: "Large, meaty portobello mushrooms ideal for grilling and stuffing. Rich, earthy flavor perfect as meat substitute.",
    price: 8.99,
    category: "Portobello",
    image: "portobello-mushrooms.jpg",
    stock: 50,
    isAvailable: true,
    rating: 4.8,
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    iosModelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.usdz"
  },
  {
    name: "Organic Shiitake",
    description: "Traditional Asian mushrooms with smoky, umami flavor. Excellent for stir-fries and soups.",
    price: 12.99,
    category: "Shiitake",
    image: "shiitake-mushrooms.jpg",
    stock: 75,
    isAvailable: true,
    rating: 4.7
  },
  {
    name: "Fresh Oyster Mushrooms",
    description: "Delicate, fan-shaped mushrooms with mild, sweet flavor. Perfect for sautéing and Asian cuisine.",
    price: 9.99,
    category: "Oyster",
    image: "oyster-mushrooms.jpg",
    stock: 60,
    isAvailable: true,
    rating: 4.6
  },
  {
    name: "Baby Bella Cremini",
    description: "Young, firm mushrooms with deeper flavor than white buttons. Great for roasting and sauces.",
    price: 6.99,
    category: "Cremini",
    image: "cremini-mushrooms.jpg",
    stock: 80,
    isAvailable: true,
    rating: 4.4
  },
  {
    name: "Exotic Enoki",
    description: "Long, thin white mushrooms with crisp texture. Popular in Japanese and Korean cuisine.",
    price: 7.99,
    category: "Enoki",
    image: "enoki-mushrooms.jpg",
    stock: 40,
    isAvailable: true,
    rating: 4.3
  }
];

module.exports = sampleMushrooms;
