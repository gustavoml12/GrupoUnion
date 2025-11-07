import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ReferrerInfo {
  id: string;
  full_name?: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'VISITOR' | 'MEMBER' | 'HUB' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  email_verified: boolean;
  referral_code: string;
  referred_by_id?: string;
  referred_by?: ReferrerInfo;
  created_at: string;
}

export interface Member {
  id: string;
  user_id: string;
  company_name: string;
  business_category: string;
  company_description: string | null;
  website: string | null;
  business_phone: string | null;
  business_email: string | null;
  city: string | null;
  state: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  profile_photo_url: string | null;
  status: string;
  reputation_score: number;
  total_referrals_given: number;
  total_referrals_received: number;
  total_deals_closed: number;
  created_at: string;
}

export interface MemberCreateData {
  company_name: string;
  business_category: string;
  company_description?: string;
  website?: string;
  business_phone?: string;
  business_email?: string;
  city?: string;
  state?: string;
}

export interface MemberUpdateData {
  company_name?: string;
  business_category?: string;
  company_description?: string;
  website?: string;
  business_phone?: string;
  business_email?: string;
  city?: string;
  state?: string;
  linkedin_url?: string;
  instagram_url?: string;
  profile_photo_url?: string;
}

export interface ApplicationData {
  company_name: string;
  business_category: string;
  company_description?: string;
  website?: string;
  business_phone?: string;
  business_email?: string;
  city?: string;
  state?: string;
  linkedin_url?: string;
  instagram_url?: string;
  application_reason: string;
}

export interface Payment {
  id: string;
  user_id: string;
  payment_type: string;
  amount: number;
  status: string;
  pix_key: string | null;
  payment_proof_url: string | null;
  payment_date: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  reference_month: string | null;
  due_date: string | null;
  created_at: string;
}

export interface PIXInfo {
  pix_key: string;
  amount: number;
  description: string;
  instructions: string[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface OnboardingVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  provider: 'YOUTUBE' | 'PANDA' | 'VIMEO';
  thumbnail_url?: string;
  duration_minutes?: number;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_progress?: VideoProgress;
}

export interface OnboardingVideoCreate {
  title: string;
  description?: string;
  video_url: string;
  provider: 'YOUTUBE' | 'PANDA' | 'VIMEO';
  thumbnail_url?: string;
  duration_minutes?: number;
  order?: number;
  is_active?: boolean;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  completed: boolean;
  completed_at?: string;
  started_at: string;
  updated_at: string;
}

export interface VideoStats {
  total_videos: number;
  completed_videos: number;
  pending_videos: number;
  completion_percentage: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
    });
  }

  async getAllUsers(): Promise<User[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch users');
    }

    return response.json();
  }

  async getPendingVisitors(): Promise<User[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch pending visitors');
    }

    return response.json();
  }

  async getAllMembers(): Promise<User[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch members');
    }

    return response.json();
  }

  async approveVisitor(userId: string): Promise<User> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/${userId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to approve visitor');
    }

    return response.json();
  }

  async rejectVisitor(userId: string): Promise<User> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/${userId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reject visitor');
    }

    return response.json();
  }

  async getMemberStatistics(userId: string): Promise<any> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/${userId}/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch member statistics');
    }

    return response.json();
  }

  async updateUser(userId: string, data: { full_name?: string; phone?: string; status?: string }): Promise<User> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update user');
    }

    return response.json();
  }

  async createMemberProfile(data: MemberCreateData): Promise<Member> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create member profile');
    }

    return response.json();
  }

  async getMyMemberProfile(): Promise<Member> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/profile/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch member profile');
    }

    return response.json();
  }

  async updateMyMemberProfile(data: MemberUpdateData): Promise<Member> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/members/profile/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update member profile');
    }

    return response.json();
  }

  async submitApplication(data: ApplicationData): Promise<Member> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit application');
    }

    return response.json();
  }

  async uploadPaymentFile(file: File): Promise<{ url: string; filename: string; size: number }> {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/v1/upload/payment-proof`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload file');
    }

    return response.json();
  }

  async uploadPaymentProof(proofUrl: string, paymentDate?: string): Promise<Payment> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding/payment/proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_proof_url: proofUrl,
        payment_date: paymentDate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload payment proof');
    }

    return response.json();
  }

  async getMyPayment(): Promise<Payment> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding/payment/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch payment');
    }

    return response.json();
  }

  async getPIXInfo(): Promise<PIXInfo> {
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding/pix-info`);

    if (!response.ok) {
      throw new Error('Failed to fetch PIX info');
    }

    return response.json();
  }

  async getPendingPayments(): Promise<Payment[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding/payments/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch pending payments');
    }

    return response.json();
  }

  async verifyPayment(paymentId: string, approved: boolean, rejectionReason?: string): Promise<Payment> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding/payments/${paymentId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        approved,
        rejection_reason: rejectionReason,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to verify payment');
    }

    return response.json();
  }

  // Onboarding Videos
  async getOnboardingVideos(): Promise<OnboardingVideo[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch videos');
    }

    return response.json();
  }

  async getAllVideosAdmin(includeInactive: boolean = false): Promise<OnboardingVideo[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos/all?include_inactive=${includeInactive}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch videos');
    }

    return response.json();
  }

  async createVideo(data: OnboardingVideoCreate): Promise<OnboardingVideo> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create video');
    }

    return response.json();
  }

  async updateVideo(videoId: string, data: Partial<OnboardingVideoCreate>): Promise<OnboardingVideo> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos/${videoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update video');
    }

    return response.json();
  }

  async deleteVideo(videoId: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete video');
    }
  }

  async markVideoStarted(videoId: string): Promise<VideoProgress> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos/${videoId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark video as started');
    }

    return response.json();
  }

  async markVideoCompleted(videoId: string): Promise<VideoProgress> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos/${videoId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark video as completed');
    }

    return response.json();
  }

  async getVideoStats(): Promise<VideoStats> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/onboarding-videos/stats/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch video stats');
    }

    return response.json();
  }

  // Meeting methods
  async createMeeting(meetingData: MeetingCreate): Promise<Meeting> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create meeting');
    }

    return response.json();
  }

  async createMeetingAsHub(memberId: string, meetingData: any): Promise<Meeting> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/hub/create/${memberId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create meeting');
    }

    return response.json();
  }

  async getMyMeetings(includeCancelled: boolean = false): Promise<Meeting[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/my-meetings?include_cancelled=${includeCancelled}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch meetings');
    }

    return response.json();
  }

  async cancelMyMeeting(meetingId: string, reason: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/my-meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cancellation_reason: reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to cancel meeting');
    }
  }

  // Hub/Admin meeting methods
  async getAllMeetings(filters?: {
    status?: string;
    meetingType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<MeetingWithMember[]> {
    const token = getToken();
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status_filter', filters.status);
    if (filters?.meetingType) params.append('meeting_type', filters.meetingType);
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters?.dateTo) params.append('date_to', filters.dateTo);
    
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/all?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch meetings');
    }

    return response.json();
  }

  async getMeetingStats(): Promise<MeetingStats> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch meeting stats');
    }

    return response.json();
  }

  async confirmMeeting(meetingId: string, data: {
    meeting_link?: string;
    location?: string;
    hub_notes?: string;
  }): Promise<Meeting> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/${meetingId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to confirm meeting');
    }

    return response.json();
  }

  async completeMeeting(meetingId: string, hubNotes?: string): Promise<Meeting> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/${meetingId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ hub_notes: hubNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to complete meeting');
    }

    return response.json();
  }

  async cancelMeetingAdmin(meetingId: string, reason: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/meetings/${meetingId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cancellation_reason: reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to cancel meeting');
    }
  }

  // Notification methods
  async getMyNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<Notification[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/notifications/me?unread_only=${unreadOnly}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch notifications');
    }

    return response.json();
  }

  async getNotificationStats(): Promise<NotificationStats> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/notifications/me/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch notification stats');
    }

    return response.json();
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark notification as read');
    }

    return response.json();
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/notifications/me/read-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete notification');
    }
  }

  // Profile methods
  async getProfileCompletion(): Promise<ProfileCompletion> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/profile/completion`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch profile completion');
    }

    return response.json();
  }

  async updateProfile(profileData: ProfileUpdate): Promise<{ message: string; profile_completed: number }> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/profile/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    return response.json();
  }

  async uploadProfilePhoto(file: File): Promise<{ message: string; photo_url: string; profile_completed: number }> {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/v1/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload profile photo');
    }

    return response.json();
  }

  async deleteProfilePhoto(): Promise<{ message: string; profile_completed: number }> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/profile/photo`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete profile photo');
    }

    return response.json();
  }

  // Visit methods
  async createVisit(visitData: VisitCreate): Promise<Visit> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(visitData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create visit');
    }

    return response.json();
  }

  async getMyVisits(asVisitor: boolean = true, statusFilter?: string): Promise<Visit[]> {
    const token = getToken();
    let url = `${this.baseUrl}/api/v1/visits/my-visits?as_visitor=${asVisitor}`;
    if (statusFilter) {
      url += `&status_filter=${statusFilter}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch visits');
    }

    return response.json();
  }

  async getMyVisitStats(): Promise<VisitStats> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/visits/my-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch visit stats');
    }

    return response.json();
  }

  async getVisit(visitId: string): Promise<Visit> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/visits/${visitId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch visit');
    }

    return response.json();
  }

  async completeVisit(visitId: string, completionData: VisitComplete): Promise<Visit> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/visits/${visitId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(completionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to complete visit');
    }

    return response.json();
  }

  async cancelVisit(visitId: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/visits/${visitId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to cancel visit');
    }
  }

  // Collective Meeting methods
  async createCollectiveMeeting(meetingData: CollectiveMeetingCreate): Promise<CollectiveMeeting> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/collective-meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create collective meeting');
    }

    return response.json();
  }

  async getCollectiveMeetings(upcomingOnly: boolean = false): Promise<CollectiveMeeting[]> {
    const token = getToken();
    const url = `${this.baseUrl}/api/v1/collective-meetings?upcoming_only=${upcomingOnly}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch collective meetings');
    }

    return response.json();
  }

  async getCollectiveMeeting(meetingId: string): Promise<CollectiveMeetingWithAttendees> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/collective-meetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch collective meeting');
    }

    return response.json();
  }

  async getCollectiveMeetingStats(): Promise<CollectiveMeetingStats> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/collective-meetings/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch meeting stats');
    }

    return response.json();
  }

  async confirmMeetingAttendance(meetingId: string, confirmed: boolean): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/collective-meetings/${meetingId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ confirmed }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to confirm attendance');
    }
  }

  async markMeetingAttendance(meetingId: string, memberIds: string[]): Promise<CollectiveMeeting> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/collective-meetings/${meetingId}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ member_ids: memberIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark attendance');
    }

    return response.json();
  }

  async completeCollectiveMeeting(meetingId: string, notes?: string): Promise<CollectiveMeeting> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/collective-meetings/${meetingId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to complete collective meeting');
    }

    return response.json();
  }

  async cancelCollectiveMeeting(meetingId: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/collective-meetings/${meetingId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to cancel meeting');
    }
  }
}

