#!/usr/bin/env node

/**
 * Crab Image Finder - Searches free stock photo APIs for crab species
 * This script helps find available images for our crab learning app
 */

const crabs = [
  { name: "Blue Crab", scientificName: "Callinectes sapidus", searchTerms: ["blue crab", "callinectes sapidus", "atlantic crab"] },
  { name: "Hermit Crab", scientificName: "Paguroidea", searchTerms: ["hermit crab", "paguroidea", "shell crab"] },
  { name: "King Crab", scientificName: "Paralithodes camtschaticus", searchTerms: ["king crab", "alaska king crab", "red king crab"] },
  { name: "Shore Crab", scientificName: "Pachygrapsus crassipes", searchTerms: ["shore crab", "rock crab", "tide pool crab"] },
  { name: "Fiddler Crab", scientificName: "Uca", searchTerms: ["fiddler crab", "mud crab", "uca crab"] },
  { name: "Ghost Crab", scientificName: "Ocypode", searchTerms: ["ghost crab", "sand crab", "beach crab"] },
  { name: "Spider Crab", scientificName: "Macrocheira kaempferi", searchTerms: ["japanese spider crab", "giant spider crab", "macrocheira"] },
  { name: "Coconut Crab", scientificName: "Birgus latro", searchTerms: ["coconut crab", "robber crab", "land crab"] },
  { name: "Horseshoe Crab", scientificName: "Limulus polyphemus", searchTerms: ["horseshoe crab", "limulus", "atlantic horseshoe"] },
  { name: "Snow Crab", scientificName: "Chionoecetes opilio", searchTerms: ["snow crab", "chionoecetes", "arctic crab"] },
  { name: "Mangrove Crab", scientificName: "Aratus pisonii", searchTerms: ["mangrove crab", "tree crab", "caribbean crab"] },
  { name: "Decorator Crab", scientificName: "Camposcia retusa", searchTerms: ["decorator crab", "camouflage crab", "reef crab"] },
  { name: "Robber Crab", scientificName: "Birgus latro", searchTerms: ["robber crab", "coconut robber", "island crab"] },
  { name: "Pea Crab", scientificName: "Pinnotheres pisum", searchTerms: ["pea crab", "tiny crab", "oyster crab"] },
  { name: "Boxer Crab", scientificName: "Lybia tessellata", searchTerms: ["boxer crab", "anemone crab", "pom pom crab"] }
];

console.log("🦀 Crab Image Finder - Free Stock Photo Sources\n");
console.log("Here are the crab species and suggested search terms:\n");

crabs.forEach((crab, index) => {
  console.log(`${index + 1}. ${crab.name} (${crab.scientificName})`);
  console.log(`   Search terms: ${crab.searchTerms.join(", ")}`);
  console.log("");
});

console.log("📸 RECOMMENDED FREE STOCK PHOTO SOURCES:");
console.log("");
console.log("1. Unsplash (unsplash.com)");
console.log("   - High quality, free for commercial use");
console.log("   - Search: 'crab', 'marine life', 'ocean creatures'");
console.log("");
console.log("2. Pexels (pexels.com)");
console.log("   - Good variety, free for commercial use");
console.log("   - Search: 'crab', 'sea animals', 'marine biology'");
console.log("");
console.log("3. Pixabay (pixabay.com)");
console.log("   - Mix of amateur and professional");
console.log("   - Search: 'crab', 'crustacean', 'ocean life'");
console.log("");
console.log("4. Wikimedia Commons (commons.wikimedia.org)");
console.log("   - Scientific accuracy, public domain");
console.log("   - Search: scientific names (e.g., 'Callinectes sapidus')");
console.log("");
console.log("🔍 SEARCH STRATEGY:");
console.log("- Start with common names: 'blue crab', 'hermit crab'");
console.log("- Use scientific names for accuracy: 'Callinectes sapidus'");
console.log("- Try habitat terms: 'atlantic crab', 'tide pool crab'");
console.log("- Use descriptive terms: 'marine crab', 'ocean crab'");
console.log("");
console.log("💡 TIPS:");
console.log("- Look for images with clean backgrounds");
console.log("- Prefer images showing the full crab clearly");
console.log("- Consider educational/scientific style images");
console.log("- Check licensing terms (CC0, CC-BY, etc.)");
console.log("");
console.log("Ready to start searching! Open these sites and search for each species.");
