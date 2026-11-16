// CopperEye client types (mirror API payloads)

export interface SessionUser {
  id: string
  email: string
  name: string
  role: "CUSTOMER" | "ENGINEER" | string
  phone: string | null
  postcode: string | null
}

export interface EngineerProfile {
  id: string
  userId: string
  businessName: string
  headline: string | null
  bio: string | null
  tradeTypes: string | null
  coverageArea: string | null
  yearsExperience: number
  accreditations: string | null
  verified: boolean
  credits: number
  jobsCompleted: number
}

export interface MeResponse {
  user: SessionUser | null
  engineerProfile?: EngineerProfile | null
  stats?: { rating: number | null; reviews: number }
}

export interface CustomerJob {
  id: string
  title: string
  category: string
  description: string | null
  town: string | null
  postcode: string
  status: string
  budget: string | null
  propertyType: string | null
  createdAt: string
  createdAtLabel: string
  quoteCount: number
  newQuotes: number
  photoCount: number
  analyzed: boolean
  hasReview: boolean
  awardedEngineer: { name: string; businessName: string | null } | null
}

export interface FeedJob {
  id: string
  title: string
  category: string
  description: string | null
  town: string | null
  postcode: string
  status: string
  budget: string | null
  propertyType: string | null
  preferredDate: string | null
  createdAt: string
  createdAtLabel: string
  photoCount: number
  analyzed: boolean
  briefPreview: string | null
  myQuote: { id: string; amount: number; status: string } | null
  unlocked: boolean
}

export interface MyQuote {
  id: string
  amount: number
  status: string
  message: string | null
  createdAtLabel: string
  jobId: string
  jobTitle: string
  jobCategory: string
  jobStatus: string
  jobTown: string | null
  customerName: string
}

export interface EngineerJobsResponse {
  feed: FeedJob[]
  myQuotes: MyQuote[]
}

export interface SurveyPhoto {
  id: string
  stepId: string
  aiNote: string | null
  dataUrl: string
}

export interface JobDetailResponse {
  job: {
    id: string
    title: string
    category: string
    description: string | null
    town: string | null
    postcode: string
    propertyType: string | null
    budget: string | null
    preferredDate: string | null
    status: string
    createdAt: string
    awardedEngineerId: string | null
    customerName: string
  }
  contact: { name: string; phone: string | null; email: string | null }
  unlocked: boolean
  hasReview?: boolean
  survey: {
    analyzed: boolean
    answers: Record<string, string>
    aiBrief: string | null
    photos: SurveyPhoto[]
  } | null
  quotes: QuoteItem[]
}

export interface QuoteItem {
  id: string
  amount: number
  laborHours: number | null
  materialsNote: string | null
  message: string | null
  status: string
  createdAt: string
  engineerId: string
  engineerName: string
  businessName: string | null
  headline: string | null
  yearsExperience: number
  verified: boolean
  rating: number | null
  reviews: number
}

export interface CreditState {
  balance: number
  transactions: {
    id: string
    amount: number
    type: string
    description: string
    createdAt: string
  }[]
}

export interface ProfileResponse {
  user: SessionUser
  engineerProfile?: EngineerProfile | null
  rating?: number | null
  reviewCount?: number
  reviews?: { id: string; rating: number; comment: string | null; customerName: string; createdAt: string }[]
}
