const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Subscriber = require('../models/Subscriber');
const PostViewEvent = require('../models/PostViewEvent');
const crypto = require('crypto');

class AnalyticsService {
  // Get traffic overview data
  async getTrafficOverview(timeRange = 'week') {
    const now = new Date();
    let startDate, groupBy, dateFormat;
    
    // Set date range based on timeRange
    switch(timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6); // exactly 7 points including today
        groupBy = 'day';
        dateFormat = { weekday: 'short' };
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 29); // last 30 days including today
        groupBy = 'day';
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        startDate.setMonth(startDate.getMonth() - 11); // exactly 12 points including current month
        groupBy = 'month';
        dateFormat = { month: 'short' };
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6);
        groupBy = 'day';
        dateFormat = { weekday: 'short' };
    }

    // Aggregate from post view events so "Unique Visitors" is based on real visitor identity.
    const viewEvents = await PostViewEvent.find(
      { viewedAt: { $gte: startDate, $lte: now } },
      { viewedAt: 1, visitorId: 1, _id: 0 }
    );

    const bucketMap = new Map();

    if (viewEvents.length > 0) {
      viewEvents.forEach(event => {
        const viewedAt = new Date(event.viewedAt);
        const key = this.getBucketKey(viewedAt, groupBy);
        if (!bucketMap.has(key)) {
          bucketMap.set(key, { views: 0, visitors: new Set() });
        }
        const bucket = bucketMap.get(key);
        bucket.views += 1;
        if (event.visitorId) {
          bucket.visitors.add(event.visitorId);
        }
      });
    } else {
      // Backward-compatible fallback for older data before PostViewEvent was introduced.
      const posts = await Post.find(
        { published: true },
        { viewHistory: 1, _id: 1 }
      );

      posts.forEach(post => {
        if (!Array.isArray(post.viewHistory)) {
          return;
        }

        post.viewHistory.forEach(view => {
          const viewedAt = new Date(view.date);
          if (viewedAt < startDate || viewedAt > now) {
            return;
          }

          const key = this.getBucketKey(viewedAt, groupBy);
          if (!bucketMap.has(key)) {
            bucketMap.set(key, { views: 0, visitors: new Set() });
          }

          const bucket = bucketMap.get(key);
          const count = Number(view.count) || 0;
          bucket.views += count;

          // Fallback unique visitors proxy when true visitor events do not exist.
          if (count > 0) {
            bucket.visitors.add(`${key}-${String(post._id)}`);
          }
        });
      });
    }

    const result = {
      labels: [],
      views: [],
      visitors: []
    };

    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const key = this.getBucketKey(currentDate, groupBy);
      const label = currentDate.toLocaleDateString('en-US', dateFormat);
      const bucket = bucketMap.get(key);

      result.labels.push(label);
      result.views.push(bucket ? bucket.views : 0);
      result.visitors.push(bucket ? bucket.visitors.size : 0);

      if (groupBy === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return result;
  }

  // Get quick stats
  async getQuickStats() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Calendar week (Sunday -> Saturday) and calendar month boundaries.
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const posts = await Post.find(
      { published: true },
      { views: 1, readTime: 1, viewHistory: 1 }
    );

    let viewsToday = 0;
    let viewsThisWeek = 0;
    let viewsThisMonth = 0;
    let totalViews = 0;
    let totalReadTime = 0;

    posts.forEach(post => {
      totalViews += Number(post.views) || 0;
      totalReadTime += Number(post.readTime) || 0;

      if (!Array.isArray(post.viewHistory)) {
        return;
      }

      post.viewHistory.forEach(view => {
        const viewDate = new Date(view.date);
        const count = Number(view.count) || 0;

        if (viewDate >= startOfToday && viewDate <= now) {
          viewsToday += count;
        }
        if (viewDate >= startOfWeek && viewDate <= now) {
          viewsThisWeek += count;
        }
        if (viewDate >= startOfMonth && viewDate <= now) {
          viewsThisMonth += count;
        }

      });
    });

    // Use persisted post-view events for behavior analytics over the last 30 days.
    const behaviorWindowStart = new Date(now);
    behaviorWindowStart.setDate(behaviorWindowStart.getDate() - 30);

    const viewEvents = await PostViewEvent.find(
      { viewedAt: { $gte: behaviorWindowStart, $lte: now } },
      { visitorId: 1, post: 1, viewedAt: 1, _id: 0 }
    ).sort({ visitorId: 1, viewedAt: 1 });

    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ status: 'pending' });
    const totalSubscribers = await Subscriber.countDocuments({ status: 'active' });
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ published: true });

    const avgReadTime = posts.length ? +(totalReadTime / posts.length).toFixed(1) : 0;
    const visitorDays = new Map();
    const sessionsByVisitor = new Map();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    viewEvents.forEach(event => {
      const visitorId = event.visitorId;
      const viewedAt = new Date(event.viewedAt);
      const dayKey = viewedAt.toISOString().slice(0, 10);
      const postId = String(event.post);

      if (!visitorDays.has(visitorId)) {
        visitorDays.set(visitorId, new Set());
      }
      visitorDays.get(visitorId).add(dayKey);

      if (!sessionsByVisitor.has(visitorId)) {
        sessionsByVisitor.set(visitorId, []);
      }
      const sessions = sessionsByVisitor.get(visitorId);
      const lastSession = sessions[sessions.length - 1];

      if (
        !lastSession ||
        viewedAt.getTime() - lastSession.lastAt.getTime() > THIRTY_MINUTES
      ) {
        sessions.push({
          startedAt: viewedAt,
          lastAt: viewedAt,
          postIds: new Set([postId]),
          views: 1
        });
      } else {
        lastSession.lastAt = viewedAt;
        lastSession.postIds.add(postId);
        lastSession.views += 1;
      }
    });

    const totalVisitors = visitorDays.size;
    const returningVisitorCount = Array.from(visitorDays.values()).filter(days => days.size > 1).length;

    let totalSessions = 0;
    let bouncedSessions = 0;
    sessionsByVisitor.forEach(sessions => {
      totalSessions += sessions.length;
      sessions.forEach(session => {
        if (session.views <= 1 || session.postIds.size <= 1) {
          bouncedSessions += 1;
        }
      });
    });

    const returningReaders = totalVisitors
      ? +((returningVisitorCount / totalVisitors) * 100).toFixed(1)
      : 0;
    const bounceRate = totalSessions
      ? +((bouncedSessions / totalSessions) * 100).toFixed(1)
      : 0;

    return {
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      totalViews,
      totalComments,
      pendingComments,
      totalSubscribers,
      totalPosts,
      publishedPosts,
      avgReadTime,
      bounceRate: Math.max(0, Math.min(100, bounceRate)),
      returningReaders: Math.max(0, Math.min(100, returningReaders))
    };
  }

  // Format date based on grouping
  formatDate(date, groupBy, format) {
    if (groupBy === 'day') {
      return date.toLocaleDateString('en-US', format);
    } else if (groupBy === 'month') {
      return date.toLocaleDateString('en-US', format);
    }
    return date.toISOString().split('T')[0];
  }

  // Fill in missing dates in the range
  fillDateRange(startDate, endDate, viewData, visitorData, groupBy, dateFormat) {
    const result = {
      labels: [],
      views: [],
      visitors: []
    };

    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const key = this.formatDate(currentDate, groupBy, dateFormat);
      result.labels.push(key);
      result.views.push(viewData[key] || 0);
      result.visitors.push(visitorData[key] || 0);
      
      if (groupBy === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (groupBy === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return result;
  }

  // Track a post view (call this when a post is viewed)
  async trackPostView(postId, req = null) {
    try {
      const post = await Post.findById(postId);
      if (post) {
        // Check if categories are valid before saving
        const validCategories = ['Technology', 'Business', 'Growth', 'Insights', 'AI', 'Programming', 'Lifestyle'];
        const invalidCategories = post.categories?.filter(cat => !validCategories.includes(cat));
        
        if (invalidCategories && invalidCategories.length > 0) {
          console.warn(`Post ${postId} has invalid categories:`, invalidCategories);
          // Fix invalid categories on the fly
          post.categories = post.categories.map(cat => 
            validCategories.includes(cat) ? cat : 'Growth' // Default to Growth
          );
        }
        
        await post.trackView();

        // Persist event data to support reliable bounce/returning analytics.
        const visitorId = this.getVisitorId(req);
        if (visitorId) {
          await PostViewEvent.create({
            post: post._id,
            visitorId,
            viewedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  getBucketKey(date, groupBy) {
    if (groupBy === 'month') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
    return date.toISOString().slice(0, 10);
  }

  getVisitorId(req) {
    if (!req) return null;

    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : (forwardedFor || req.ip || req.connection?.remoteAddress || '');
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';

    const rawId = `${ip}|${userAgent}|${acceptLanguage}`;
    if (!rawId.trim()) {
      return null;
    }

    return crypto.createHash('sha256').update(rawId).digest('hex');
  }
}

module.exports = new AnalyticsService();