// Meeting interfaces
export interface Meeting {
  id: string;
  member_id: string;
  scheduled_by_id?: string;
  confirmed_by_id?: string;
  meeting_type: 'ONLINE' | 'PRESENCIAL';
  scheduled_date: string;
  duration_minutes: string;
  location?: string;
  meeting_link?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  member_notes?: string;
  hub_notes?: string;
  cancellation_reason?: string;
  google_calendar_event_id?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
}

export interface MeetingWithMember extends Meeting {
  member: {
    id: string;
    company_name: string;
    business_category: string;
    user_name: string;
    user_email: string;
  };
}

export interface MeetingCreate {
  meeting_type: 'ONLINE' | 'PRESENCIAL';
  scheduled_date: string;
  duration_minutes?: string;
  location?: string;
  meeting_link?: string;
  member_notes?: string;
}

export interface MeetingStats {
  total_meetings: number;
  pending_meetings: number;
  confirmed_meetings: number;
  completed_meetings: number;
  cancelled_meetings: number;
  upcoming_meetings: number;
}

// Notification interfaces
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
  notifications_by_type: { [key: string]: number };
}

// Profile interfaces
export interface ProfileCompletion {
  completion_percentage: number;
  suggestions: ProfileSuggestion[];
}

export interface ProfileSuggestion {
  field: string;
  label: string;
  priority: string;
  description: string;
}

export interface ProfileUpdate {
  bio?: string;
  company_description?: string;
  website?: string;
  business_phone?: string;
  business_email?: string;
  city?: string;
  state?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  interests?: string;
  skills?: string;
}

// Visit interfaces
export interface Visit {
  id: string;
  visitor_id: string;
  visited_id: string;
  purpose: string;
  visit_date: string;
  duration_minutes: number;
  location?: string;
  status: string;
  visitor_notes?: string;
  visit_summary?: string;
  services_learned?: string;
  potential_referrals?: string;
  networking_quality?: number;
  follow_up_needed?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface VisitCreate {
  visited_id: string;
  purpose: string;
  visit_date: string;
  duration_minutes: number;
  location?: string;
  visitor_notes?: string;
}

export interface VisitComplete {
  visit_summary: string;
  services_learned?: string;
  potential_referrals?: string;
  networking_quality?: number;
  follow_up_needed?: string;
  follow_up_date?: string;
}

export interface VisitStats {
  total_visits: number;
  visits_made: number;
  visits_received: number;
  completed_visits: number;
  pending_visits: number;
  average_networking_quality?: number;
  total_potential_referrals: number;
}

// Collective Meeting interfaces
export interface CollectiveMeeting {
  id: string;
  title: string;
  description?: string;
  meeting_type: 'ONLINE' | 'PRESENCIAL';
  scheduled_date: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  status: string;
  created_by_id: string;
  agenda?: string;
  notes?: string;
  total_invited: number;
  total_confirmed: number;
  total_attended: number;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  completed_at?: string;
}

export interface CollectiveMeetingCreate {
  title: string;
  description?: string;
  meeting_type: 'ONLINE' | 'PRESENCIAL';
  scheduled_date: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  agenda?: string;
}

export interface MeetingAttendee {
  member_id: string;
  member_name: string;
  company_name: string;
  confirmed: boolean;
  attended: boolean;
  confirmed_at?: string;
}

export interface CollectiveMeetingWithAttendees extends CollectiveMeeting {
  attendees: MeetingAttendee[];
}

export interface CollectiveMeetingStats {
  total_meetings: number;
  upcoming_meetings: number;
  past_meetings: number;
  cancelled_meetings: number;
  average_attendance_rate?: number;
}

export const api = new ApiClient(API_URL);
