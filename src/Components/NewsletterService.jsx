// newsletterService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../Firebase Auth/Firebase'; // Adjust path as needed

class NewsletterService {
  constructor() {
    this.subscribersCollection = 'newsletter_subscribers';
    this.campaignsCollection = 'newsletter_campaigns';
    this.templatesCollection = 'newsletter_templates';
  }

  // Subscribe user to newsletter
  async subscribe(email, source = 'website') {
    try {
      // Validate email
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email address');
      }

      // Check if already subscribed
      const existing = await this.getSubscriber(email);
      if (existing) {
        if (existing.status === 'active') {
          throw new Error('Email is already subscribed');
        } else if (existing.status === 'unsubscribed') {
          // Reactivate subscription
          return await this.resubscribe(email);
        }
      }

      // Add new subscriber
      const subscriberData = {
        email: email.toLowerCase().trim(),
        status: 'active',
        source: source,
        subscribeDate: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        preferences: {
          propertyUpdates: true,
          marketInsights: true,
          newsletters: true,
          promotions: false
        },
        metadata: {
          ipAddress: null, // You can capture this on the frontend
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      };

      const docRef = await addDoc(collection(db, this.subscribersCollection), subscriberData);
      
      // Log subscription event
      await this.logEvent('subscribe', email, { source });

      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscriberId: docRef.id
      };

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      throw new Error(error.message || 'Failed to subscribe to newsletter');
    }
  }

  // Unsubscribe user from newsletter
  async unsubscribe(email, reason = 'user_request') {
    try {
      const subscriber = await this.getSubscriber(email);
      if (!subscriber) {
        throw new Error('Email not found in subscribers list');
      }

      await updateDoc(doc(db, this.subscribersCollection, subscriber.id), {
        status: 'unsubscribed',
        unsubscribeDate: serverTimestamp(),
        unsubscribeReason: reason,
        lastUpdated: serverTimestamp()
      });

      // Log unsubscribe event
      await this.logEvent('unsubscribe', email, { reason });

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      };

    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      throw new Error(error.message || 'Failed to unsubscribe from newsletter');
    }
  }

  // Reactivate subscription
  async resubscribe(email) {
    try {
      const subscriber = await this.getSubscriber(email);
      if (!subscriber) {
        throw new Error('Email not found in subscribers list');
      }

      await updateDoc(doc(db, this.subscribersCollection, subscriber.id), {
        status: 'active',
        resubscribeDate: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      // Log resubscribe event
      await this.logEvent('resubscribe', email);

      return {
        success: true,
        message: 'Successfully resubscribed to newsletter'
      };

    } catch (error) {
      console.error('Newsletter resubscribe error:', error);
      throw new Error(error.message || 'Failed to resubscribe to newsletter');
    }
  }

  // Get subscriber by email
  async getSubscriber(email) {
    try {
      const q = query(
        collection(db, this.subscribersCollection),
        where('email', '==', email.toLowerCase().trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };

    } catch (error) {
      console.error('Get subscriber error:', error);
      return null;
    }
  }

  // Get all active subscribers
// In newsletterService.js, replace getActiveSubscribers method:
async getActiveSubscribers() {
  try {
    const q = query(
      collection(db, this.subscribersCollection),
      where('status', '==', 'active')
      // Remove this line temporarily: orderBy('subscribeDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        // Sort in JavaScript instead
        const dateA = a.subscribeDate?.toDate?.() || new Date(0);
        const dateB = b.subscribeDate?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

  } catch (error) {
    console.error('Get active subscribers error:', error);
    throw new Error('Failed to fetch subscribers');
  }
}

  // Update subscriber preferences
  async updatePreferences(email, preferences) {
    try {
      const subscriber = await this.getSubscriber(email);
      if (!subscriber) {
        throw new Error('Subscriber not found');
      }

      await updateDoc(doc(db, this.subscribersCollection, subscriber.id), {
        preferences: {
          ...subscriber.preferences,
          ...preferences
        },
        lastUpdated: serverTimestamp()
      });

      return {
        success: true,
        message: 'Preferences updated successfully'
      };

    } catch (error) {
      console.error('Update preferences error:', error);
      throw new Error('Failed to update preferences');
    }
  }

  // Create newsletter campaign
  async createCampaign(campaignData) {
    try {
      const campaign = {
        ...campaignData,
        createdAt: serverTimestamp(),
        status: 'draft',
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        }
      };

      const docRef = await addDoc(collection(db, this.campaignsCollection), campaign);

      return {
        success: true,
        message: 'Campaign created successfully',
        campaignId: docRef.id
      };

    } catch (error) {
      console.error('Create campaign error:', error);
      throw new Error('Failed to create campaign');
    }
  }

  // Send newsletter to all active subscribers
  async sendNewsletter(campaignId, templateId = null) {
    try {
      // Get campaign details
      const campaignDoc = await getDoc(doc(db, this.campaignsCollection, campaignId));
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found');
      }

      const campaign = campaignDoc.data();
      const subscribers = await this.getActiveSubscribers();

      if (subscribers.length === 0) {
        throw new Error('No active subscribers found');
      }

      // Update campaign status
      await updateDoc(doc(db, this.campaignsCollection, campaignId), {
        status: 'sending',
        sentAt: serverTimestamp()
      });

      // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
      // For now, we'll just log the sending process
      console.log(`Sending newsletter to ${subscribers.length} subscribers`);

      // Simulate sending process
      const batch = writeBatch(db);
      let sentCount = 0;

      for (const subscriber of subscribers) {
        try {
          // Simulate email sending
          await this.sendEmailToSubscriber(subscriber.email, campaign, templateId);
          sentCount++;
          
          // Log send event
          await this.logEvent('sent', subscriber.email, { campaignId });

        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          // Log bounce/error
          await this.logEvent('bounced', subscriber.email, { campaignId, error: error.message });
        }
      }

      // Update campaign stats
      await updateDoc(doc(db, this.campaignsCollection, campaignId), {
        status: 'sent',
        'stats.sent': sentCount,
        completedAt: serverTimestamp()
      });

      return {
        success: true,
        message: `Newsletter sent to ${sentCount} subscribers`,
        sentCount
      };

    } catch (error) {
      console.error('Send newsletter error:', error);
      throw new Error('Failed to send newsletter');
    }
  }

  // Simulate sending email (replace with actual email service)
  async sendEmailToSubscriber(email, campaign, templateId = null) {
    // This is where you'd integrate with SendGrid, Mailgun, etc.
    // For demonstration purposes, we'll just log it
    console.log(`Sending email to: ${email}`);
    console.log(`Subject: ${campaign.subject}`);
    console.log(`Content: ${campaign.content}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  }

  // Get newsletter statistics
  async getNewsletterStats() {
    try {
      // Get subscriber stats
      const subscribersQuery = query(collection(db, this.subscribersCollection));
      const subscribersSnapshot = await getDocs(subscribersQuery);
      
      const stats = {
        totalSubscribers: subscribersSnapshot.size,
        activeSubscribers: 0,
        unsubscribedSubscribers: 0,
        recentSubscribers: 0 // last 30 days
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      subscribersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'active') {
          stats.activeSubscribers++;
          
          if (data.subscribeDate && data.subscribeDate.toDate() > thirtyDaysAgo) {
            stats.recentSubscribers++;
          }
        } else if (data.status === 'unsubscribed') {
          stats.unsubscribedSubscribers++;
        }
      });

      // Get campaign stats
      const campaignsQuery = query(collection(db, this.campaignsCollection));
      const campaignsSnapshot = await getDocs(campaignsQuery);
      
      stats.totalCampaigns = campaignsSnapshot.size;
      stats.campaignStats = {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0
      };

      campaignsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.stats) {
          stats.campaignStats.totalSent += data.stats.sent || 0;
          stats.campaignStats.totalOpened += data.stats.opened || 0;
          stats.campaignStats.totalClicked += data.stats.clicked || 0;
        }
      });

      return stats;

    } catch (error) {
      console.error('Get newsletter stats error:', error);
      throw new Error('Failed to fetch newsletter statistics');
    }
  }

  // Log newsletter events
  async logEvent(event, email, metadata = {}) {
    try {
      await addDoc(collection(db, 'newsletter_events'), {
        event,
        email,
        timestamp: serverTimestamp(),
        metadata
      });
    } catch (error) {
      console.error('Log event error:', error);
    }
  }

  // Utility function to validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Clean up old unsubscribed users (GDPR compliance)
  async cleanupOldUnsubscribers(daysOld = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const q = query(
        collection(db, this.subscribersCollection),
        where('status', '==', 'unsubscribed'),
        where('unsubscribeDate', '<', cutoffDate)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      return {
        success: true,
        message: `Cleaned up ${querySnapshot.size} old unsubscribed users`
      };

    } catch (error) {
      console.error('Cleanup error:', error);
      throw new Error('Failed to cleanup old subscribers');
    }
  }

  // Export subscribers to CSV
  async exportSubscribers() {
    try {
      const subscribers = await this.getActiveSubscribers();
      
      const csvHeader = 'Email,Status,Subscribe Date,Source,Preferences\n';
      const csvData = subscribers.map(sub => {
        const date = sub.subscribeDate?.toDate?.() || new Date();
        const preferences = Object.entries(sub.preferences || {})
          .filter(([_, value]) => value)
          .map(([key, _]) => key)
          .join(';');
        
        return `${sub.email},${sub.status},${date.toISOString()},${sub.source},${preferences}`;
      }).join('\n');

      return csvHeader + csvData;

    } catch (error) {
      console.error('Export subscribers error:', error);
      throw new Error('Failed to export subscribers');
    }
  }
}

// Create singleton instance
const newsletterService = new NewsletterService();

export default newsletterService;

// Export individual methods for easier use
export const {
  subscribe,
  unsubscribe,
  getSubscriber,
  getActiveSubscribers,
  updatePreferences,
  createCampaign,
  sendNewsletter,
  getNewsletterStats,
  exportSubscribers
} = newsletterService;