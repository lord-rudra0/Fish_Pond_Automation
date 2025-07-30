import { storage } from "./storage.js";

async function addTestData() {
  try {
    console.log("Adding test sensor data...");
    
    // Get current time
    const now = new Date();
    const userId = "test-user"; // Use a test user ID
    
    // Add data points for the last 24 hours (every 2 hours)
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 2 * 60 * 60 * 1000); // Every 2 hours
      
      const dummyData = {
        userId: userId,
        timestamp: timestamp,
        ph: Math.random() * 2 + 6.5, // 6.5-8.5
        waterLevel: Math.random() * 30 + 60, // 60-90 cm
        temperature: Math.random() * 8 + 20, // 20-28°C
        nh3: Math.random() * 3, // 0-3 ppm
        turbidity: Math.random() * 25 + 5, // 5-30 NTU
      };
      
      await storage.createSensorReading(dummyData);
      console.log(`Added data point for ${timestamp.toLocaleString()}`);
    }
    
    console.log("✅ Test data added successfully!");
    console.log("You can now view the 24-Hour Trends chart with data.");
    
  } catch (error) {
    console.error("❌ Error adding test data:", error);
  }
}

// Run the script
addTestData(); 