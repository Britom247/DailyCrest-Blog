const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../models/Post');

dotenv.config();

const migrateViewHistory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const posts = await Post.find({ viewHistory: { $exists: false } });
    console.log(`Found ${posts.length} posts without view history`);

    for (const post of posts) {
      // Create a view history entry based on total views
      if (post.views > 0) {
        // Distribute views over the last 30 days
        const viewsPerDay = Math.ceil(post.views / 30);
        const viewHistory = [];
        
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          viewHistory.push({
            date,
            count: Math.floor(Math.random() * viewsPerDay) + 1
          });
        }
        
        // Use updateOne with $set to bypass middleware
        await Post.updateOne(
          { _id: post._id },
          { $set: { viewHistory: viewHistory } }
        );
        console.log(`Migrated post: ${post.title} (${post.views} views)`);
      } else {
        // Set empty view history
        await Post.updateOne(
          { _id: post._id },
          { $set: { viewHistory: [] } }
        );
        console.log(`Migrated post: ${post.title} (no views)`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateViewHistory();