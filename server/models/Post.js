const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
    enum: ['Technology', 'Business', 'Growth', 'Insights', 'AI', 'Programming', 'Lifestyle']
  }],
  tags: [String],
  featuredImage: {
    type: String
  },
  featuredImageId: {
    type: String
  },
  readTime: {
    type: Number,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  viewHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    count: {
      type: Number,
      default: 1
    }
  }],
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  metaKeywords: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create slug from title before saving
// Using an async pre-hook avoids needing to call `next` and
// prevents errors like "next is not a function" when documents
// are saved via promises. The previous implementation used a
// traditional callback style which could trigger the runtime
// error seen in the logs when `this.save()` was called from
// other methods such as `trackView`.
PostSchema.pre('save', async function() {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

// Method to track a view
PostSchema.methods.trackView = function() {
  this.views += 1;
  
  // Add to view history (today's date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayView = this.viewHistory.find(v => {
    const vDate = new Date(v.date);
    vDate.setHours(0, 0, 0, 0);
    return vDate.getTime() === today.getTime();
  });
  
  if (todayView) {
    todayView.count += 1;
  } else {
    this.viewHistory.push({
      date: today,
      count: 1
    });
  }
  
  // Keep only last 90 days of history
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  this.viewHistory = this.viewHistory.filter(v => v.date > ninetyDaysAgo);
  
  return this.save();
};

module.exports = mongoose.model('Post', PostSchema);
